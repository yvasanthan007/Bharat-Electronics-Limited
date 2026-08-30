#!/usr/bin/env python3
"""
Idempotent Excel -> Firestore employee importer.

Imports BEL_Employee_Dataset_500.xlsx (sheet "Employees", 500 records) into the
`employees` collection of the Firebase project configured in .env.local.

Key properties
--------------
* Firestore is the application's live database — this script only seeds it
  from Excel. Excel is never read at application runtime.
* Deduplication: every row is written to document ID = `Employee ID`
  (e.g. BEL1001), so the script can be re-run safely and never creates
  duplicate employees.
* Merge semantics: DID-related fields (did, walletAddress, walletId,
  publicKey, didCreatedAt, didStatus) that were already set on an existing
  Firestore document (e.g. created by the Admin UI) are NEVER overwritten
  with empty/stale Excel values.
* No private keys: only public DID/wallet data is handled. Private keys stay
  in the employee's local secure wallet storage and are rejected by both the
  app sanitizer and Firestore rules.
* Configuration comes from the project's existing .env.local
  (VITE_FIREBASE_PROJECT_ID / VITE_FIREBASE_API_KEY). Firebase Admin/service
  account credentials are optional and supplied via CLI/env — never hardcoded.

Usage
-----
    python import_employees_500.py                       # auto target (emulator if running, else live)
    python import_employees_500.py --excel path.xlsx     # custom workbook
    python import_employees_500.py --service-account sa.json   # live, admin writes
    python import_employees_500.py --dry-run             # parse + report, no writes
"""
import argparse
import json
import os
import socket
import sys
import urllib.error
import urllib.request
import warnings
from datetime import datetime, timezone

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
ENV_LOCAL_PATH = os.path.join(PROJECT_ROOT, ".env.local")
DEFAULT_EXCEL = r"C:\Users\Vasanthan Y\Downloads\BEL_Employee_Dataset_500.xlsx"

COLLECTION = "employees"
BATCH_SIZE = 20

# Excel column header -> Firestore camelCase field (fields mirror Excel columns)
COLUMN_MAP = {
    "Employee ID": "employeeId",
    "Employee Name": "employeeName",
    "Email": "email",
    "Phone": "phone",
    "Department": "department",
    "Designation": "designation",
    "Role": "role",
    "Location": "location",
    "Joining Year": "joiningYear",
    "Employment Status": "employmentStatus",
    "DID Status": "didStatus",
    "DID": "did",
    "Wallet Address": "walletAddress",
}

# App-facing aliases so frontend services (firebaseEmployeeService) and the
# dashboards can use `name` / `status` without touching the Excel columns.
ALIAS_MAP = {
    "employeeName": "name",
    "employmentStatus": "status",
}

# Fields managed by the application's DID lifecycle. Once set on an existing
# document the importer will not overwrite them with Excel values.
PROTECTED_FIELDS = {
    "did",
    "walletAddress",
    "walletId",
    "publicKey",
    "didCreatedAt",
    "didStatus",
}

# Private-key-like columns that must never reach Firestore (defence in depth).
FORBIDDEN_COLUMNS = {"Private Key", "PrivateKey", "privateKey", "Seed Phrase", "Mnemonic"}


# --------------------------------------------------------------------------- #
# Configuration                                                               #
# --------------------------------------------------------------------------- #
def load_env_local(path=ENV_LOCAL_PATH):
    """Parse the project's existing .env.local (KEY="value" lines)."""
    cfg = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                cfg[key.strip()] = value.strip().strip('"').strip("'")
    return cfg


ENV = load_env_local()
PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID") or ENV.get("VITE_FIREBASE_PROJECT_ID", "bel-sih-b9392")
API_KEY = os.environ.get("FIREBASE_API_KEY") or ENV.get("VITE_FIREBASE_API_KEY", "")


# --------------------------------------------------------------------------- #
# Excel parsing                                                               #
# --------------------------------------------------------------------------- #
def read_records(excel_path, sheet_name=None):
    """Read the employee sheet and convert each row to a plain dict."""
    xl = pd.ExcelFile(excel_path)
    if sheet_name is None:
        sheet_name = "Employees" if "Employees" in xl.sheet_names else xl.sheet_names[0]
    df = pd.read_excel(xl, sheet_name=sheet_name)

    unexpected = [c for c in FORBIDDEN_COLUMNS if c in df.columns]
    if unexpected:
        raise RuntimeError(f"Workbook contains forbidden credential columns: {unexpected}")

    missing = [c for c in COLUMN_MAP if c not in df.columns]
    if missing:
        print(f"  ! Note: workbook is missing expected columns: {missing}")

    records = []
    for _, row in df.iterrows():
        rec = {}
        for col, field in COLUMN_MAP.items():
            if col not in df.columns:
                continue
            val = row[col]
            if pd.isna(val):
                continue  # empty cell -> field omitted (never written as null)
            if isinstance(val, (np.integer,)):
                rec[field] = int(val)
            elif isinstance(val, (np.floating,)):
                rec[field] = float(val)
            elif isinstance(val, pd.Timestamp):
                rec[field] = val.isoformat()
            else:
                rec[field] = str(val).strip()
        # app-facing aliases
        for src, alias in ALIAS_MAP.items():
            if src in rec:
                rec[alias] = rec[src]
        records.append(rec)
    return records, sheet_name


def dedupe_by_employee_id(records):
    """Keep the first row per Employee ID; report duplicates."""
    seen, unique, dupes = set(), [], []
    for rec in records:
        emp_id = str(rec.get("employeeId", "")).strip()
        if not emp_id:
            dupes.append(("<missing>", "row without Employee ID skipped"))
            continue
        if emp_id in seen:
            dupes.append((emp_id, "duplicate row skipped"))
            continue
        seen.add(emp_id)
        unique.append(rec)
    return unique, dupes


# --------------------------------------------------------------------------- #
# Firestore REST helpers                                                      #
# --------------------------------------------------------------------------- #
def http_request(url, data=None, method="GET", token=None):
    hdrs = {"Content-Type": "application/json"}
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            raw = json.loads(raw)
        except Exception:
            pass
        return exc.code, raw


def unwrap_fields(typed_fields):
    """Firestore REST typed fields -> plain python dict."""
    plain = {}
    for key, spec in (typed_fields or {}).items():
        (kind, value), = spec.items()
        if kind == "stringValue":
            plain[key] = value
        elif kind == "integerValue":
            plain[key] = int(value)
        elif kind == "doubleValue":
            plain[key] = float(value)
        elif kind == "booleanValue":
            plain[key] = value
        elif kind == "nullValue":
            plain[key] = None
        else:
            plain[key] = value  # timestamps etc. kept as-is for comparison
    return plain


def wrap_value(value):
    if value is None:
        return {"nullValue": None}
    if isinstance(value, bool):
        return {"booleanValue": value}
    if isinstance(value, int):
        return {"integerValue": str(value)}
    if isinstance(value, float):
        return {"doubleValue": value}
    return {"stringValue": str(value)}


def wrap_fields(plain):
    return {k: wrap_value(v) for k, v in plain.items() if v is not None}


def get_doc(base_url, token, doc_path):
    status, body = http_request(f"{base_url}/{doc_path}", token=token)
    if status == 200:
        return unwrap_fields(body.get("fields"))
    return None


def commit_batch(base_url, token, writes):
    url = f"{base_url}/projects/{PROJECT_ID}/databases/(default)/documents:commit"
    status, body = http_request(url, data={"writes": writes}, method="POST", token=token)
    return status, body


class PermissionFallback:
    """Lazily obtains an auth token the first time Firestore denies a write."""

    def __init__(self, token):
        self.token = token
        self.tried_anonymous = False

    def on_denied(self):
        """Called on a 403; returns a fresh token or raises with guidance."""
        if self.token is None and not self.tried_anonymous:
            self.tried_anonymous = True
            print("  ! Writes denied without credentials — signing in anonymously…")
            try:
                self.token = sign_in_anonymous()
                return self.token
            except RuntimeError as exc:
                raise RuntimeError(
                    "Firestore rejected the write and anonymous sign-in is "
                    f"unavailable ({exc}). Options: enable Anonymous Auth in the "
                    "Firebase console, pass --service-account <key.json>, or "
                    "enable open rules for this prototype."
                )
        raise RuntimeError("Firestore write denied (PERMISSION_DENIED) even after authentication.")


def compute_patch(record, existing):
    """Fields that must be written for an existing document (merge semantics)."""
    patch = {}
    for field, value in record.items():
        if field in PROTECTED_FIELDS and existing.get(field) not in (None, ""):
            continue  # app-managed DID data wins over the spreadsheet
        if existing.get(field) != value:
            patch[field] = value
    return patch


# --------------------------------------------------------------------------- #
# Authentication                                                              #
# --------------------------------------------------------------------------- #
def sign_in_anonymous():
    if not API_KEY:
        raise RuntimeError("No VITE_FIREBASE_API_KEY found in .env.local")
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    status, body = http_request(url, data={"signInAnonymously": True}, method="POST")
    if status != 200:
        raise RuntimeError(f"Anonymous sign-in failed ({status}): {json.dumps(body)[:300]}")
    return body["idToken"]


def service_account_token(sa_path):
    """OAuth access token from a service-account key file (admin-level writes)."""
    try:
        import google.auth
        from google.auth.transport.requests import Request as GoogleRequest
    except ImportError:
        raise RuntimeError("google-auth is required for --service-account (pip install google-auth)")
    os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", sa_path)
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/datastore"])
    creds.refresh(GoogleRequest())
    return creds.token


def determine_target():
    """Return ('emulator', base_url) or ('live', base_url)."""
    if os.environ.get("FIREBASE_UPLOAD_MODE") == "live":
        return "live", "https://firestore.googleapis.com/v1"
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    try:
        sock.connect(("localhost", 8080))
        return "emulator", "http://localhost:8080/v1"
    except (socket.error, OSError):
        return "live", "https://firestore.googleapis.com/v1"
    finally:
        sock.close()


# --------------------------------------------------------------------------- #
# Main import routine                                                         #
# --------------------------------------------------------------------------- #
def import_employees(excel_path, sheet_name, token, base_url, dry_run=False):
    records, sheet_used = read_records(excel_path, sheet_name)
    records, dupes = dedupe_by_employee_id(records)

    print(f"  Sheet    : {sheet_used}")
    print(f"  Rows     : {len(records)} unique employee records ({len(dupes)} skipped)")
    for emp_id, reason in dupes[:5]:
        print(f"             - {reason}: {emp_id}")
    print()

    base = f"projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}"
    created = updated = unchanged = failed = 0
    failures = []
    writes = []
    fallback = PermissionFallback(token)

    def flush():
        nonlocal failed, fallback
        if not writes:
            return
        if dry_run:
            writes.clear()
            return
        i = 0
        while i < len(writes):
            chunk = writes[i:i + BATCH_SIZE]
            status, body = commit_batch(base_url, fallback.token, chunk)
            if status == 403:
                fallback.on_denied()  # acquires auth token, raises with guidance if impossible
                continue  # retry the same chunk with the new token
            if status != 200:
                failed += len(chunk)
                failures.append(str(body)[:200])
            i += len(chunk)
        writes.clear()

    for rec in records:
        emp_id = str(rec["employeeId"]).strip()
        doc_path = f"{base}/{emp_id}"
        existing = get_doc(base_url, token, doc_path) if not dry_run else None

        if existing is None:
            fields = dict(rec)
            fields["importedAt"] = datetime.now(timezone.utc).isoformat()
            fields["source"] = os.path.basename(excel_path)
            writes.append({"update": {"name": doc_path, "fields": wrap_fields(fields)}})
            created += 1
            if len(writes) >= BATCH_SIZE:
                flush()
        else:
            patch = compute_patch(rec, existing)
            if not patch:
                unchanged += 1
                continue
            patch["importedAt"] = datetime.now(timezone.utc).isoformat()
            writes.append({
                "update": {"name": doc_path, "fields": wrap_fields(patch)},
                "updateMask": {"fieldPaths": sorted(patch.keys())},
            })
            updated += 1
            if len(writes) >= BATCH_SIZE:
                flush()

    flush()
    return created, updated, unchanged, failed, failures


def verify_retrieval(base_url, token, sample_ids):
    """Confirm employee records are retrievable from Firestore."""
    print("\n  Verification — reading sample documents back:")
    ok = 0
    for emp_id in sample_ids:
        doc = get_doc(
            base_url, token,
            f"projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}/{emp_id}",
        )
        if doc and doc.get("employeeId") == emp_id:
            ok += 1
            print(f"    [OK] {emp_id}: name={doc.get('employeeName')!r} role={doc.get('role')!r} "
                  f"didStatus={doc.get('didStatus')!r} dept={doc.get('department')!r}")
        else:
            print(f"    [FAIL] {emp_id}: not retrievable")
    return ok


def main():
    parser = argparse.ArgumentParser(description="Idempotent Excel -> Firestore employee import")
    parser.add_argument("--excel", default=DEFAULT_EXCEL, help="Path to the employee workbook")
    parser.add_argument("--sheet", default=None, help="Sheet name (default: Employees / first sheet)")
    parser.add_argument("--service-account", default=None, help="Service account JSON for live admin writes")
    parser.add_argument("--dry-run", action="store_true", help="Parse and report without writing")
    args = parser.parse_args()

    if not os.path.exists(args.excel):
        print(f"ERROR: Excel file not found: {args.excel}")
        sys.exit(1)

    print("=" * 70)
    print("  BEL Employee Import — Excel -> Firebase Firestore (idempotent)")
    print("=" * 70)

    target, base_url = determine_target()
    print(f"  Target  : {'Emulator (localhost:8080)' if target == 'emulator' else 'LIVE Firestore'}")
    print(f"  Project : {PROJECT_ID}")
    print(f"  Excel   : {args.excel}")
    print(f"  Mode    : {'DRY RUN' if args.dry_run else 'WRITE'}")
    print()

    token = None
    if args.service_account:
        print(f"  Auth    : service account ({os.path.basename(args.service_account)})")
        token = service_account_token(args.service_account)
    elif target == "live" and not args.dry_run:
        # Start unauthenticated — reads are public and the first write attempt
        # will transparently sign in anonymously if the rules require it.
        print("  Auth    : unauthenticated (auto-fallback to anonymous sign-in if writes are denied)")
    elif args.dry_run:
        print("  Auth    : skipped (dry run performs no writes)")
    else:
        print("  Auth    : none (emulator)")

    try:
        created, updated, unchanged, failed, failures = import_employees(
            args.excel, args.sheet, token, base_url, dry_run=args.dry_run
        )
    except RuntimeError as exc:
        print(f"\nERROR: {exc}")
        sys.exit(2)

    print()
    print("=" * 70)
    print(f"  RESULT: created={created}, updated={updated}, unchanged={unchanged}, failed={failed}")
    for failure in failures[:3]:
        print(f"    ! {failure}")
    if not args.dry_run and created + updated + unchanged > 0:
        sample_records, _ = read_records(args.excel, args.sheet)
        sample = [str(r["employeeId"]).strip() for r in sample_records[:3]]
        verify_retrieval(base_url, token, sample)
    print("=" * 70)


if __name__ == "__main__":
    main()



ENV = load_env_local()
PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID") or ENV.get("VITE_FIREBASE_PROJECT_ID", "bel-sih-b9392")
API_KEY = os.environ.get("FIREBASE_API_KEY") or ENV.get("VITE_FIREBASE_API_KEY", "")

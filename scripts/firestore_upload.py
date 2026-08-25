#!/usr/bin/env python3
"""
Upload Excel test data to Firestore.

Auto-detects: if FIRESTORE_EMULATOR_HOST or port 8080 is reachable,
uploads to the local emulator (no auth). Otherwise tries the live
Firestore via anonymous sign-in (requires anonymous auth enabled).
"""
import json, os, uuid, urllib.error, urllib.request, warnings
import pandas as pd
import numpy as np
from datetime import date, datetime

warnings.filterwarnings("ignore")

API_KEY = "AIzaSyCvDmqz8jFsjlJB1jqWe0PqD5XPKSWT7Bc"
PROJECT_ID = "bel-sih-b9392"
EXCEL_PATH = r"C:\Users\Vasanthan Y\OneDrive\Desktop\SIH\SIH 2026\employee_test_dataset_100_records.xlsx"

SHEET_MAP = {
    "Employee Data":                    ("employees",      "Employee ID"),
    "Access Control DID Authorizatio":  ("accessControl",  "Authorization ID"),
    "Reference Data":                   ("referenceData",  None),
    "Dataset Information":              ("datasetInfo",    None),
}
BATCH_SIZE = 20

def to_camel(name):
    parts = name.strip().split()
    return parts[0].lower() + "".join(p.capitalize() for p in parts[1:]) if parts else ""

def to_fs_value(val):
    if val is None or (isinstance(val, float) and val != val):
        return {"nullValue": None}
    if isinstance(val, bool) or isinstance(val, np.bool_):
        return {"booleanValue": bool(val)}
    if isinstance(val, (int, np.integer)):
        return {"integerValue": str(int(val))}
    if isinstance(val, (float, np.floating)):
        fv = float(val)
        return {"doubleValue": fv} if fv != int(fv) else {"integerValue": str(int(fv))}
    if isinstance(val, (datetime, date, pd.Timestamp)):
        return {"timestampValue": pd.Timestamp(val).isoformat()}
    return {"stringValue": str(val).strip()}

def doc_fields(record):
    return {to_camel(k): to_fs_value(v) for k, v in record.items()}

def read_records(sheet_name):
    df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
    records = []
    for _, row in df.iterrows():
        rec = {}
        for col in df.columns:
            val = row[col]
            if pd.isna(val):
                rec[col] = None
            elif isinstance(val, pd.Timestamp):
                rec[col] = val.isoformat()
            elif isinstance(val, np.integer):
                rec[col] = int(val)
            elif isinstance(val, np.floating):
                rec[col] = float(val)
            else:
                rec[col] = val
        records.append(rec)
    return records

def http_post(url, data, token=None):
    import urllib.request, urllib.error
    hdrs = {"Content-Type": "application/json"}
    if token:
        hdrs["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            body = json.loads(body)
        except Exception:
            pass
        return e.code, body

def sign_in_anon():
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    s, b = http_post(url, {"signInAnonymously": True})
    if s != 200:
        raise RuntimeError(f"Anonymous sign-in failed ({s}): {b}")
    return b["idToken"]


def get_service_account_token(service_account_path):
    """Build an OAuth access token from a Firebase service-account key JSON."""
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request

    creds = service_account.Credentials.from_service_account_file(
        service_account_path,
        scopes=["https://www.googleapis.com/auth/cloud-platform",
                "https://www.googleapis.com/auth/datastore"],
    )
    creds.refresh(Request())
    return creds.token


def resolve_token(explicit_service_account=None):
    """Return an access token for live Firestore.

    Precedence:
      1. --service-account <path> CLI argument
      2. GOOGLE_APPLICATION_CREDENTIALS env var (service account JSON)
      3. Anonymous sign-in (requires Anonymous auth enabled in console)
    """
    sa_path = explicit_service_account or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if sa_path:
        if not os.path.exists(sa_path):
            raise RuntimeError(f"Service account key not found: {sa_path}")
        print(f"  Using service account key: {sa_path}")
        return get_service_account_token(sa_path)
    print("  Using anonymous sign-in (enable Anonymous Auth in Firebase console if it fails)")
    return sign_in_anon()

def upload_batch(base_url, token, collection, writes):
    url = f"{base_url}/projects/{PROJECT_ID}/databases/(default)/documents:commit"
    ok, fail = 0, 0
    for i in range(0, len(writes), BATCH_SIZE):
        chunk = writes[i:i + BATCH_SIZE]
        s, b = http_post(url, {"writes": chunk}, token=token)
        if s != 200:
            print(f"  commit error ({s}): {b}")
            fail += len(chunk)
        else:
            ok += len(chunk)
    return ok, fail

def build_writes(collection, records, doc_id_col):
    base = f"projects/{PROJECT_ID}/databases/(default)/documents/{collection}"
    writes = []
    for rec in records:
        fields = doc_fields(rec)
        doc_id = None
        if doc_id_col and doc_id_col in rec and rec[doc_id_col]:
            doc_id = str(rec[doc_id_col]).strip()
        else:
            doc_id = uuid.uuid4().hex
        writes.append({"update": {"name": f"{base}/{doc_id}", "fields": fields}})
    return writes

def determine_target():
    """Return ('emulator', base_url) or ('live', base_url)."""
    force_live = os.environ.get("FIREBASE_UPLOAD_MODE") == "live"
    if not force_live:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        try:
            sock.connect(("localhost", 8080))
            sock.close()
            return "emulator", "http://localhost:8080/v1"
        except (socket.error, OSError):
            sock.close()
    return "live", "https://firestore.googleapis.com/v1"



def main():
    import sys
    service_account_path = None
    args = sys.argv[1:]
    if "--service-account" in args:
        i = args.index("--service-account")
        if i + 1 < len(args):
            service_account_path = args[i + 1]

    print("=" * 70)
    print("  Firestore Upload - Excel to Firestore")
    print("=" * 70)
    target, base_url = determine_target()
    print(f"  Target  : {'Emulator (localhost:8080)' if target == 'emulator' else 'LIVE Firestore'}")
    print(f"  Project : {PROJECT_ID}")
    print(f"  Excel   : {EXCEL_PATH}")
    print()

    token = None
    if target == "emulator":
        print("  Using Firestore emulator (no auth needed)")
    else:
        token = resolve_token(service_account_path)

    # Read & upload
    t_ok, t_fail = 0, 0
    print()
    for sheet, (coll, doc_col) in SHEET_MAP.items():
        records = read_records(sheet)
        writes = build_writes(coll, records, doc_col)
        print(f"  Uploading '{sheet}' -> '{coll}' ({len(records)} docs)...")
        ok, fail = upload_batch(base_url, token, coll, writes)
        tag = "OK" if fail == 0 else "WARN"
        msg = f"    [{tag}] {ok}/{len(records)} OK"
        if fail:
            msg += f", {fail} failed"
        print(msg)
        t_ok += ok
        t_fail += fail

    print()
    print("=" * 70)
    print(f"  RESULT: {t_ok} uploaded, {t_fail} failures")
    if target == "emulator":
        print(f"  Emulator UI: http://127.0.0.1:4000/firestore")
    print(f"  Console: https://console.firebase.google.com/project/{PROJECT_ID}/firestore")
    print("=" * 70)


if __name__ == "__main__":
    main()


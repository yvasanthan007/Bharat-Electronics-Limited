#!/usr/bin/env python3
"""
Fast viewer for the `employees` collection in Firestore (project bel-sih-b9392).

Uses the Firestore *list* endpoint, which returns document fields inline —
so browsing 500 employees takes ~2 HTTP requests (no per-doc fetches).

Usage
-----
    python view_employees.py                      # first 15 employees as a table
    python view_employees.py --limit 30           # first 30
    python view_employees.py --id BEL1001         # one employee, all fields
    python view_employees.py --role Manager       # filter by role
    python view_employees.py --search singh       # search name / email / dept
    python view_employees.py --count              # just the total count
"""
import argparse
import json
import sys
import urllib.request

BASE = ("https://firestore.googleapis.com/v1/projects/bel-sih-b9392/"
        "databases/(default)/documents")

TABLE_COLS = ["employeeId", "employeeName", "role", "department",
              "location", "didStatus"]


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "bel-viewer/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def doc_fields(doc):
    """Firestore typed fields -> plain values (strings/numbers as-is)."""
    out = {}
    for key, spec in doc.get("fields", {}).items():
        (kind, value), = spec.items()
        if kind == "integerValue":
            out[key] = int(value)
        elif kind == "doubleValue":
            out[key] = float(value)
        else:
            out[key] = value
    return out


def fetch_all():
    """Yield (doc_id, fields) for every employee using paged list queries."""
    page = None
    while True:
        url = f"{BASE}/employees?pageSize=300" + (f"&pageToken={page}" if page else "")
        body = get(url)
        for doc in body.get("documents", []):
            yield doc["name"].split("/")[-1], doc_fields(doc)
        page = body.get("nextPageToken")
        if not page:
            return


def print_row(cols, widths):
    print("  ".join(str(c).ljust(w)[:w] for c, w in zip(cols, widths)).rstrip())


def main():
    parser = argparse.ArgumentParser(description="View employees stored in Firestore")
    parser.add_argument("--limit", type=int, default=15, help="max rows to display")
    parser.add_argument("--id", help="show one employee's full document")
    parser.add_argument("--role", help="filter by role (Admin/Manager/Employee)")
    parser.add_argument("--search", help="search name / email / department / id")
    parser.add_argument("--count", action="store_true", help="print total count only")
    args = parser.parse_args()

    if args.id:
        try:
            body = get(f"{BASE}/employees/{args.id}")
        except urllib.error.HTTPError as exc:
            print(f"ERROR: {args.id} not found in Firestore ({exc.code})")
            sys.exit(1)
        fields = doc_fields(body)
        print(f"Document: employees/{args.id}")
        for key in sorted(fields):
            print(f"  {key:18} = {fields[key]}")
        return

    total = 0
    shown = 0
    widths = [10, 24, 10, 18, 12, 13]
    header_done = False

    for doc_id, f in fetch_all():
        total += 1
        if args.role and (f.get("role") or "").lower() != args.role.lower():
            continue
        if args.search:
            haystack = " ".join(str(f.get(k, "")) for k in
                                ("employeeName", "name", "email", "department",
                                 "designation", "employeeId")).lower()
            if args.search.lower() not in haystack:
                continue
        if shown < args.limit:
            if not header_done:
                print_row([c.upper() for c in TABLE_COLS], widths)
                print_row(["-" * w for w in widths], widths)
                header_done = True
            print_row([f.get(c, "") for c in TABLE_COLS], widths)
            shown += 1

    print()
    if args.role:
        print(f"Total employees in Firestore: {total} | matching role '{args.role}': {shown}+")
    else:
        print(f"Total employees in Firestore: {total} (displayed: {shown})")


if __name__ == "__main__":
    main()

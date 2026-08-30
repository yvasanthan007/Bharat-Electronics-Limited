"""Live verification: count employees, sample roles, check fields."""
import json
import urllib.request

BASE = "https://firestore.googleapis.com/v1/projects/bel-sih-b9392/databases/(default)/documents"


def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read().decode())


def fields_of(doc):
    out = {}
    for k, spec in doc.get("fields", {}).items():
        (kind, val), = spec.items()
        out[k] = val
    return out


ids, page = [], None
while True:
    url = f"{BASE}/employees?pageSize=300" + (f"&pageToken={page}" if page else "")
    body = get(url)
    ids += [d["name"].split("/")[-1] for d in body.get("documents", [])]
    page = body.get("nextPageToken")
    if not page:
        break

print(f"TOTAL EMPLOYEE DOCS: {len(ids)}")
print("first5:", ids[:5])
print("last5 :", ids[-5:])

roles = {}
samples = {}
for emp_id in ids:
    f = fields_of(get(f"{BASE}/employees/{emp_id}"))
    role = f.get("role", "?")
    roles[role] = roles.get(role, 0) + 1
    if role not in samples:
        samples[role] = (emp_id, f)

print("ROLE DISTRIBUTION:", roles)
for role, (emp_id, f) in samples.items():
    print(f"\n[{role}] {emp_id}:")
    for k in ("employeeName", "name", "email", "department", "designation",
              "location", "joiningYear", "employmentStatus", "didStatus",
              "did", "walletAddress", "status", "phone"):
        if k in f:
            print(f"   {k}: {f[k]}")

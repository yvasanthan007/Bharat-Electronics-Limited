# Excel → Firebase Firestore Upload

Uploads `employee_test_dataset_100_records.xlsx` into the **bel-sih-b9392**
Firestore database as four collections:

| Excel sheet                       | Firestore collection | Document ID            | Docs |
|-----------------------------------|----------------------|------------------------|------|
| Employee Data                     | `employees`          | `Employee ID` (e.g. EMP1001) | 100 |
| Access Control DID Authorizatio   | `accessControl`      | `Authorization ID` (AUTH2001) | 100 |
| Reference Data                    | `referenceData`      | auto-generated         | 60  |
| Dataset Information               | `datasetInfo`        | auto-generated         | 12  |

All column headers are converted to **camelCase** field names
(e.g. `Employee ID` → `employeeId`, `Last Login` → `lastLogin`).

## Requirements

```
pip install pandas openpyxl numpy requests google-auth
```

## Usage

### 1. Local emulator (no Firebase account needed, for testing)
```powershell
npx firebase emulators:start --only firestore
python firestore_upload.py
```
The script auto-detects the emulator on `localhost:8080` and uploads there.
View data at http://127.0.0.1:4000/firestore

### 2. LIVE Firebase (your real project `bel-sih-b9392`)
First **stop the emulator**, then choose one auth method:

**Option A — Service account key (recommended)**
1. Firebase Console → Project settings → Service accounts → Generate new private key
   (downloads `xxx-firebase-adminsdk-xxxx.json`).
2. Run:
   ```powershell
   python firestore_upload.py --service-account path\to\xxx-firebase-adminsdk-xxxx.json
   ```
   or set `GOOGLE_APPLICATION_CREDENTIALS` to the key path first.

**Option B — Anonymous authentication**
1. Firebase Console → Authentication → Sign-in method → Anonymous → Enable.
2. Run:
   ```powershell
   $env:FIREBASE_UPLOAD_MODE="live"; python firestore_upload.py
   ```
   (Firestore security rules must permit writes for anonymous users.)

**Option C — Firebase CLI**
```powershell
npx firebase login
$env:FIREBASE_UPLOAD_MODE="live"; python firestore_upload.py
```

> ⚠️ We could **not** write to the live project from this environment because
> no service-account key was provided and Anonymous Auth was disabled
> (`ADMIN_ONLY_OPERATION`). The pipeline was fully validated against the

---

# Idempotent 500-Employee Import (`import_employees_500.py`)

Imports `BEL_Employee_Dataset_500.xlsx` (sheet **Employees**, 500 records) into
the **`employees`** collection of project **bel-sih-b9392**. This is the
dataset used by the application's live database — Firestore, not Excel, is
the app's source of truth.

## Guarantees

| Property | How |
|----------|-----|
| **Safe to re-run (idempotent)** | Document ID = `Employee ID` (e.g. `BEL1001`) — re-running updates the same docs, never duplicates. |
| **Never overwrites DID data** | Existing `did`, `walletAddress`, `walletId`, `publicKey`, `didCreatedAt`, `didStatus` set by the Admin UI win over Excel values. |
| **No private keys** | Credential-like columns are rejected; only public DID/wallet fields are written. |
| **Fields mirror Excel columns** | camelCase: `employeeId, employeeName, email, phone, department, designation, role, location, joiningYear, employmentStatus, didStatus, did, walletAddress` + aliases `name`/`status`. |
| **Config from the project** | Reads `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_API_KEY` from `.env.local`. Admin credentials are never hardcoded — pass a service-account key via CLI only. |

## Usage

```powershell
# Parse + report only (no writes)
python scripts\import_employees_500.py --dry-run

# Import to live Firestore (auto-target: emulator if running, else live)
python scripts\import_employees_500.py

# Explicit service-account (admin-level) writes
python scripts\import_employees_500.py --service-account path\to\adminsdk.json

# Custom workbook / sheet
python scripts\import_employees_500.py --excel path\to\file.xlsx --sheet Employees
```

Auth strategy on live: starts unauthenticated (public reads); if a write is
denied it transparently falls back to anonymous sign-in, or use
`--service-account`. The script verifies sample documents at the end
(`created/updated/unchanged` counts + retrieval check).

## Viewing the imported data

**Option 1 — Firebase Console (visual)**

1. https://console.firebase.google.com → project **bel-sih-b9392**
2. Build → **Firestore Database**
3. Click the **`employees`** collection → browse all documents
   (`BEL1001`…`BEL1500`). Click a document to see its fields.

**Option 2 — `view_employees.py` (fast terminal viewer)**

```powershell
python scripts\view_employees.py                    # first 15 employees (table)
python scripts\view_employees.py --limit 30         # first 30
python scripts\view_employees.py --id BEL1001       # one employee, all fields
python scripts\view_employees.py --role Admin       # filter by role
python scripts\view_employees.py --search singh     # search name/email/dept
python scripts\view_employees.py --count            # total count only
```

**Option 3 — `verify_import.py` (full verification)**

```powershell
python scripts\verify_import.py   # count + role distribution + field samples
```

---

# DID Provisioning for Role-Based Redirect (`provision-did.mjs`)

The RBAC routing (Admin→`/bel`, Manager→`/manager`, Auditor→`/auditor`,
User→`/user`) is already live in the app. Every employee can only complete the
DID signature-verification login if their `employees/{id}` doc carries a DID
(`did`, `publicKey`, `walletAddress`, `didStatus: Created`). Employees whose
Excel row had no DID (e.g. `BEL1015`/`vijay.krishnan15@bel.co.in`) cannot pass
the signature step until one is issued.

`provision-did.mjs` issues missing DIDs in bulk (public data **only**):
- generates an ethers keypair identical to the app's DID engine,
- PATCHes **only public fields** (`did`, `walletAddress`, `walletId`,
  `publicKey`, `keyType`, `didStatus`, `didCreatedAt`, `status`, `updatedAt`)
  into `employees/{employeeId}` — it never overwrites an existing DID and
  preserves the authoritative `role`,
- never writes a private key to Firestore, and
- emits a chmod-0600 private-key artifact into the gitignored
  `scripts/.did-keys/<employeeId>.json` for import into the employee's
  browser wallet / MetaMask.

> **After provisioning, the employee still needs their private key in the
> browser that will log in.** The DID flow signs a challenge with the private
> key that lives in that browser (IndexedDB secure key storage or a connected
> MetaMask wallet). Import the generated private key from
> `scripts/.did-keys/<employeeId>.json` into MetaMask (or store it via the
> Admin → Create Identity modal on that device) before completing the login.

```powershell
# DRY-RUN (default, read-only)
node scripts/provision-did.mjs --role=Manager
node scripts/provision-did.mjs --ids=BEL1015,BEL1116

# WRITE to LIVE Firestore (requires a Bearer token, see ENV note)
#   Set FIREBASE_ACCESS_TOKEN to a service-account or user access token
#   (obtain one from Firebase Console → Service accounts → Generate key, then
#   use a token helper such as `gcloud auth application-default print-access-token`).
node scripts/provision-did.mjs --all --live --commit
node scripts/provision-did.mjs --role=Manager --live --commit
node scripts/provision-did.mjs --ids=BEL1015 --live --commit

# WRITE to the LOCAL Firestore emulator
node scripts/provision-did.mjs --emulator=8080 --commit
```

> `--commit` is required for any write. Without it the tool performs a dry run.
> local emulator (272/272 documents).

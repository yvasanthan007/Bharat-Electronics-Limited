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
> local emulator (272/272 documents).

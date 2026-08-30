import json
import requests

PROJECT = 'bel-sih-b9392'
KEY = 'AIzaSyCvDmqz8jFsjlJB1jqWe0PqD5XPKSWT7Bc'
BASE = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents'

TARGET = 'f30c64d4699994234b6eedf1f377eaaf8d61e907'

# 1. List ALL employees docs with pagination (id + did + walletAddress only)
page_token = None
total = 0
did_hits = []
while True:
    url = f'{BASE}/employees?key={KEY}&pageSize=299&mask.fieldPaths=did&mask.fieldPaths=walletAddress&mask.fieldPaths=employeeId'
    if page_token:
        url += f'&pageToken={page_token}'
    r = requests.get(url, timeout=60)
    body = r.json()
    docs = body.get('documents', [])
    total += len(docs)
    for d in docs:
        f = d.get('fields', {})
        did = f.get('did', {}).get('stringValue', '').lower()
        eid = f.get('employeeId', {}).get('stringValue', d['name'].split('/')[-1])
        if TARGET in did:
            did_hits.append((eid, did))
    page_token = body.get('nextPageToken')
    if not page_token:
        break

print(f'employees scanned: {total}')
print('docs whose DID contains target address:', did_hits or 'NONE')

# 2. Probe write permission on employees/BEL1001 with an authenticated ID token
auth = requests.post(
    f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={KEY}',
    json={'email': 'aditya.singh1@bel.co.in', 'password': '123456', 'returnSecureToken': True},
    timeout=30).json()
token = auth['idToken']
print('\nidToken obtained:', bool(token))

doc_url = f'{BASE}/employees/BEL1001?key={KEY}'
cur = requests.get(doc_url, timeout=30).json()
cur_updated = cur.get('fields', {}).get('updatedAt', {}).get('stringValue', '')

# attempt a no-op update (write same updatedAt back) using the ID token
probe = requests.patch(
    f'{BASE}/employees/BEL1001?updateMask.fieldPaths=updatedAt&key={KEY}',
    headers={'Authorization': f'Bearer {token}'},
    json={'fields': {'updatedAt': {'stringValue': cur_updated or '2026-08-30T00:00:00.000Z'}}},
    timeout=30)
print('employee update probe status:', probe.status_code)
if probe.status_code >= 400:
    print(json.dumps(probe.json(), indent=1)[:500])
else:
    print('=> authenticated employee updates ARE permitted by deployed rules')

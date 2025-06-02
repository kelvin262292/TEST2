# ☁️ Google Drive Upload Guide  
Modern 3D E-commerce Platform  
_Last updated 2025-06-02_

> Use this guide to move the entire monorepo (or the ZIP archive you generated with
> `create-zip-backup.sh`) into Google Drive.  
> We cover **five** approaches – from manual drag-and-drop to fully automated
> CI uploads. Pick the method that matches your workflow & skill level.

---

## 0  Prerequisites

| Requirement | Purpose | Link |
|-------------|---------|------|
| Google account | Access Google Drive | https://drive.google.com |
| Project ZIP (`ecommerce-3d-backup-*.zip`) | Single archive of repository | `./create-zip-backup.sh` |
| `gcloud` CLI (optional) | OAuth credentials for API/rclone | https://cloud.google.com/sdk |
| `rclone` or `gdrive` CLI (optional) | Headless / scripted uploads | https://rclone.org / https://github.com/prasmussen/gdrive |

---

## 1  Method A — Web UI (Drag & Drop)

_Skill level: ★☆☆ | Speed: Fast for single upload | OS: Any_

1. Open https://drive.google.com in your browser.  
2. Navigate to the target folder (create one, e.g. **ecommerce-3d**).  
3. Drag `ecommerce-3d-backup-YYYYMMDD-HHMMSS.zip` into the window **or** press  
   `New → File upload` and pick the ZIP.  
4. Wait for the progress bar to reach 100 %.  
5. (Optional) Right-click the file → `Manage access` to share with teammates.

_Pros_: Zero setup.  
_Cons_: Manual, no versioning beyond “Manage versions…”.

---

## 2  Method B — Google Drive for Desktop Sync

_Skill level: ★☆☆ | Great for frequent manual edits | OS: Win / macOS_

1. Install **Google Drive for Desktop**  
   https://www.google.com/drive/download/  
2. After sign-in, Drive appears as a mounted volume (`G:` on Windows or
   `/Volumes/GoogleDrive` on macOS).  
3. Copy the entire project directory (or the ZIP) into  
   `My Drive/ecommerce-3d/`.  
4. The client syncs in the background. Blue rotating icon → green checkmark.

_Tip_: Exclude `node_modules`, `dist`, `.next`, etc. via
`Preferences → Google Drive → Mirror files → Folder exclusions`.

---

## 3  Method C — `gdrive` CLI (Simple Scriptable)

_Skill level: ★★☆ | Ideal for cron/CI | OS: any with Go binaries_

### 3.1 Install & Authorise

```bash
# macOS
brew install gdrive
# Linux
curl -L -o gdrive.tar.gz https://github.com/prasmussen/gdrive/releases/download/2.1.1/gdrive-linux-x64
tar -xzf gdrive.tar.gz && sudo install gdrive /usr/local/bin
```

Run once to get an OAuth URL:

```bash
gdrive about
# open printed link → select Google account → copy verification code → paste
```

### 3.2 Upload

```bash
FOLDER_ID=$(gdrive mkdir ecommerce-3d | awk '{print $2}')
gdrive upload --parent "$FOLDER_ID" ecommerce-3d-backup-20250602-120000.zip
```

_Re-upload new versions_:

```bash
FILE_ID=$(gdrive list --query "name contains 'ecommerce-3d-backup' and trashed = false" | head -n2 | tail -n1 | awk '{print $1}')
gdrive update "$FILE_ID" ecommerce-3d-backup-20250602-130000.zip
```

---

## 4  Method D — `rclone` Remote (Advanced / Large Files)

_Skill level: ★★★ | Handles >5 GB & resumes | OS: any_

### 4.1 Configure

```bash
rclone config
# n → name = gdrive
# Storage = 13 (Google Drive)
# client_id / client_secret (blank or your own)
# scope = 1 (Full access)
# Use auto config = y
# Team drive = n
```

### 4.2 Upload whole folder

```bash
# Copy project folder (excludes ignored patterns via .gitignore)
rclone copy ./ecommerce-3d gdrive:/ecommerce-3d --progress --exclude "**/node_modules/**"
# Or copy the ZIP
rclone copy ecommerce-3d-backup-*.zip gdrive:/ecommerce-3d --progress
```

### 4.3 Incremental Sync

```bash
# Push only changed files (checksum)
rclone sync ./ecommerce-3d gdrive:/ecommerce-3d --progress --exclude "**/node_modules/**"
```

_Add flags_:

* `--drive-chunk-size 128M` – faster for huge files  
* `--dry-run` to preview changes

---

## 5  Method E — Google Drive API (Python script)

_Skill level: ★★★ | Fine-grained control, CI friendly_

### 5.1 Create OAuth Client

1. Go to https://console.cloud.google.com  
2. `APIs & Services → Credentials → Create OAuth Client ID`  
3. Application type = Desktop, download `credentials.json`.

### 5.2 Install libraries

```bash
python -m venv .venv && source .venv/bin/activate
pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib tqdm
```

### 5.3 Script

```python
# upload_to_drive.py
import os, mimetypes
from tqdm import tqdm
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build, MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
ZIP_PATH = "ecommerce-3d-backup-20250602-120000.zip"

def get_service():
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    return build("drive", "v3", credentials=creds)

def main():
    service = get_service()
    file_metadata = {"name": os.path.basename(ZIP_PATH), "parents": []}  # add parent ID
    media = MediaFileUpload(
        ZIP_PATH,
        mimetype=mimetypes.guess_type(ZIP_PATH)[0],
        resumable=True,
        chunksize=1024 * 1024 * 5,  # 5 MB
    )
    request = service.files().create(body=file_metadata, media_body=media, fields="id")
    response = None
    progress = tqdm(total=os.path.getsize(ZIP_PATH), unit="B", unit_scale=True)
    while response is None:
        status, response = request.next_chunk()
        if status:
            progress.update(status.resumable_progress - progress.n)
    progress.close()
    print("Uploaded file ID:", response.get("id"))

if __name__ == "__main__":
    main()
```

Run:

```bash
python upload_to_drive.py
```

---

## 6  Method F — GitHub Actions → Drive (Automated Backups)

Use a PAT/Service Account to push nightly ZIP artefacts.

```yaml
name: Drive Backup
on:
  workflow_dispatch:
  schedule:
    - cron: "0 3 * * *"   # daily 03:00 UTC
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps & create ZIP
        run: |
          sudo apt-get install -y zip
          chmod +x create-zip-backup.sh
          ./create-zip-backup.sh ../
      - name: Upload to Google Drive
        uses: 'guitarrapc/google-drive-upload-github-action@v1'
        with:
          service-account-json: ${{ secrets.GDRIVE_SERVICE_ACCOUNT }}
          folder-id: ${{ secrets.GDRIVE_FOLDER_ID }}
          file-pattern: '../ecommerce-3d-backup-*.zip'
```

---

## 7  Troubleshooting & FAQ

| Issue | Cause | Fix |
|-------|-------|-----|
| `Upload quota exceeded` | 750 GB/day limit | Split across days or use Workspace domain |
| `gdrive: Failed to get token` | OAuth token expired | Re-run `gdrive about`, paste new code |
| `zip: argument list too long` | Millions of files | Use `create-zip-backup.sh` (excludes *node_modules*) |
| Slow upload | Small chunk size / home bandwidth | For CLI: `--drive-chunk-size 256M` or schedule during off-peak |

---

## 8  Security Notes

* Avoid uploading `.env` or any secrets. The backup script already excludes them.  
* For API/CLI methods store credentials in **1Password / GitHub Secrets**.  
* Use Shared Drive with restricted permissions for company data.  
* Enable 2-step verification on the Google account.

---

## 9  Next Steps

1. **Confirm SHA-256** of ZIP after upload for integrity.  
2. Enable **version history** so future uploads don’t overwrite accidentally.  
3. Automate weekly clean-up of old backups with `gdrive delete` or `rclone delete`.  
4. Consider **Google Cloud Storage** (nearline) for long-term archival.

---

Happy uploading! 🎉  
Questions? Open an issue or ping @Dennis-Smith.  

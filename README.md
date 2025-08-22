
# 📸 S3 Gallery App

The **S3 Gallery App** is a full-stack application for uploading, storing, and viewing images in an **S3-compatible storage service** (like AWS S3 or MinIO).
It provides a simple UI to upload images/videos, list them, downlaod images/videos,edit image/video titles, preview images/videos, filter them and view them as a gallery.

This app is useful for projects where you want a self-hosted image gallery backed by cloud or local object storage.


## 🚀 Features

* Upload images directly to S3 (AWS or MinIO).
* View uploaded images in a gallery format.
* Delete images from storage.
* Configurable for AWS S3 or local MinIO.
* Environment variable support for credentials and storage settings.


## 🛠️ Tech Stack

* **Frontend:** Next.js (pages router)
* **Backend:** Next.js api 
* **Storage:** AWS S3 / MinIO
* **Database:** (Optional, if you added one)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/s3-gallery-app.git
cd s3-gallery-app
```

---

### 2. Setup Environment Variables


```env

# AWS / MinIO Credentials

AWS_ACCESS_KEY_ID=minioadmin (based on your Minio/aws setup)
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_ENDPOINT=http://localhost:9000
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=my-s3-gallery

```

### 3. Run MinIO (Local S3 Alternative)

If you don’t want to use AWS S3, you can run **MinIO** locally in Docker:

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

* Dashboard: [http://localhost:9001](http://localhost:9001)
* Create a bucket named **`my-s3-gallery`**

---

### 5. Start the App

```bash
npm run dev
```

Now open **[http://localhost:5173](http://localhost:5173)** (or whichever port your frontend runs on).

---

## 📂 Project Structure

updating soon...

## 🧪 Testing the Setup

1. Upload an image → Check MinIO / AWS S3 bucket.
2. Refresh frontend → See your uploaded image in the gallery.
3. Delete image → Confirm deletion in storage.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

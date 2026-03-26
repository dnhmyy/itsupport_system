# IT Support Management System

Sistem manajemen IT internal lengkap dengan Monitoring, Manajemen Aset, Ticketing, dan Penyimpanan Kredensial yang aman.

## 🚀 Cara Menjalankan

Sistem ini sudah menggunakan Docker, sehingga Anda bisa menjalankan seluruh stack (Backend, Frontend, Database, Redis) dengan satu perintah:

```bash
docker-compose up -d --build
```

Setelah dijalankan:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:8000](http://localhost:8000)

## 📁 Struktur Folder

- `/backend`: API menggunakan Laravel 11.
- `/frontend`: Interface menggunakan Next.js 14.
- `/docker`: Konfigurasi infrastruktur (Nginx).

### Struktur Repo yang Disarankan

Folder berikut adalah source of truth dan aman untuk dipush:

- `backend/app`, `backend/config`, `backend/database`, `backend/routes`, `backend/tests`
- `frontend/src`
- `docker`

Folder/file berikut bersifat lokal / generated dan tidak boleh masuk GitHub:

- `backend/.env`
- `frontend/.env.local`
- `backend/database/database.sqlite`
- `backend/storage/logs/*`
- `backend/storage/framework/views/*`
- `frontend/.next`
- `frontend/node_modules`
- `backend/vendor`
- `frontend/.git`

## 🔑 Konfigurasi (.env)

Pastikan Anda menyalin file `.env.example` menjadi `.env` di folder `backend/` dan `frontend/` sebelum menjalankan container (atau sesuaikan langsung di `docker-compose.yml`).

## 🛠️ Fitur Utama

1. **Monitoring**: Cek status server, Docker, dan jaringan secara real-time.
2. **Asset Management**: Pendataan unit fisik, spesifikasi, dan garansi.
3. **Ticketing**: Sistem keluhan IT dengan prioritas dan log aktivitas.
4. **Credential Manager**: Brankas kata sandi terenkripsi dengan audit log akses.

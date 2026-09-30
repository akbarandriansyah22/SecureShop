# SecureShop

Aplikasi e-commerce fullstack yang dibangun menggunakan Next.js sebagai frontend dan Go Fiber sebagai backend API, dilengkapi dengan workflow DevSecOps, containerization, observability, Kubernetes, dan Terraform.

Repository ini digunakan sebagai project portfolio untuk menunjukkan penerapan software engineering, backend development, DevOps, dan DevSecOps dalam satu sistem.

Catatan: repository utama memakai nama SecureShop, tetapi image API yang dipublikasikan ke GHCR saat ini masih memakai path `devops-homelab`. Itu mengikuti konfigurasi workflow CD yang sedang digunakan.

[![CI](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/SecureShop/ci.yml?branch=main&label=CI&logo=github&logoColor=white)](https://github.com/akbarandriansyah22/SecureShop/actions/workflows/ci.yml)
[![GHCR](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/SecureShop/cd.yml?branch=main&label=GHCR%20publish&logo=docker&logoColor=white)](https://github.com/akbarandriansyah22/SecureShop/actions/workflows/cd.yml)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Status proyek

- Backend: Go 1.26 + Fiber
- Frontend: Next.js + TypeScript
- Database: PostgreSQL
- Container: Docker
- CI: GitHub Actions
- Security scanning: Gitleaks, GoSec, Trivy
- SBOM: CycloneDX
- Observability: Prometheus, Grafana, Loki, Alertmanager, Promtail
- Orchestration: Kubernetes
- Local Kubernetes: kind
- Infrastructure as Code: Terraform
- Container registry: GitHub Container Registry (GHCR)

## Gambaran umum

SecureShop adalah aplikasi e-commerce fullstack yang terdiri dari frontend berbasis Next.js dan backend REST API berbasis Go Fiber.

Aplikasi menyediakan autentikasi, manajemen produk dan kategori, keranjang belanja, pemesanan, checkout berbasis metode pembayaran, serta fitur administrasi. Checkout menyimpan `payment_method`. Tidak ada payment gateway.

Selain fungsi aplikasi, repository ini juga berfokus pada penerapan praktik DevOps dan DevSecOps:

- Continuous Integration memakai GitHub Actions
- Static code analysis
- Secret scanning
- Software Composition Analysis
- Container image scanning
- Filesystem security scanning
- Software Bill of Materials (SBOM)
- Automated testing
- Docker image publishing ke GHCR
- Monitoring dan observability
- Deployment memakai Kubernetes
- Infrastructure as Code memakai Terraform

## Fitur utama

### Customer

- Registrasi akun
- Login dan logout
- Melihat katalog produk
- Melihat kategori produk
- Menambahkan produk ke keranjang
- Mengubah jumlah produk di keranjang
- Menghapus produk dari keranjang
- Checkout
- Membuat pesanan
- Melihat riwayat pesanan
- Melihat informasi akun

### Admin

- Mengelola produk
- Mengelola kategori
- Melihat dan mengelola pesanan
- Role-based access control
- Endpoint administrasi yang membutuhkan role Admin

### Backend API

- RESTful API
- JWT authentication
- RBAC
- Password hashing memakai bcrypt
- Ownership verification
- Request validation
- Rate limiting
- Security headers
- CORS
- Health check, liveness check, readiness check
- Prometheus metrics
- Structured logging

## Arsitektur

```text
                         ┌────────────────────┐
                         │      Browser        │
                         └─────────┬──────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │      Next.js        │
                         │     Storefront      │
                         │                     │
                         │ App Router          │
                         │ TypeScript          │
                         │ Tailwind CSS        │
                         │ BFF / API Proxy     │
                         └─────────┬──────────┘
                                    │
                                    │ HTTP / JSON
                                    ▼
                         ┌────────────────────┐
                         │      Go Fiber       │
                         │      REST API       │
                         │                     │
                         │ Handler             │
                         │ Service             │
                         │ Repository          │
                         └─────────┬──────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │     PostgreSQL      │
                         └────────────────────┘
```

Untuk observability, backend terhubung ke stack monitoring dan logging:

```text
                  ┌──────────────────┐
                  │   SecureShop API  │
                  └────────┬────────┘
                            │
              ┌────────────┼────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐ ┌──────────┐ ┌────────────┐
        │Prometheus │ │   Loki    │ │Alertmanager│
        └─────┬─────┘ └─────┬─────┘ └────────────┘
              │             │
              ▼             ▼
        ┌────────────────────────┐
        │        Grafana         │
        └────────────────────────┘
```

## Teknologi yang digunakan

### Backend

- Go 1.26
- Fiber
- PostgreSQL
- JWT
- bcrypt
- Prometheus client
- zap

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### DevOps

- Docker dan Docker Compose
- GitHub Actions
- GitHub Container Registry
- Kubernetes dan kind
- Terraform

### DevSecOps

- Gitleaks
- GoSec
- Trivy
- CycloneDX SBOM
- `go test` dan Go race detector
- golangci-lint
- npm audit

### Observability

- Prometheus
- Grafana
- Loki
- Promtail
- Alertmanager

## Struktur repository

Kode API ada di `ecommerce-api/server`, bukan di root `ecommerce-api`.

```text
SecureShop/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── ecommerce-api/
│   ├── apps/
│   │   └── web/                 # storefront Next.js
│   ├── server/
│   │   ├── cmd/main.go
│   │   └── internal/
│   │       ├── handler/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── middleware/
│   │       ├── models/
│   │       └── database/
│   ├── migrations/
│   ├── monitoring/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
├── k8s/
│   ├── base/
│   ├── kind-config.yaml
│   └── README.md
├── infra/
│   └── terraform/
│       └── README.md
└── README.md
```

## Menjalankan secara lokal

### Clone repository

```bash
git clone https://github.com/akbarandriansyah22/SecureShop.git
cd SecureShop
```

### Menjalankan backend API

Entrypoint ada di `ecommerce-api/server/cmd`.

```bash
cd ecommerce-api
cp .env.example .env
```

Isi `DB_PASSWORD`, `JWT_SECRET`, dan `METRICS_TOKEN`. Untuk jalan tanpa Compose, PostgreSQL harus sudah tersedia dan `DB_HOST` mengarah ke instance itu.

```bash
cd server
go mod download
go run ./cmd
```

API berjalan di http://localhost:8080.

Cara yang sekaligus mengangkat database dan observability adalah Docker Compose, di bagian bawah.

### Menjalankan frontend

API harus sudah jalan di `:8080`.

```bash
cd ecommerce-api/apps/web
cp .env.example .env.local
npm install
npm run dev
```

Frontend: http://localhost:3001. `API_URL` di `.env.local` mengarah ke `http://localhost:8080`. Grafana memakai port 3000, jadi storefront tidak memakai port itu.

## Docker Compose

Backend menyediakan Docker Compose untuk API dan service observability. Storefront Next.js belum masuk Compose.

| Service | Port | Keterangan |
| --- | --- | --- |
| API | 8080 | Go Fiber REST API |
| PostgreSQL | 5432 | Database |
| Prometheus | 9090 | Metrics |
| Grafana | 3000 | Dashboard observability |
| Alertmanager | 9093 | Alert |
| Loki | 3100 | Log |

```bash
cd ecommerce-api
docker compose up -d --build
docker compose ps
docker compose logs -f
```

## Health check

### Liveness

`GET /live` memeriksa apakah proses aplikasi masih berjalan. Endpoint ini tidak memeriksa database.

```json
{ "status": "ok" }
```

### Readiness

`GET /ready` memeriksa apakah aplikasi dapat berkomunikasi dengan PostgreSQL. Jika database tidak tersedia, endpoint mengembalikan HTTP 503.

```json
{ "db": "ok", "status": "ready" }
```

### Health

`GET /health` memberi informasi kondisi aplikasi dan database.

### Metrics

`GET /metrics` dipakai Prometheus. Endpoint ini dilindungi Bearer token lewat `METRICS_TOKEN`.

## Autentikasi dan otorisasi

SecureShop memakai JWT untuk autentikasi. Password disimpan sebagai hash bcrypt.

RBAC memakai dua role:

- `1` Admin
- `2` Customer

Admin mengakses endpoint administrasi. Customer hanya mengakses resource miliknya. API juga menerapkan ownership verification supaya satu pengguna tidak membaca resource pengguna lain.

Registrasi dari form membuat customer. Admin tidak dibuat dari form; ubah `role_id` di database, lalu login lagi.

## Frontend dan BFF

Storefront memakai Next.js App Router. Mutasi berikut lewat API proxy yang berfungsi sebagai BFF:

- Cart
- Cart items
- Orders
- Admin products
- Admin categories
- Admin orders

```text
Browser
   │
   ▼
Next.js API Proxy
   │
   │ Authorization: Bearer <JWT>
   ▼
Go Fiber API
   │
   ▼
PostgreSQL
```

Token disimpan di cookie `httpOnly` dengan `SameSite=Lax`. Access token tidak diekspos ke JavaScript di browser. Proxy hanya meneruskan prefix yang di-allowlist, dan menolak `Origin` yang bukan same-origin.

## Keamanan frontend

- Cookie `httpOnly`
- `SameSite=Lax`
- Origin validation
- Content Security Policy
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- Middleware untuk proteksi route
- Pemeriksaan role untuk halaman admin

Content Security Policy masih memakai `unsafe-inline` pada `script-src` dan `style-src`.

## Database

SecureShop memakai PostgreSQL. Tabel utama:

- `roles`
- `users`
- `products`
- `categories`
- `product_categories`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`

Role default: `1` Admin, `2` Customer. Tabel `payments` menyimpan metode yang dipilih saat checkout, bukan integrasi payment gateway.

## CI

Pipeline ada di [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

```text
Push / Pull Request
        │
        ▼
 Secret scanning
        │
        ▼
   Go quality
        │
        ├── golangci-lint
        ├── GoSec
        ├── go test
        ├── race detection
        └── coverage
        │
        ▼
 Docker image build
        │
        ▼
 Trivy image scan
        │
        ▼
     SBOM
        │
        ▼
 Filesystem scan
        │
        ▼
    Web QA
```

### Security scanning

- **Gitleaks** mendeteksi secret atau credential yang tidak sengaja masuk ke repository.
- **GoSec** melakukan static security analysis pada kode Go. Hasilnya juga dipublikasikan sebagai SARIF.
- **Trivy** memindai container image, filesystem, dependency, konfigurasi Kubernetes, dan konfigurasi Terraform, lalu menghasilkan SBOM.

Gate severity: `HIGH` dan `CRITICAL`. Vulnerability yang belum punya fix dapat diabaikan sesuai konfigurasi pipeline.

### SBOM

Pipeline menghasilkan SBOM CycloneDX lewat Trivy. Artifact SBOM disimpan sebagai hasil workflow CI.

## CD

Workflow ada di [`.github/workflows/cd.yml`](./.github/workflows/cd.yml). Workflow membangun dan mempublikasikan image API ke GHCR.

```text
ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api
```

Tag: `latest` dan `main-<commit-sha>`.

CD berjalan setelah CI pada branch `main` berhasil. CD juga bisa dijalankan manual lewat `workflow_dispatch`, dengan input `confirm` bernilai `publish`. Image tidak ditandatangani.

Path image masih `devops-homelab` karena mengikuti workflow CD yang ada sekarang. Rename repository tidak memindahkan package GHCR.

## Kubernetes

Konfigurasi ada di [`k8s/`](./k8s). Deployment lokal memakai kind.

```bash
kind create cluster --name ecommerce --config k8s/kind-config.yaml
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
kubectl apply -f k8s/base
kubectl get pods
kubectl get services
kubectl get deployments
```

Jika `docker pull` dari GHCR gagal (`denied`), bangun image secara lokal lalu muat dengan `kind load`. Detail ada di [`k8s/README.md`](./k8s/README.md).

### Ingress dan TLS

Environment lokal memakai NGINX Ingress. Host lab: `ecommerce.local`. Sertifikat TLS di repo adalah sertifikat lab, bukan sertifikat production.

### PostgreSQL di Kubernetes

PostgreSQL pada manifest kind memakai `emptyDir`. Data hilang saat Pod dihapus atau dibuat ulang. Ini untuk local lab, bukan database production.

## Terraform

Infrastructure as Code ada di [`infra/terraform/`](./infra/terraform), region `ap-southeast-1`.

Yang dibuat:

- VPC
- 2 public subnet
- 2 private subnet
- Security group
- EC2 `t3.micro`
- Elastic IP

Tidak ada EKS, RDS, NAT Gateway, ALB, atau Auto Scaling Group.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

`terraform apply` dapat menimbulkan biaya AWS. Setelah eksperimen selesai, hapus resource dengan `terraform destroy`.

## Observability

```text
Go API
 │
 ├─────────────► Prometheus ────► Grafana
 │
 └─────────────► Loki ◄──── Promtail

Prometheus ────► Alertmanager
```

- Prometheus mengumpulkan metrics dari API.
- Grafana menampilkan dashboard.
- Loki menyimpan log.
- Promtail mengirim log ke Loki.
- Alertmanager mengelola alert dari Prometheus.

## Testing

```bash
cd ecommerce-api/server
go test ./...
```

CI juga menjalankan race detection dan coverage:

```bash
go test -race -coverprofile=coverage.out ./...
```

## Struktur layer backend

```text
Handler
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
Database
```

- Handler menangani HTTP request dan response.
- Service berisi business logic.
- Repository menangani akses database.
- PostgreSQL adalah persistence layer.

Kode layer ada di `ecommerce-api/server/internal/`.

## Lingkup project

Project ini portfolio dan local DevOps/DevSecOps lab, bukan sistem production dengan seluruh komponen enterprise.

Fokusnya software engineering, backend engineering, DevOps, DevSecOps, observability, dan infrastructure as code. PostgreSQL `emptyDir`, TLS lokal, kind, dan EC2 `t3.micro` dipakai untuk lab.

## Catatan deployment

Beberapa konfigurasi ditujukan untuk environment lokal atau lab:

- Kubernetes memakai kind
- PostgreSQL di kind memakai `emptyDir`
- TLS memakai sertifikat lokal
- `DB_SSLMODE=disable` hanya sesuai untuk lab
- Terraform memakai EC2 berukuran kecil
- Storefront Next.js belum menjadi service Docker Compose
- Image GHCR masih memakai namespace `devops-homelab`

Konfigurasi itu perlu disesuaikan jika project ingin dijalankan di environment production.

## Dokumentasi

- [`ecommerce-api/README.md`](./ecommerce-api/README.md)
- [`ecommerce-api/apps/web/README.md`](./ecommerce-api/apps/web/README.md)
- [`k8s/README.md`](./k8s/README.md)
- [`infra/terraform/README.md`](./infra/terraform/README.md)

## Lisensi

MIT. Lihat [`LICENSE`](./LICENSE).

# SecureShop

Toko online fullstack: storefront Next.js untuk pembeli dan admin, API Go (Fiber) untuk katalog, keranjang, dan order, plus homelab DevSecOps yang menjalankan aplikasi itu.

Repo ini tetap `devops-homelab` karena isinya bukan hanya toko. Di dalamnya ada pipeline, observability, cluster Kubernetes lokal, dan lab Terraform AWS. Nama produknya SecureShop, supaya tidak tertukar dengan project fullstack lain.

[![CI](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/ci.yml?branch=main&label=CI&logo=github&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/ci.yml)
[![GHCR](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/cd.yml?branch=main&label=GHCR%20publish&logo=docker&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/cd.yml)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Apa ini

SecureShop adalah toko online kecil dengan dua peran: customer dan admin.

Customer bisa daftar, login, melihat katalog, mencari produk, mengisi keranjang, checkout, dan melihat order. Admin bisa mengelola produk, kategori, dan status order. Checkout menyimpan `payment_method` yang dipilih di form. Tidak ada payment gateway.

Storefront tidak memegang JWT di browser. Login menulis cookie `access_token` (`httpOnly`, `SameSite=Lax`, 2 jam). Mutasi cart, order, dan admin lewat BFF di `apps/web` (`app/api/proxy`), yang hanya meneruskan prefix yang di-allowlist dan menolak `Origin` yang bukan same-origin. Role admin (`role_id = 1`) tetap dicek di API.

Dokumentasi storefront: [`ecommerce-api/apps/web/README.md`](./ecommerce-api/apps/web/README.md).
Dokumentasi API: [`ecommerce-api/README.md`](./ecommerce-api/README.md).

## Bukan production

Ini portofolio / homelab, bukan toko yang siap terima pembayaran sungguhan.

- Tidak ada payment gateway, webhook bayar, atau rekonsiliasi.
- Katalog tidak ikut ter-seed. Migration awal hanya mengisi role. Produk dan kategori harus dimasukkan sendiri.
- Storefront belum masuk Docker Compose. `apps/web` dijalankan dengan `npm run dev` di port 3001. Grafana memakai 3000.
- Image yang dipublish ke GHCR adalah API, bukan storefront.
- Cluster kind dan Terraform AWS adalah lab. `terraform apply` berbiaya dan tidak dijalankan otomatis.

## Stack

| Lapisan | Teknologi |
| --- | --- |
| Storefront | Next.js App Router, TypeScript, Tailwind CSS |
| API | Go 1.26, Fiber, JWT, bcrypt |
| Data | PostgreSQL 16 |
| Auth web | Cookie `httpOnly` + BFF proxy, RBAC admin/customer |
| Runtime lokal | Docker Compose (API, Postgres, observability) |
| Registry | GHCR, image API |
| Orkestrasi | kind (Kubernetes lokal) |
| IaC | Terraform, VPC dan EC2 di `ap-southeast-1` |
| CI/CD | GitHub Actions: Gitleaks, GoSec, Trivy, npm audit, lalu publish image |
| Observability | Prometheus, Grafana, Loki, Alertmanager |

## Arsitektur

```text
Browser
   │
   ▼
┌─────────────────────┐
│ SecureShop web      │  Next.js :3001
│ katalog langsung   │
│ mutasi lewat BFF   │
└────────┬───────────┘
         │
         ▼
┌─────────────────────┐     image API
│ SecureShop API      │──────────────┐
│ Go Fiber :8080     │               │
└────────┬────────────┘               │
         │                               │
    ┌────┴─────┐                          │
    ▼          ▼                          ▼
┌────────┐  ┌──────────────────┐     ┌──────────────────┐
│ Compose │  │ kind (lokal)     │     │ AWS lab        │
│ API+DB  │  │ manifest di k8s/ │     │ Terraform       │
│ + obs.  │  └──────────────────┘     │ VPC · EC2 + EIP  │
└────────┘                            └──────────────────┘
```

Alur delivery: push ke `main` menjalankan CI (uji dan scan). CD mempublikasikan image API ke GHCR hanya setelah CI pada SHA yang sama hijau. Storefront tidak ikut image itu.

## Struktur

| Direktori | Isi |
| --- | --- |
| [`ecommerce-api/apps/web/`](./ecommerce-api/apps/web) | Storefront SecureShop |
| [`ecommerce-api/server/`](./ecommerce-api/server) | API Go |
| [`ecommerce-api/`](./ecommerce-api) | Compose, migration, observability |
| [`k8s/`](./k8s) | Manifest kind |
| [`infra/terraform/`](./infra/terraform) | VPC dua AZ, security group, EC2 `t3.micro` + EIP |
| [`.github/workflows/`](./.github/workflows) | CI dan publikasi image API |

Image API: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (tag `latest` dan `main-<sha>`).

## Cara menjalankan

**Prasyarat:** Docker untuk API. Node.js untuk storefront. kind dan Terraform hanya untuk lab masing-masing.

### 1. API + observability

```bash
git clone https://github.com/akbarandriansyah22/devops-homelab.git
cd devops-homelab/ecommerce-api
cp .env.example .env
```

Isi `DB_PASSWORD`, `JWT_SECRET`, dan `METRICS_TOKEN` (contoh: `openssl rand -hex 32`). Set `DB_HOST=postgres`.

```bash
docker compose up -d --build
curl -sf http://localhost:8080/live
curl -sf http://localhost:8080/ready
```

| Layanan | URL |
| --- | --- |
| API | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Alertmanager | http://localhost:9093 |

Kredensial Grafana ada di `ecommerce-api/docker-compose.yml`.

### 2. Storefront

API harus sudah jalan di `:8080`.

```bash
cd ecommerce-api/apps/web
cp .env.example .env.local
npm install
npm run dev
```

Buka http://localhost:3001. `API_URL` di `.env.local` mengarah ke `http://localhost:8080`. Registrasi membuat customer (`role_id = 2`). Admin tidak dibuat dari form; ubah `role_id` menjadi `1` di database, lalu login lagi. Detailnya di [`ecommerce-api/apps/web/README.md`](./ecommerce-api/apps/web/README.md).

### 3. Cluster kind

Ikuti [`k8s/README.md`](./k8s/README.md). Jika `docker pull` dari GHCR gagal (`denied`), bangun image secara lokal lalu muat dengan `kind load`.

```bash
kind create cluster --name ecommerce --config k8s/kind-config.yaml
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
kubectl apply -f k8s/base
```

HTTPS lewat Ingress: [`k8s/README.md`](./k8s/README.md) (CA lab + `https://ecommerce.local`). Port-forward `8080` tetap bisa dipakai.

### 4. Lab AWS

Default-nya `plan`. `apply` membuat EC2, EBS, dan IP publik, jadi ada biaya.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
```

## CI/CD

| Workflow | Pemicu | Fungsi |
| --- | --- | --- |
| **CI** — `Go CI + DevSecOps Pipeline` | `ecommerce-api/**`, `k8s/**`, `infra/terraform/**`, atau file workflow | Job terpisah: `secrets`, `go-qa`, `api-image`, `fs-scan`, `web-qa`. HIGH/CRITICAL menggagalkan job |
| **CD** — `Publish image to GHCR` | CI di `main` sukses | Tag `main-<sha>` dan `latest` untuk image API. Image tidak ditandatangani |

Job CI tidak memakai `if: always()` untuk unggah SARIF. Action dipin ke commit SHA. Gitleaks memakai image resmi yang dipin digest, tanpa `continue-on-error`.

Dua false positive Gitleaks di-allowlist di [`.gitleaksignore`](./.gitleaksignore), bukan seluruh `.env.example`:

- `ecommerce-api/.env.example` — rule `generic-api-key` pada `JWT_EXPIRATION_HOURS=2`
- `ecommerce-api/server/internal/config/security_validation_test.go` — JWT dummy unit test

`workflow_dispatch` pada CD tidak mem-publish begitu saja. Input `confirm` harus `publish`, dan CI untuk SHA yang sama harus sudah sukses. Cosign tidak dipasang.

Dependabot mingguan ada di [`.github/dependabot.yml`](./.github/dependabot.yml). Dependabot alerts dan secret scanning tidak hidup hanya karena file itu ada; nyalakan manual di Settings → Code security.

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

Jika muncul `denied`, package masih private.

## Keputusan desain

| Keputusan | Alasan |
| --- | --- |
| kind, bukan EKS | Control plane EKS berbiaya per jam |
| EC2 di subnet publik, tanpa NAT Gateway | NAT Gateway terlalu mahal untuk lab |
| Image bisa dimuat ke kind tanpa GHCR | Package GHCR baru private secara default |
| Storefront di port 3001 | Grafana sudah memakai 3000 |
| Tidak ada payment gateway | Checkout hanya mencatat metode, supaya tidak mengklaim integrasi yang tidak ada |

Di luar cakupan: EKS, NAT Gateway, RDS, ALB, Helm, public CA, dan pembayaran sungguhan.

## Batasan

- Homelab / demonstrasi. Bukan production-grade dan bukan multi-region.
- `terraform apply` opsional dan berbiaya. Yang aman dicoba lebih dulu adalah `plan`.
- `ssh_cidr` dan `allowed_app_cidr` tidak punya default `0.0.0.0/0`. Isi `/32` lewat `terraform.tfvars`.
- Deployment kind memakai tag `latest`. Postgres di kind memakai `emptyDir` (data hilang saat Pod hilang).
- Package GHCR mungkin private sampai visibility diubah.
- Image belum ditandatangani.
- Allowlist Gitleaks hanya dua fingerprint false positive. Secret sungguhan tetap harus menggagalkan CI.

## File lokal yang tidak di-commit

| File | Template |
| --- | --- |
| `ecommerce-api/.env` | `.env.example` |
| `ecommerce-api/apps/web/.env.local` | `.env.example` |
| `k8s/base/secret.yaml` | `k8s/base/secret.example.yaml` |
| `infra/terraform/terraform.tfvars` | `terraform.tfvars.example` |

Jangan commit secret. State Terraform tetap di mesin lokal.

## Lisensi

MIT. Lihat [`LICENSE`](./LICENSE).

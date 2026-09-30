# devops-homelab

Homelab DevOps end-to-end untuk API e-commerce berbasis Go: dari kode aplikasi, containerisasi, pipeline CI/CD, cluster Kubernetes lokal, hingga infrastruktur AWS yang dikelola sebagai kode.

Dirancang sebagai bukti praktik DevOps nyata — bukan hanya daftar tool — dengan fokus pada otomasi, observability, dan keputusan desain yang sadar biaya.

[![CI](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/ci.yml?branch=main&label=CI&logo=github&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/ci.yml)
[![GHCR](https://img.shields.io/github/actions/workflow/status/akbarandriansyah22/devops-homelab/cd.yml?branch=main&label=GHCR%20publish&logo=docker&logoColor=white)](https://github.com/akbarandriansyah22/devops-homelab/actions/workflows/cd.yml)
[![Go](https://img.shields.io/badge/Go-1.25.2-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Ringkasan sistem

Repositori ini menghubungkan empat lapisan yang biasanya tersebar di lingkungan produksi:

1. **Aplikasi** — API e-commerce Go (Fiber) dengan PostgreSQL
2. **Runtime lokal** — Docker Compose plus stack observability (Prometheus, Grafana, Loki)
3. **Orkestrasi** — manifest Kubernetes untuk cluster kind
4. **Infrastruktur cloud** — Terraform untuk VPC dan EC2 di AWS (`ap-southeast-1`)

Alur delivery: perubahan kode masuk ke CI (uji dan scan), lalu image dipublikasikan ke GHCR, kemudian dapat dijalankan di Compose atau dimuat ke kind. Infrastruktur AWS diprovision terpisah lewat Terraform (`plan` sebagai default; `apply` bersifat opsional dan berbiaya).

Dokumentasi API: [`ecommerce-api/README.md`](./ecommerce-api/README.md).

## Skill yang dibuktikan

| Area | Yang ditunjukkan di repo ini |
| --- | --- |
| Backend | API Go (Fiber), konfigurasi lingkungan, health check (`/live`, `/ready`) |
| Containerisasi | Docker multi-service, Compose, image ke GHCR |
| CI/CD | GitHub Actions: gate SAST/scan, CD hanya setelah CI hijau |
| Kubernetes | Manifest kind, secret, NetworkPolicy, Ingress + TLS lab |
| Infrastructure as Code | Terraform: VPC 2 AZ, security group, EC2 `t3.micro` + EIP |
| Observability | Prometheus, Grafana, Loki, Alertmanager |
| Engineering judgment | Trade-off biaya (kind vs EKS, tanpa NAT Gateway), batasan cakupan yang eksplisit |

## Arsitektur

```text
                    ┌─────────────────────────┐
  Developer push    │   GitHub (main)         │
        │           │   CI, CD, GHCR        │
        ▼           └───────────┴────────────┘
┌───────────────┐               │ image
│ ecommerce-api ├──────────────┘
│ (Go + Fiber)  │
└──────┴───────┘
        │
   ┌──┴─────┐
   ▼          ▼
┌────────┐  ┌──────────────────┐
│ Compose│  │ kind (local K8s) │
│ + DB   │  │ manifests di k8s/│
│ + obs. │  └──────────────────┘
└────────┘
        │ opsional
        ▼
┌─────────────────────────────┐
│ AWS (Terraform)              │
│ VPC 2 AZ · SG · EC2 + EIP    │
│ wilayah: ap-southeast-1      │
└─────────────────────────────┘
```

**Alur singkat**

1. Developer mengubah kode di `ecommerce-api/`
2. CI berjalan pada path terkait dan harus hijau (Gitleaks, GoSec high, Trivy HIGH/CRITICAL, npm audit high)
3. CD mempublikasikan image ke GHCR hanya setelah CI di `main` sukses pada SHA yang sama
4. Lokal: jalankan via Compose, atau muat image ke cluster kind + Ingress TLS
5. Cloud: provision jaringan dan mesin uji dengan Terraform (default hanya `plan`)

## Stack teknologi

| Lapisan | Teknologi |
| --- | --- |
| Bahasa & framework | Go 1.25.2, Fiber |
| Data | PostgreSQL 16 |
| Container | Docker, Docker Compose |
| Registry | GitHub Container Registry (GHCR) |
| Orkestrasi | kind (Kubernetes lokal) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Observability | Prometheus, Grafana, Loki, Alertmanager |

## Struktur repositori

| Direktori | Deskripsi |
| --- | --- |
| [`ecommerce-api/`](./ecommerce-api) | API Go, Compose, dan stack observability |
| [`k8s/`](./k8s) | Manifest Kubernetes untuk kind |
| [`infra/terraform/`](./infra/terraform) | VPC dua AZ, security group, EC2 `t3.micro` + EIP |
| [`.github/workflows/`](./.github/workflows) | Workflow CI dan publikasi image ke GHCR |

Image: `ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api` (tag `latest` dan `main-<sha>`).

## Cara menjalankan

**Prasyarat:** Docker. kind dan Terraform hanya diperlukan untuk bagian masing-masing.

### 1. API + observability (Docker Compose)

```bash
git clone https://github.com/akbarandriansyah22/devops-homelab.git
cd devops-homelab/ecommerce-api
cp .env.example .env
```

Lengkapi `DB_PASSWORD`, `JWT_SECRET`, dan `METRICS_TOKEN` (contoh: `openssl rand -hex 32`). Atur `DB_HOST=postgres`.

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

Kredensial Grafana tersedia di `ecommerce-api/docker-compose.yml`.

### 2. Cluster kind

Ikuti [`k8s/README.md`](./k8s/README.md). Jika `docker pull` dari GHCR gagal (`denied`), bangun image secara lokal lalu muat ke cluster dengan `kind load`.

```bash
kind create cluster --name ecommerce --config k8s/kind-config.yaml
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
kubectl apply -f k8s/base
```

HTTPS lewat Ingress: lihat [`k8s/README.md`](./k8s/README.md) (CA lab + `https://ecommerce.local`). Port-forward `8080` tetap bisa dipakai sebagai fallback.

### 3. Infrastruktur AWS (Terraform)

Lihat [`infra/terraform/`](./infra/terraform). Perintah default adalah `plan`; resource AWS belum dibuat secara otomatis.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
```

Perintah `apply` membuat EC2, EBS, dan alamat IP publik — ada biaya. Langkah `destroy` terdokumentasi di README folder tersebut.

## CI/CD

| Workflow | Pemicu | Fungsi |
| --- | --- | --- |
| **CI** — `Go CI + DevSecOps Pipeline` | `ecommerce-api/**`, `k8s/**`, `infra/terraform/**`, atau file workflow | Job terpisah: `secrets`, `go-qa`, `api-image`, `fs-scan`, `web-qa`. HIGH/CRITICAL gagalkan job |
| **CD** — `Publish image to GHCR` | CI di `main` selesai sukses | Tag `main-<sha>` dan `latest` (lab). Tidak menandatangani image |

Job CI tidak memakai `if: always()` untuk unggah SARIF. Unggahan hanya terjadi jika file SARIF benar-benar ada. Action dipin ke commit SHA. Gitleaks memakai image resmi yang dipin digest, perintah `gitleaks detect --source . --no-git --verbose --redact`, tanpa `continue-on-error`.

Dua false positive Gitleaks di-allowlist di [`.gitleaksignore`](./.gitleaksignore), bukan seluruh `.env.example`:

- `ecommerce-api/.env.example` — rule `generic-api-key` pada `JWT_EXPIRATION_HOURS=2`
- `ecommerce-api/server/internal/config/security_validation_test.go` — JWT dummy unit test

`workflow_dispatch` pada CD tidak mem-publish begitu saja. Input `confirm` harus bernilai `publish`, dan run CI untuk SHA yang sama harus sudah sukses. Cosign keyless tidak dipasang: butuh penyetelan OIDC/GitHub yang belum ada di lab ini, dan tidak ditambah secret baru untuk itu.

Dependabot mingguan ada di [`.github/dependabot.yml`](./.github/dependabot.yml) (Go module, npm web, Docker API, GitHub Actions) dengan batas PR terbuka kecil. **Dependabot alerts** dan **secret scanning** tidak hidup hanya karena file itu ada. Nyalakan manual di GitHub: Settings → Code security → Dependabot alerts, Dependabot security updates, dan Secret scanning (termasuk push protection jika tersedia di plan repo).

`fs-scan` menjalankan Trivy config pada `infra/terraform` dan `k8s/` (gate HIGH/CRITICAL). Finding yang disengaja untuk lab ada di [`.trivyignore`](./.trivyignore).

```bash
docker pull ghcr.io/akbarandriansyah22/devops-homelab/ecommerce-api:latest
```

Jika muncul `denied`, package masih private. Login ke `ghcr.io` atau ubah visibility package.

## Keputusan desain

Pilihan di bawah dibuat agar lab tetap realistis secara teknis, tetapi hemat biaya:

| Keputusan | Alasan |
| --- | --- |
| kind, bukan EKS | Control plane EKS dikenai biaya per jam |
| EC2 di subnet publik tanpa NAT Gateway | NAT Gateway terlalu mahal untuk skala lab |
| Image dapat dimuat ke kind tanpa GHCR | Package baru di GHCR bersifat private secara default |

**Di luar cakupan saat ini:** EKS, NAT Gateway, RDS, ALB, Helm, public CA / Let's Encrypt.

## Batasan & rencana berikutnya

**Batasan**

- Lingkungan ini homelab / demonstrasi. Bukan klaim production-grade, bukan multi-region, dan bukan pengganti kontrol perusahaan
- `terraform apply` opsional dan berbiaya; yang aman untuk dicoba lebih dulu adalah `plan`
- `ssh_cidr` dan `allowed_app_cidr` tidak punya default `0.0.0.0/0`. Isi `/32` lewat `terraform.tfvars` (lihat `terraform.tfvars.example`). Egress security group ke `0.0.0.0/0` tetap ada supaya EC2 lab bisa menarik image
- Deployment kind memakai tag `latest`, Postgres memakai `emptyDir` (data hilang saat Pod hilang). NetworkPolicy API hanya mengizinkan namespace `ingress-nginx`
- Package GHCR mungkin private hingga visibility diubah
- Image belum ditandatangani (Cosign tidak dipasang)
- Allowlist Gitleaks di atas hanya dua fingerprint false positive. Secret sungguhan tetap harus gagalkan CI

**Arah pengembangan (contoh)**

- Remote state Terraform dan modul yang lebih rapi
- Image signing (Cosign) dan pin digest di Deployment
- Helm chart atau Kustomize overlay untuk environment

## File konfigurasi lokal

| File | Template |
| --- | --- |
| `ecommerce-api/.env` | `.env.example` |
| `k8s/base/secret.yaml` | `k8s/base/secret.example.yaml` |
| `infra/terraform/terraform.tfvars` | `terraform.tfvars.example` |

File state Terraform (`*.tfstate`) hanya disimpan di mesin lokal. Jangan commit secret.

## Lisensi

MIT. Lihat [`LICENSE`](./LICENSE).

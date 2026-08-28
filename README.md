# Garanti Yatırım Ortaklığı

Kurumsal site: [Next.js](https://nextjs.org) 16 + [Payload](https://payloadcms.com) 3 + PostgreSQL.

Site, admin paneli (`/admin`) ve API aynı Node sürecinde çalışır. Veritabanı PostgreSQL’dir; MongoDB kullanılmaz.

## Gereksinimler

- Node.js 20.9+
- pnpm 9+
- PostgreSQL 16 (yerel kurulum veya aşağıdaki Docker)

## Geliştirme

```bash
cp .env.example .env
```

`.env` içinde en az şunlar olmalı:

```env
DATABASE_URL=postgres://gyo:gyo@127.0.0.1:5432/gyo_cms
PAYLOAD_SECRET=uzun-rastgele-bir-deger
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Postgres’i Docker ile ayağa kaldırmak için:

```bash
docker compose up -d
```

Makinede zaten 5432’de bir Postgres varsa Docker’a gerek yok; `DATABASE_URL`’i o örneğe göre ayarlayın.

```bash
pnpm install
pnpm dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

İlk açılışta admin kullanıcısı oluşturulur. Medya ve PDF’ler `S3_BUCKET` tanımlı değilse `media/` ve `documents/` klasörlerine yazılır.

## Üretim (tek sunucu)

Aynı makinede Node + PostgreSQL + reverse proxy (nginx/Caddy) yeter. S3 zorunlu değildir.

```bash
pnpm build
pnpm start
```

Zorunlu ortam değişkenleri: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`. İsteğe bağlı SMTP, reCAPTCHA, GA4 ve S3/R2 için `.env.example` dosyasına bakın.

Git deposunda CMS verisi ve yüklenen dosyalar yoktur. Taşırken Postgres yedeği ile `media/` ve `documents/` klasörlerini de kopyalayın.

## Eski siteden içerik

İçerik boş bir veritabanına script’lerle aktarılabilir (`pnpm migrate:fetch` … `pnpm migrate:seed`). Bu adımlar eski siteye erişim ve `.migration/` altında bir anlık görüntü ister; günlük geliştirme için gerekli değildir.

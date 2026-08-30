import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { tr } from '@payloadcms/translations/languages/tr'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Awards } from './collections/Awards'
import { ContactMessages } from './collections/ContactMessages'
import { CommissionYears } from './collections/CommissionYears'
import { DocumentArchiveItems } from './collections/DocumentArchiveItems'
import { Documents } from './collections/Documents'
import { Faqs } from './collections/Faqs'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { Users } from './collections/Users'
import { ContactInfo } from './globals/ContactInfo'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/*
 * Depolama: yerel geliştirmede diske yazıyoruz. S3/R2 kimlik bilgileri tanımlıysa
 * (üretim) devreye giriyor. 268 MB'lık PDF arşivi Vercel gibi salt-okunur
 * dosya sistemlerinde diske yazılamayacağı için bu geçiş zorunlu.
 */
const storagePlugins: Plugin[] = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: {
          documents: { prefix: 'documents' },
          media: { prefix: 'media' },
        },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION ?? 'auto',
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
          },
        },
      }),
    ]
  : []

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | Garanti Yatırım Ortaklığı',
    },
  },
  collections: [
    Pages,
    DocumentArchiveItems,
    People,
    CommissionYears,
    Faqs,
    Awards,
    Documents,
    Media,
    ContactMessages,
    Users,
  ],
  globals: [Navigation, SiteSettings, ContactInfo],
  localization: {
    locales: [
      { code: 'tr', label: { tr: 'Türkçe', en: 'Turkish' } },
      { code: 'en', label: { tr: 'İngilizce', en: 'English' } },
    ],
    defaultLocale: 'tr',
    /*
     * fallback kapalı: TR içeriğin çevirisi yapılmamış bir sayfada İngilizce
     * ziyaretçiye Türkçe metin göstermek istemiyoruz. Eksik çeviriler
     * translationStatus alanıyla takip ediliyor.
     */
    fallback: false,
  },
  i18n: {
    supportedLanguages: { tr, en },
    fallbackLanguage: 'tr',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Railway gibi boş Postgres'te tabloları ilk açılışta oluştur.
    // Yerel dump restore sonrası da additive kalır.
    push: true,
  }),
  sharp,
  plugins: [
    ...storagePlugins,
    seoPlugin({
      collections: ['pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string })?.title ?? ''} | Garanti Yatırım Ortaklığı`,
    }),
    searchPlugin({
      collections: ['pages'],
      defaultPriorities: {
        pages: 10,
      },
    }),
  ],
})

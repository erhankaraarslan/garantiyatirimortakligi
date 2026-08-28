/**
 * TR ve EN sayfalarının eşleştirmesi.
 *
 * Eski sitede iki dil tamamen ayrı sayfa ağaçları olarak tutulmuş ve slug'lar
 * birbirine benzemiyor (ör. /tr/vizyon -> /en/our-vision). Payload'da bunlar
 * TEK doküman + localized slug olarak modellendiği için eşleştirmenin açıkça
 * verilmesi gerekiyor; otomatik tahmin güvenilir değil.
 *
 * Anahtar: TR clean path. Değer: EN clean path (yoksa null).
 */
export const TR_TO_EN: Record<string, string | null> = {
  '/tr/ana-sayfa': '/en/home',
  '/tr/site-haritasi': '/en/site-map',
  '/tr/sikca-sorulan-sorular': '/en/frequently-asked-questions',
  '/tr/kullanim-ve-gizlilik-politikasi': '/en/use-and-confidentiality-policy',
  '/tr/kisisel-verilerin-korunmasi-hakkinda-bilgilendirme':
    '/en/personal-data-protection-notice',
  '/tr/vizyon': '/en/our-vision',
  '/tr/bize-ulasin': '/en/contact-us',

  '/tr/kurumsal': '/en/corporate',
  '/tr/kurumsal/yonetim-kurulu-uyeleri': '/en/corporate/members-of-the-board',
  '/tr/kurumsal/ust-yonetim': '/en/corporate/top-management',
  '/tr/kurumsal/organizasyon-semasi': '/en/corporate/organization-chart',
  '/tr/kurumsal/oduller': '/en/corporate/awards',
  '/tr/kurumsal/akademik-gorusler': '/en/corporate/academic-views',
  '/tr/kurumsal/akademik-gorusler/yararlanma-kosullari': '/en/corporate/academic-views/terms-of-use',
  '/tr/kurumsal/akademik-gorusler/yazilar': '/en/corporate/academic-views/articles',

  '/tr/insan-kaynaklari': '/en/human-relations',
  '/tr/insan-kaynaklari/ucretlendirme-politikasi': '/en/human-relations/salary-policy',
  '/tr/insan-kaynaklari/personel-tazminat-politikasi':
    '/en/human-relations/personnel-compensation-policy',
  '/tr/insan-kaynaklari/personel-yedekleme-planlamasi':
    '/en/human-relations/personnel-succession-planning',

  '/tr/surekli-bilgilendirme-formu': '/en/regular-public-disclosure-form',

  '/tr/yatirimci-iliskileri': '/en/investor-relations',
  '/tr/yatirimci-iliskileri/yatirimci-iliskileri-bolumu-iletisim':
    '/en/investor-relations/shareholder-relation-departments-communication',

  '/tr/yatirimci-iliskileri/kurumsal-yonetim': '/en/investor-relations/corporate-management',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/yonetim-kurulu-ic-yonerge':
    '/en/investor-relations/corporate-management/board-of-directors-internal-directive',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/yonetim-kurulu-komiteleri-ve-calisma-esaslari':
    '/en/investor-relations/corporate-management/board-of-management-committee-and-working-principles',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/kurumsal-yonetim-uyum-ve-raporu':
    '/en/investor-relations/corporate-management/corporate-governance-compliance-report',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/sermaye-ve-ortaklik-yapisi':
    '/en/investor-relations/corporate-management/capital-and-partnership-structure',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/ticaret-sicil-bilgileri':
    '/en/investor-relations/corporate-management/commercial-registry-information',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/sirket-esas-sozlesmesi':
    '/en/investor-relations/corporate-management/articles-of-association',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/esas-sozlesme-degisiklikleri':
    '/en/investor-relations/corporate-management/articles-of-association-amendments',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/pay-alim-teklifi-bilgi-formlari':
    '/en/investor-relations/corporate-management/tender-offer-information-forms',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/politikalar':
    '/en/investor-relations/corporate-management/policies',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/kurumsal-yonetim-uyum-derecelendirmesi':
    '/en/investor-relations/corporate-management/compliance-rating-of-corporate-governance',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/bagimsiz-denetim-sirketi-bilgisi':
    '/en/investor-relations/corporate-management/informing-of-the-independent-audit-company',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/iliskili-taraflarla-yapilan-islemler':
    '/en/investor-relations/corporate-management/related-party-transactions',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/ozel-durum-aciklamalari':
    '/en/investor-relations/corporate-management/special-case-comments',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/iceriden-ogrenenler-listesi':
    '/en/investor-relations/corporate-management/insider-list',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/etik-ilke-ve-kurallar':
    '/en/investor-relations/corporate-management/garanti-investment-trust-inc-code-of-conduct',

  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul':
    '/en/investor-relations/corporate-management/general-assembly',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-ic-yonergesi':
    '/en/investor-relations/corporate-management/general-assembly/general-assembly-internal-directive',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/oy-kullanma-sekli':
    '/en/investor-relations/corporate-management/general-assembly/the-way-of-voting',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/vekaletname-ornegi':
    '/en/investor-relations/corporate-management/general-assembly/sample-for-letter-of-attorney',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-gundemleri':
    '/en/investor-relations/corporate-management/general-assembly/general-assemblys-agendas',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-ilanlari':
    '/en/investor-relations/corporate-management/general-assembly/announcements',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-tutanaklari':
    '/en/investor-relations/corporate-management/general-assembly/minutes-of-general-assembly',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/hazirunlar':
    '/en/investor-relations/corporate-management/general-assembly/attendance-lists',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/bilgilendirme-dokumanlari':
    '/en/investor-relations/corporate-management/general-assembly/information-documents',

  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler':
    '/en/investor-relations/operational-and-financial-datas',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/finansal-tablolar-ve-dipnotlar':
    '/en/investor-relations/operational-and-financial-datas/financial-statements',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/faaliyet-raporlari':
    '/en/investor-relations/operational-and-financial-datas/annual-reports',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/bagimsiz-denetim-raporlari':
    '/en/investor-relations/operational-and-financial-datas/independent-audit-reports',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/sermaye-artirimlari':
    '/en/investor-relations/operational-and-financial-datas/capital-increases',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/performans-sunus-raporlari':
    '/en/investor-relations/operational-and-financial-datas/performance-presentation-reports',
}

/** Yıl bazlı komisyon alt sayfaları program yoluyla eşleştiriliyor. */
export function commissionPagePair(year: number): { tr: string; en: string } {
  const tr = `/tr/surekli-bilgilendirme-formu/${year}-yili-komisyon-bilgileri`
  const en = `/en/regular-public-disclosure-form/the-commission-information-of-the-year-${year}`
  return { tr, en }
}

/**
 * TR karşılığı olmayan EN sayfaları. Başkanın Mesajı yalnızca EN'de mevcut;
 * TR tarafında yeni oluşturulacak ve çeviri gerektirdiği için işaretlenecek.
 */
export const EN_ONLY: Record<string, { trSlug: string; trTitle: string }> = {
  '/en/the-presidents-message': {
    trSlug: 'baskanin-mesaji',
    trTitle: 'Başkanın Mesajı',
  },
}

/**
 * Doküman arşivi sayfalarının kategori anahtarları (TR yolları).
 * EN karşılıkları TR_TO_EN üzerinden türetiliyor; bkz. archiveCategoryFor().
 */
export const ARCHIVE_CATEGORIES: Record<string, string> = {
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/faaliyet-raporlari': 'faaliyet-raporlari',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/finansal-tablolar-ve-dipnotlar':
    'finansal-tablolar',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/bagimsiz-denetim-raporlari':
    'bagimsiz-denetim-raporlari',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/performans-sunus-raporlari':
    'performans-sunus-raporlari',
  '/tr/yatirimci-iliskileri/operasyonel-finansal-veriler/sermaye-artirimlari': 'sermaye-artirimlari',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-gundemleri':
    'genel-kurul-gundemleri',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-ilanlari':
    'genel-kurul-ilanlari',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-tutanaklari':
    'genel-kurul-tutanaklari',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/hazirunlar': 'hazirunlar',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/bilgilendirme-dokumanlari':
    'bilgilendirme-dokumanlari',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/genel-kurul/genel-kurul-ic-yonergesi':
    'genel-kurul-ic-yonergesi',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/politikalar': 'politikalar',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/yonetim-kurulu-ic-yonerge': 'yonetim-kurulu-ic-yonerge',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/yonetim-kurulu-komiteleri-ve-calisma-esaslari':
    'yonetim-kurulu-komiteleri',
  '/tr/yatirimci-iliskileri/kurumsal-yonetim/pay-alim-teklifi-bilgi-formlari':
    'pay-alim-teklifi-bilgi-formlari',
  '/tr/insan-kaynaklari/personel-tazminat-politikasi': 'personel-tazminat-politikasi',
  '/tr/insan-kaynaklari/personel-yedekleme-planlamasi': 'personel-yedekleme-planlamasi',
  '/tr/kurumsal/akademik-gorusler/yazilar': 'akademik-yazilar',
}

/**
 * EN arşiv yollarını TR kategorilerine bağlar. Aynı kategori anahtarı iki dilde
 * kullanılıyor; kayıtlar `language` alanıyla ayrışıyor.
 */
const EN_ARCHIVE_CATEGORIES: Record<string, string> = Object.fromEntries(
  Object.entries(ARCHIVE_CATEGORIES)
    .map(([trPath, category]) => [TR_TO_EN[trPath], category] as const)
    .filter((entry): entry is readonly [string, string] => typeof entry[0] === 'string'),
)

/** Bir sayfanın (TR veya EN) arşiv kategorisini döndürür. */
export function archiveCategoryFor(cleanPath: string): string | undefined {
  return ARCHIVE_CATEGORIES[cleanPath] ?? EN_ARCHIVE_CATEGORIES[cleanPath]
}

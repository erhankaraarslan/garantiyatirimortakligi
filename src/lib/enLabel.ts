/**
 * TR doküman / arşiv / ek etiketlerini İngilizceye çevirir.
 * Tarih + Genel Kurul kalıpları sözlükten önce uygulanır; kalan özel adlar EXACT haritada.
 */

const MONTHS: Record<string, string> = {
  Ocak: 'January',
  Şubat: 'February',
  Mart: 'March',
  Nisan: 'April',
  Mayıs: 'May',
  Haziran: 'June',
  Temmuz: 'July',
  Ağustos: 'August',
  Eylül: 'September',
  Ekim: 'October',
  Kasım: 'November',
  Aralık: 'December',
}

const EXACT: Record<string, string> = {
  'Esas Sözleşme': 'Articles of Association',
  'Etik İlke ve Kurallar': 'Code of Conduct',
  'Organizasyon Şeması': 'Organization Chart',
  'Ücretlendirme Politikası': 'Remuneration Policy',
  'KVKK Başvuru Formu': 'Personal Data Protection Application Form',
  'İmtiyazlı paylara ilişkin bilgiler': 'Information on privileged shares',
  'Vekaleten Oy Kullanma Formu': 'Form of Voting by Proxy',
  'Çağrı Yoluyla Vekalet Verme Örneği': 'Sample Power of Attorney by Solicitation',
  'Bağımsız Denetçi Raporu': 'Independent Auditor’s Report',
  'Bağımsızlık Beyanları': 'Declarations of Independence',
  'Bağımsızlık Niteliğine Sahip Olunup Olunmadığına Dair Belge':
    'Statement on Whether Independence Criteria Are Met',
  'Bağış ve Yardımlara İlişkin Politika': 'Donations and Aid Policy',
  'Bilgilendirme Politikası': 'Disclosure Policy',
  'Kar Dağıtım Politikası': 'Dividend Distribution Policy',
  'Kar Dağıtım Tablosu': 'Dividend Distribution Table',
  'Kadın Üye Politikası': 'Policy on Female Board Members',
  'Menfaat Sahipleri Yönetmeliği': 'Stakeholders Regulation',
  'Personel Tazminat Politikası': 'Personnel Compensation Policy',
  'Personel Yedekleme Planlaması': 'Personnel Succession Planning',
  'Geri Alım Politikası': 'Share Buy-Back Policy',
  'Geri Alım Programı': 'Share Buy-Back Programme',
  'Geri Alım Programı ve Politikaları': 'Share Buy-Back Programme and Policies',
  'Pay Alım Teklifi Yoluyla Geri Alım Bilgi Formu': 'Tender Offer Buy-Back Information Form',
  'Pay Alım Teklifi Yoluyla Payların Geri Alınmasına İlişkin Bilgi Formu':
    'Information Form on Share Buy-Back by Tender Offer',
  'Gönüllü/Zorunlu Pay Alım Teklifi Yoluyla .......Tarafından Devralınmasına İlişkin Pay Alım Teklifi Bilgi Formu':
    'Tender Offer Information Form on Acquisition by Voluntary/Mandatory Tender Offer',
  'Denetimden Sorumlu Komite': 'Audit Committee',
  'Denetimden Sorumlu Komite Çalışma Esasları': 'Audit Committee Working Principles',
  'Kurumsal Yönetim Komitesi': 'Corporate Governance Committee',
  'Kurumsal Yönetim Komitesi Çalışma Esasları': 'Corporate Governance Committee Working Principles',
  'Riskin Erken Saptanması Komitesi': 'Early Detection of Risk Committee',
  'Riskin Erken Saptanması Komitesi Çalışma Esasları':
    'Early Detection of Risk Committee Working Principles',
  'Yönetim Kurulu İç Yönerge': 'Board of Directors Internal Directive',
  'Yönetim Kurulu Kar Dağıtım Önerisi': 'Board Proposal on Dividend Distribution',
  'Yönetim Kurulu Üye Adayları Hakkında Bilgi': 'Information on Board Member Nominees',
  'İç Yönerge': 'Internal Directive',
  'Genel Kurul İç Yönergesi': 'General Assembly Internal Directive',
  'Garanti Yatırım Ortaklığı A.Ş. Genel Kurulunun Çalışma Esas ve Usulleri Hakkında İç Yönerge':
    'Internal Directive on the Working Principles and Procedures of the General Assembly of Garanti Investment Trust Inc.',
  'Genel Kurul Toplantısında Pay Sahipleri Tarafından Sorulan Sorular Ve Bu Sorulara Verilen Cevaplar':
    'Questions Asked by Shareholders at the General Assembly and the Answers Given',
  'Esas Sözleşme Tadil Metni': 'Amendment Text to the Articles of Association',
  'Esas Sözleşme Değişikliği Tadil Metni 1': 'Articles of Association Amendment Text 1',
  'Esas Sözleşme Değişikliği Tadil Metni 2': 'Articles of Association Amendment Text 2',
  '1996 - Halka Arz': '1996 — IPO',
  'Av.Hande Bengisu Çalışmaları': 'Work by Hande Bengisu, Attorney at Law',
  'Metin Özhan Çalışması': 'Work by Metin Özhan',
  'O.Kaan Kiziroğlu Yüksek Lisans Tezi': 'Master’s thesis by O. Kaan Kiziroğlu',
  'Reha Tanör Makaleleri': 'Articles by Reha Tanör',
  'ANONİM ORTAKLIKLARDA KURUMSAL YÖNETİM VE KURUMSAL YÖNETİM DERECELENDİRME UYGULAMALARININ ESASLARI':
    'Principles of Corporate Governance in Joint-Stock Companies and Corporate Governance Rating Practices',
  'KURUMSAL YÖNETİM ARAYIŞLARI DOĞRULTUSUNDA BANKA YÖNETİM KURULUNDA BAĞIMSIZ ÜYELİK':
    'Independent Membership of Bank Boards of Directors in Light of Corporate Governance Reforms',
  'SERMAYE PİYASALARINDA HİSSE SENEDİ HALKA ARZLARI VE SONRASINDA UYGULANAN FİYAT İSTİKRARI YÖNTEMLERİ':
    'Equity IPOs in Capital Markets and Post-Offering Price Stabilisation Methods',
  'SERMAYE PİYASASI HUKUKUNDA ULUSLARARASI YARGI KARARLARI 1':
    'International Case Law in Capital Markets Law 1',
  'SERMAYE PİYASASI HUKUKUNDA ULUSLARARASI YARGI KARARLARI 2':
    'International Case Law in Capital Markets Law 2',
  'SPK’NIN, YÖNETİM KURULUNDA BAĞIMSIZ ÜYE BULUNDURULMASINA İLİŞKİN KURUMSAL YÖNETİM İLKESİNİN HİSSE SENETLERİ HALKA ARZEDİLMİŞ OLAN BANKALARA UYGULANMASINI':
    'Application of the CMB Corporate Governance Principle Requiring Independent Board Members to Banks Whose Shares Are Publicly Offered',
  'Shareholder kontrol': 'Shareholder control',
  'Financial Statements': 'Financial Statements',
  'Audit Committee': 'Audit Committee',
  'Corporate Governance Committee': 'Corporate Governance Committee',
  'Early Detection Of the Risks Committee': 'Early Detection of Risk Committee',
  'Information Policy': 'Information Policy',
  'Policy about Donations and Aids': 'Policy on Donations and Aid',
  'Profit Appropriation Policy': 'Profit Appropriation Policy',
  'Buy-Back Program and Policies': 'Buy-Back Programme and Policies',
}

const URL_TITLES: Record<string, string> = {
  '20132514121821_Izahname1996.pdf': 'Prospectus 1996',
  '20132793635747_BİLGİLENDİRME%20POLITIKA.pdf': 'Disclosure Policy',
  '20132793635747_BİLGİLENDİRME POLITIKA.pdf': 'Disclosure Policy',
  '20132793659372_KarDagitimPolitikasi.pdf': 'Dividend Distribution Policy',
}

const TR_LEFTOVER =
  /[ğĞşŞıİüÜöÖçÇ]|\b(yılı|yılına|tarihli|genel|kurul|tutanağı|gündemi|ilan|hazirun|faaliyet|raporu|çeyrek|sayı|politikası|sözleşme|yönerge|komite|esas|bilgilendirme|dökümanı|dokümanı|izahname|sirküler)\b/i

export function needsEnglishTranslation(value: string | null | undefined): boolean {
  const text = (value ?? '').trim()
  if (!text) return true
  return TR_LEFTOVER.test(text) || text.startsWith('http')
}

export function toEnglishLabel(input: string | null | undefined): string {
  const raw = (input ?? '').trim()
  if (!raw) return ''
  if (EXACT[raw]) return EXACT[raw]

  if (/^https?:\/\//i.test(raw)) return titleFromUrl(raw)

  let text = raw

  text = text.replace(/^TTSG\s+(.+?)\s+Sayı\s+(\d+)$/i, 'TTSG $1 Issue $2')
  text = text.replace(/^(\d{4})\s*[-–]\s*(\d)\s*[. ]?\s*[Çç]eyrek$/i, '$1-Q$2')
  text = text.replace(/^(\d{4})\s+[Yy]ılı\s+Faaliyet Raporu$/i, '$1 Annual Report')
  text = text.replace(/^(\d{4})\s+Yılı Kurumsal Yönetim İlkeleri Uyum Raporu$/i, '$1 Corporate Governance Principles Compliance Report')
  text = text.replace(/^KY Uyum Raporu\s+(\d{4})$/i, 'CG Compliance Report $1')
  text = text.replace(/^İlişkili Taraf Açıklamaları\s+(\d{4})$/i, 'Related-Party Disclosures $1')
  text = text.replace(/^İzahname\s+(\d{4})$/i, 'Prospectus $1')
  text = text.replace(/^Sirküler\s+(\d{4})$/i, 'Circular $1')
  text = text.replace(
    /Garanti Yatırım Ortaklığı A\.Ş\.?\s*Performans Sunuş Raporu\s+/g,
    'Garanti Investment Trust Inc. Performance Presentation Report ',
  )

  const dated = translateDatedDocument(text)
  if (dated) return dated

  const yearPrefix = text.match(/^(\d{4})\s+[Yy]ılı(?:na\s+ait)?\s+(.+)$/)
  if (yearPrefix) {
    const kind = applyPhrases(yearPrefix[2]!)
    const head = kind.charAt(0).toUpperCase() + kind.slice(1)
    return `${head} for ${yearPrefix[1]}`
  }

  text = applyPhrases(text)
  return text
}

function titleFromUrl(url: string): string {
  let filename = url.split('/').pop() ?? url
  try {
    filename = decodeURIComponent(filename)
  } catch {
    /* keep */
  }
  if (URL_TITLES[filename] || URL_TITLES[url.split('/').pop() ?? '']) {
    return URL_TITLES[filename] ?? URL_TITLES[url.split('/').pop() ?? ''] ?? filename
  }
  const encoded = url.split('/').pop() ?? ''
  if (URL_TITLES[encoded]) return URL_TITLES[encoded]
  const withoutPrefix = filename.replace(/^\d+_/, '').replace(/\.[A-Za-z0-9]+$/, '')
  return toEnglishLabel(withoutPrefix) || withoutPrefix
}

function translateDatedDocument(text: string): string | null {
  const monthNames = Object.keys(MONTHS).join('|')
  const named = text.match(
    new RegExp(`^(\\d{1,2})\\s+(${monthNames})\\s+(\\d{4})\\s+[Tt]arihli\\s+(.+)$`),
  )
  if (named) {
    const [, day, monthTr, year, rest] = named
    const monthEn = MONTHS[monthTr!] ?? monthTr
    return composeDated(rest!, `${Number(day)} ${monthEn} ${year}`)
  }

  const dotted = text.match(/^(\d{1,2})\.(\d{2})\.(\d{4})\s+[Tt]arihli\s+(.+)$/)
  if (dotted) {
    const [, day, month, year, rest] = dotted
    const monthName = Object.values(MONTHS)[Number(month) - 1] ?? month
    return composeDated(rest!, `${Number(day)} ${monthName} ${year}`)
  }

  return null
}

function composeDated(rest: string, dated: string): string {
  const yearOf = rest.match(/(\d{4})\s+[Yy]ılına\s+[Aa]it/)?.[1]
  const withoutYear = rest
    .replace(/\d{4}\s+[Yy]ılına\s+[Aa]it\s*/g, '')
    .replace(/\d{4}\s+[Yy]ılı\s*/g, '')
    .trim()
  const kind = applyPhrases(withoutYear || rest)
  const forYear = yearOf ? ` for ${yearOf}` : ''
  const head = kind.charAt(0).toUpperCase() + kind.slice(1)
  return `${head}${forYear}, dated ${dated}`
}

const PHRASES: [RegExp, string][] = [
  [/Olağanüstü Genel Kurul Bilgilendirme Dokümanı/gi, 'Extraordinary General Assembly information document'],
  [/Olağanüstü Genel Kurul Toplantı Tutanağı/gi, 'minutes of the Extraordinary General Assembly'],
  [/Olağanüstü Genel Kurul İlan Metni/gi, 'Extraordinary General Assembly announcement'],
  [/Olağanüstü Genel Kurul Gündemi/gi, 'agenda of the Extraordinary General Assembly'],
  [/Olağanüstü Genel Kurul Hazirun Cetveli/gi, 'attendance list of the Extraordinary General Assembly'],
  [/Genel Kurulda onaylanan Geri Alım Programı/gi, 'share buy-back programme approved at the General Assembly'],
  [/Genel Kurul Bilgilendirme Dökümanı/gi, 'General Assembly information document'],
  [/Genel Kurul Bilgilendirme Dokümanı/gi, 'General Assembly information document'],
  [/Genel Kurul Hazirun Cetveli/gi, 'General Assembly attendance list'],
  [/Genel Kurul Hazirun\b/gi, 'General Assembly attendance list'],
  [/Genel Kurul ilan metni/gi, 'General Assembly announcement'],
  [/Genel kurul ilan metni/gi, 'General Assembly announcement'],
  [/Genel Kurul İlan Metni/gi, 'General Assembly announcement'],
  [/Genel Kurul İlanı/gi, 'General Assembly announcement'],
  [/Genel Kurul Tutanağı/gi, 'minutes of the General Assembly'],
  [/Genel Kurul tutanağı/gi, 'minutes of the General Assembly'],
  [/Toplantı Tutanağı/gi, 'meeting minutes'],
  [/Genel Kurul Gündemi\.pdf/gi, 'General Assembly agenda'],
  [/Genel Kurul gündemi/gi, 'General Assembly agenda'],
  [/Genel Kurul Gündemi/gi, 'General Assembly agenda'],
  [/(\d{4})\s+[Yy]ılına\s+[Aa]it/g, 'for $1'],
  [/(\d{4})\s+[Yy]ılı\b/g, '$1'],
  [/\.pdf$/i, ''],
]

function applyPhrases(text: string): string {
  let result = text
  for (const [pattern, replacement] of PHRASES) {
    result = result.replace(pattern, replacement)
  }
  return result.replace(/\s+/g, ' ').trim()
}

export function mergeArchiveByDocument<T extends { id: number; language?: string | null; document?: unknown }>(
  items: T[],
): T[] {
  const preferred = [...items].sort((a, b) => {
    if (a.language === b.language) return 0
    return a.language === 'en' ? -1 : 1
  })
  const byKey = new Map<number | string, T>()
  for (const item of preferred) {
    const doc = item.document
    const docId =
      typeof doc === 'number'
        ? doc
        : doc && typeof doc === 'object' && 'id' in doc
          ? Number((doc as { id: number }).id)
          : item.id
    if (!byKey.has(docId)) byKey.set(docId, item)
  }
  return [...byKey.values()]
}

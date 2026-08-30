/**
 * Eski sitede İngilizce karşılığı olmayan sayfalar için çeviriler.
 * Admin panelde translationStatus=review olarak işaretlenir; hukuk metinleri
 * (KVKK, esas sözleşme vb.) yayın öncesi editör kontrolünden geçmeli.
 *
 * Anahtar: seed sırasında EN locale'e kopyalanan mevcut slug (TR slug ile aynı).
 */
export type PageTranslation = {
  slug: string
  title: string
  contentHtml?: string
}

export const EN_PAGE_TRANSLATIONS: Record<string, PageTranslation> = {
  'site-haritasi': { slug: 'site-map', title: 'Site Map' },
  'sikca-sorulan-sorular': {
    slug: 'frequently-asked-questions',
    title: 'Frequently Asked Questions',
  },
  'kisisel-verilerin-korunmasi-hakkinda-bilgilendirme': {
    slug: 'personal-data-protection-notice',
    title: 'Personal Data Protection Notice',
    contentHtml: `<p>Pursuant to the Law on the Protection of Personal Data No. 6698 (“KVKK”), Garanti Yatırım Ortaklığı A.Ş., acting as data controller, may record, store, update, disclose/transfer to third parties where permitted by law, classify and otherwise process your personal data in the ways set out in the KVKK, within the scope described below.</p>
<p><strong>Purposes and legal grounds for processing personal data:</strong> to use data in all products and services within the scope of the Capital Markets Law and other legislation applicable to our activities; to record identity, address and other information required to identify the account holder/investor; to prepare all records and documents that form the basis of transactions in electronic or paper form; to comply with information retention, reporting and disclosure obligations imposed by legislation, the Capital Markets Board and other authorities; to provide requested products/services of the Company and to perform the contracts you have entered into.</p>
<p><strong>Persons/entities to whom personal data may be transferred for the purposes above:</strong> persons or entities permitted by the Capital Markets Law and other applicable legislation, including without limitation public legal entities such as the CMB and the CBRT; our principal shareholder; our direct/indirect domestic/foreign affiliates; service providers, business partners and programme partners we work with to carry out our activities; domestic/foreign banks; and other third parties.</p>
<p><strong>Method of collection:</strong> your personal data may be collected orally, in writing or electronically through channels such as the Company Head Office and this website.</p>
<p><strong>Your rights under Article 11 of the KVKK:</strong> by applying to the Company you may (a) learn whether your personal data are processed; (b) request information if they have been processed; (c) learn the purpose of processing and whether they are used in line with that purpose; (ç) know the third parties in Turkey or abroad to whom they are transferred; (d) request correction if they are incomplete or inaccurate; (e) request deletion/destruction under the conditions set out in Article 7 of the KVKK; (f) request that the operations in (d) and (e) be notified to third parties to whom the data were transferred; (g) object to a result against you arising from exclusive analysis by automated systems; and (ğ) claim compensation if you suffer damage due to unlawful processing.</p>
<p>You may exercise these rights by sending an e-mail with a secure electronic signature to <a href="mailto:kisiselverilerim@gyo.com.tr">kisiselverilerim@gyo.com.tr</a>; by sending an e-mail from your registered e-mail (KEP) address to the Company’s KEP address <a href="mailto:garantiyatirimortakligi@hs03.kep.tr">garantiyatirimortakligi@hs03.kep.tr</a>; by submitting a handwritten signed application using the form on this website to Maslak Mah. AOS 55. Sokak, 42 Maslak Plaza A Blok D:270 (A12/07), Istanbul, Türkiye; or through a notary.</p>`,
  },
  'akademik-gorusler': {
    slug: 'academic-views',
    title: 'Academic Views',
    contentHtml: `<p><strong>Purpose</strong></p>
<p>It is a well-known fact in Türkiye that opportunities to publish scholarly research, articles and similar work on capital markets in the fields of law, economics and finance are very limited.</p>
<p>With this in mind, dedicating space on our website to scholarly work on capital markets is intended to help meet that need, at least in part, and to support academics, university students, authors and researchers.</p>`,
  },
  'yararlanma-kosullari': {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    contentHtml: `<p>“Academic Views” is open to everyone.</p>
<p>Articles to be published must relate to capital markets, meet scholarly standards, and must not conflict with laws, regulations or ethical rules. Articles are reviewed for compliance with these conditions by the Board of Directors or by a person/persons or committee appointed by the Board. Articles reflect the authors’ own views, do not bind the Company, and the Company pays no copyright fee and assumes no liability arising from them. Submitted articles may be published in part, removed after a period of time, or not published at all.</p>
<p>Scholarly articles published in “Academic Views” may be quoted provided the source is cited.</p>`,
  },
  yazilar: { slug: 'articles', title: 'Articles' },
  'personel-yedekleme-planlamasi': {
    slug: 'personnel-succession-planning',
    title: 'Personnel Succession Planning',
  },
  'yonetim-kurulu-ic-yonerge': {
    slug: 'board-of-directors-internal-directive',
    title: 'Board of Directors Internal Directive',
  },
  'sirket-esas-sozlesmesi': {
    slug: 'articles-of-association',
    title: 'Articles of Association',
  },
  'esas-sozlesme-degisiklikleri': {
    slug: 'articles-of-association-amendments',
    title: 'Amendments to the Articles of Association',
  },
  'genel-kurul-ic-yonergesi': {
    slug: 'general-assembly-internal-directive',
    title: 'General Assembly Internal Directive',
  },
  hazirunlar: { slug: 'attendance-lists', title: 'Attendance Lists' },
  'pay-alim-teklifi-bilgi-formlari': {
    slug: 'tender-offer-information-forms',
    title: 'Tender Offer Information Forms',
  },
  'iliskili-taraflarla-yapilan-islemler': {
    slug: 'related-party-transactions',
    title: 'Related-Party Transactions',
  },
  'faaliyet-raporlari': { slug: 'annual-reports', title: 'Annual Reports' },
  'bagimsiz-denetim-raporlari': {
    slug: 'independent-audit-reports',
    title: 'Independent Audit Reports',
  },
  'sermaye-artirimlari': { slug: 'capital-increases', title: 'Capital Increases' },
  'performans-sunus-raporlari': {
    slug: 'performance-presentation-reports',
    title: 'Performance Presentation Reports',
  },
  '2013-yili-komisyon-bilgileri': {
    slug: 'the-commission-information-of-the-year-2013',
    title: 'Commission Information for 2013',
  },
  '2014-yili-komisyon-bilgileri': {
    slug: 'the-commission-information-of-the-year-2014',
    title: 'Commission Information for 2014',
  },
  '2015-yili-komisyon-bilgileri': {
    slug: 'the-commission-information-of-the-year-2015',
    title: 'Commission Information for 2015',
  },
  '2016-yili-komisyon-bilgileri': {
    slug: 'the-commission-information-of-the-year-2016',
    title: 'Commission Information for 2016',
  },
  '2017-yili-komisyon-bilgileri': {
    slug: 'the-commission-information-of-the-year-2017',
    title: 'Commission Information for 2017',
  },
}

/** Başkanın Mesajı şu an yalnızca İngilizce; TR çevirisi. */
export const PRESIDENT_MESSAGE_TR = {
  slug: 'baskanin-mesaji',
  title: 'Başkanın Mesajı',
  contentHtml: `<p><strong>ÖRNEK HALKA AÇIK ŞİRKET: GARANTİ YATIRIM ORTAKLIĞI</strong></p>
<p>Sermaye piyasalarının ve halka açık ortaklık modelinin ABD’de ortaya çıkışındaki temel gerekçe, genellikle sınırlı sermayeye sahip bireysel yatırımcıların sermayelerini birleştirerek daha büyük yatırım fırsatlarına katılmalarını ve aksi halde değerlendirilmeyecek sermayeyi büyümeye yönelterek ulusal ekonomiye katkıda bulunmalarını sağlamaktı.</p>
<p>Bu model uzun yıllar başarıyla işlemiş ve dünya genelinde benimsenmiştir.</p>
<p>Zamanla modelin zayıf yönleri de görülmüştür. En önemlisi, mülkiyetin geniş tabana yayılması nedeniyle işaret edilebilecek somut bir “sahibin” bulunmamasıdır. Bu durum, şirkette yeterli payı olmayan yöneticilerin şirketleri kendi çıkarları için kullanmasına ve sonuçta küçük bireysel yatırımcıların sermaye kaybına uğradığı finansal krizlere yol açmıştır.</p>
<p>Bu çerçevede Garanti Yatırım Ortaklığı, küçük ölçeğine rağmen halka açık şirketin ideal bir örneğini sunmaktadır. %99,7 halka açıklık oranı ile mülkiyeti tabana yayma amacını gerçekten yerine getirmektedir. Öte yandan şirket sahipsiz de değildir. Garanti Bankası’nın elindeki sınırlı imtiyazlı pay yapısı sayesinde bu husus, Banka çatısı altında yönetimin titiz idaresi ve dikkatli gözetimiyle giderilmiştir. Sonuç olarak Ortaklık son on yılda yıllık yaklaşık %14 kazanç üretmiş (karşılaştırılabilir dönemdeki %8 enflasyona karşılık) ve bunu ortaklarına dağıtmıştır. Ayrıca Ortaklık, yukarıdaki amaçlarını yerine getirirken ortakları, menfaat sahipleri, çalışanları, düzenleyici ve denetleyici otoriteler ve kamu kurumlarıyla herhangi bir uyuşmazlık yaşamamış; herhangi bir yaptırıma veya yasal bildirime konu olmamıştır. Garanti Bankası ile Ortaklığın geniş yatırımcı tabanı arasındaki bu uyumlu ortaklık, kârlı ve güvenilir bir kuruluş üretmekle kalmamış, sermaye piyasalarının genel amacı doğrultusunda bir rol modeli de oluşturmuştur. Bu modelin korunması ve benzer kuruluşlarca daha geniş biçimde benimsenmesi, sermaye piyasalarımız için değerli olacaktır.</p>`,
}

export const FAQ_EN: { question: string; answerHtml: string }[] = [
  {
    question: 'When was Garanti Yatırım Ortaklığı A.Ş. established, and what is its purpose?',
    answerHtml: `<p>Garanti Yatırım Ortaklığı A.Ş. was established in Istanbul on 9 July 1996.</p>
<p>The Company’s purpose is to operate a portfolio of capital market instruments and of gold and other precious metals traded on national and international exchanges or organised over-the-counter markets, without dominating the capital or management of the issuers whose securities it purchases, within the principles and rules set by applicable legislation.</p>`,
  },
  {
    question: 'On which exchange is Garanti Yatırım Ortaklığı A.Ş. listed?',
    answerHtml: `<p>The Company’s shares trade on Borsa Istanbul under the ticker GRNYO.</p>
<p>Related indices include BIST ALL (XUTUM), BIST CORPORATE GOVERNANCE (XKURY) and BIST SECURITIES INVESTMENT TRUSTS (XYORT). Reuters code: GRNYO.IS; Bloomberg code: GRNYO TI.</p>`,
  },
  {
    question: 'Where can I find the trade registry information?',
    answerHtml: `<p>Trade registry details are available on the <a href="/en/investor-relations/corporate-management/commercial-registry-information">Commercial Registry Information</a> page.</p>`,
  },
  {
    question: 'What are the paid-in and registered capital amounts? Where can I find capital increases?',
    answerHtml: `<p>The Company’s paid-in capital is TRY 37,500,000 and its registered capital is TRY 100,000,000.</p>
<p>Capital increases are published under <a href="/en/investor-relations/operational-and-financial-datas/capital-increases">Capital Increases</a>.</p>`,
  },
  {
    question: 'What is the capital and shareholding structure? How can I access it?',
    answerHtml: `<p>See the <a href="/en/investor-relations/corporate-management/capital-and-partnership-structure">Capital and Partnership Structure</a> page.</p>`,
  },
  {
    question: 'When did the Company go public?',
    answerHtml: `<p>The Company went public in November 1996.</p>`,
  },
  {
    question: 'Where can I find the IPO prospectus?',
    answerHtml: `<p>The prospectus is available in the document archive on this website (original 1996 offering circular).</p>`,
  },
  {
    question: 'Where can I find the Articles of Association and their amendments?',
    answerHtml: `<p>See <a href="/en/investor-relations/corporate-management/articles-of-association">Articles of Association</a> and <a href="/en/investor-relations/corporate-management/articles-of-association-amendments">Amendments to the Articles of Association</a>.</p>`,
  },
  {
    question: 'Does the Company have a disclosure policy?',
    answerHtml: `<p>Yes. The disclosure policy is published among the Company’s <a href="/en/investor-relations/corporate-management/policies">policies</a>.</p>`,
  },
  {
    question: 'What is Garanti Yatırım Ortaklığı A.Ş.’s dividend distribution policy?',
    answerHtml: `<p>The dividend distribution policy is available among the Company’s <a href="/en/investor-relations/corporate-management/policies">policies</a>.</p>`,
  },
  {
    question: 'How can I access annual reports?',
    answerHtml: `<p>Annual reports are published under <a href="/en/investor-relations/operational-and-financial-datas/annual-reports">Annual Reports</a>.</p>`,
  },
  {
    question: 'Where can I find the financial statements?',
    answerHtml: `<p>Financial statements are published under <a href="/en/investor-relations/operational-and-financial-datas/financial-statements">Financial Statements</a>.</p>`,
  },
  {
    question: 'Is there a Corporate Governance Principles Compliance Report?',
    answerHtml: `<p>Yes. See the <a href="/en/investor-relations/corporate-management/corporate-governance-compliance-report">Corporate Governance Compliance Report</a>.</p>`,
  },
  {
    question: 'Are performance presentation reports published? How can I access them?',
    answerHtml: `<p>The Company prepares performance presentation reports regularly in line with Capital Markets Board regulations. See <a href="/en/investor-relations/operational-and-financial-datas/performance-presentation-reports">Performance Presentation Reports</a>.</p>`,
  },
  {
    question: 'Has the Company received any awards?',
    answerHtml: `<p>The Company received three international quality awards in 2011, 2012 and 2013. Details are on the <a href="/en/corporate/awards">Awards</a> page.</p>`,
  },
  {
    question: 'How can I contact the Company for information?',
    answerHtml: `<p>See the <a href="/en/contact-us">Contact Us</a> page. You may also reach the Investor Relations department by phone, fax or e-mail during business hours via <a href="/en/investor-relations/shareholder-relation-departments-communication">Investor Relations contact</a>.</p>`,
  },
]

/** Menü etiketleri (TR -> EN). Seed yalnızca TR yazdığı için EN locale boş kalıyordu. */
export const NAV_EN_LABELS: Record<string, string> = {
  'Garanti BBVA': 'Garanti BBVA',
  Bonus: 'Bonus',
  Yatırım: 'Investment',
  Emeklilik: 'Pension',
  Tami: 'Tami',
  Kripto: 'Crypto',
  'Yatırım Ortaklığı': 'Investment Trust',
  Kurumsal: 'Corporate',
  Şirket: 'Company',
  Hakkımızda: 'About Us',
  'Vizyon ve Misyon': 'Vision and Mission',
  'Organizasyon Şeması': 'Organization Chart',
  Ödüller: 'Awards',
  Yönetim: 'Management',
  'Yönetim Kurulu Üyeleri': 'Board of Directors',
  'Üst Yönetim': 'Top Management',
  'Akademik Görüşler': 'Academic Views',
  'Yararlanma Koşulları': 'Terms of Use',
  Yazılar: 'Articles',
  'Yatırımcı İlişkileri': 'Investor Relations',
  KAP: 'KAP',
  'Kurumsal Yönetim': 'Corporate Governance',
  'Genel Kurul': 'General Assembly',
  Politikalar: 'Policies',
  'Sermaye ve Ortaklık Yapısı': 'Capital and Partnership Structure',
  'Şirket Esas Sözleşmesi': 'Articles of Association',
  'Finansal Veriler': 'Financial Data',
  'Faaliyet Raporları': 'Annual Reports',
  'Finansal Tablolar ve Dipnotlar': 'Financial Statements and Notes',
  'Bağımsız Denetim Raporları': 'Independent Audit Reports',
  'Performans Sunuş Raporları': 'Performance Presentation Reports',
  'Sermaye Artırımları': 'Capital Increases',
  İletişim: 'Contact',
  'Yatırımcı İlişkileri Bölümü': 'Investor Relations Department',
  'Özel Durum Açıklamaları': 'Material Event Disclosures',
  'Sürekli Bilgilendirme Formu': 'Public Disclosure Form',
  Bilgilendirme: 'Disclosure',
  'İnsan Kaynakları': 'Human Resources',
  'Bize Ulaşın': 'Contact Us',
  'Yönetim Kurulu': 'Board of Directors',
  Yardım: 'Help',
  'Sıkça Sorulan Sorular': 'Frequently Asked Questions',
  'Site Haritası': 'Site Map',
  'Bilgi Toplumu Hizmetleri': 'Information Society Services',
  'Kullanım ve Gizlilik Politikası': 'Terms of Use and Privacy Policy',
  'Kişisel Verilerin Korunması': 'Personal Data Protection',
}

function enNavLabel(value: string | null | undefined): string {
  if (!value) return ''
  return NAV_EN_LABELS[value] ?? value
}

type NavLinkLike = { label?: string | null }

function mapNavLink<T extends NavLinkLike>(link: T): T {
  return { ...link, label: enNavLabel(link.label) }
}

/** TR menüyü EN locale'e kopyalar; satır id'lerini korur. */
export function mapNavigationToEnglish(nav: {
  affiliateBar?: NavLinkLike[] | null
  mainMenu?:
    | (NavLinkLike & {
        columns?:
          | ({ heading?: string | null; links?: NavLinkLike[] | null } & Record<string, unknown>)[]
          | null
      })[]
    | null
  headerUtility?: NavLinkLike[] | null
  headerCta?: NavLinkLike | null
  footerColumns?:
    | ({ heading?: string | null; links?: NavLinkLike[] | null } & Record<string, unknown>)[]
    | null
  legalLinks?: NavLinkLike[] | null
}) {
  return {
    affiliateBar: (nav.affiliateBar ?? []).map(mapNavLink),
    mainMenu: (nav.mainMenu ?? []).map((item) => ({
      ...mapNavLink(item),
      columns: (item.columns ?? []).map((column) => ({
        ...column,
        heading: enNavLabel(column.heading),
        links: (column.links ?? []).map(mapNavLink),
      })),
    })),
    headerUtility: (nav.headerUtility ?? []).map(mapNavLink),
    headerCta: nav.headerCta ? mapNavLink(nav.headerCta) : nav.headerCta,
    footerColumns: (nav.footerColumns ?? []).map((column) => ({
      ...column,
      heading: enNavLabel(column.heading),
      links: (column.links ?? []).map(mapNavLink),
    })),
    legalLinks: (nav.legalLinks ?? []).map(mapNavLink),
  }
}

import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import HeroHoverEffect from '../components/HeroHoverEffect.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import './PasifikaPage.css'

function createCalendarUrl({ title, startDate, endDate, nativeName, theme }) {
  const details = `${nativeName} - ${theme}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}/${endDate}`,
    details,
    location: 'Aotearoa New Zealand',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const languageWeeks = [
  {
    month: 'May',
    language: 'Rotuma Language Week',
    nativeName: 'Gasav Ne Faeag Rotuam Ta',
    dates: 'Sunday 10 May – Saturday 16 May 2026',
    theme: "'Af'ak, putua, a'pumua'ak ma rak'ak 'os faega ma 'os ag fak Rotuma, la se maoen 'e 'os tore",
    translation: 'Treasure, nurture and teach our Rotuman language and culture so it may live on through generations.',
    accent: '#995d16',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/rotuman-language-week/',
    resourceLabel: 'Language guide',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2026-pacific-language-week-assets/Rotuma-Language-Week/MPP-Rotuma-Language-Guide_FINAL.pdf',
    calendarUrl: createCalendarUrl({ title: 'Rotuma Language Week', startDate: '20260510', endDate: '20260517', nativeName: 'Gasav Ne Faeag Rotuam Ta', theme: 'Treasure, nurture and teach our Rotuman language and culture so it may live on through generations.' }),
  },
  {
    month: 'May',
    language: 'Samoa Language Week',
    nativeName: 'Vaiaso o le Gagana Samoa',
    dates: 'Sunday 31 May – Saturday 6 June 2026',
    theme: "'E afua mai i mauga tetele manuia o le nu'u",
    translation: 'From the high mountains are the blessings of the village.',
    accent: '#0f6f78',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/samoa-language-week/',
    resourceLabel: 'Language guide',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2026-pacific-language-week-assets/Samoa-Language-Week-2026/0107-Language-Card-Refresh-2026-Samoa.pdf',
    ceremonyUrl: '#opening-ceremony',
    calendarUrl: createCalendarUrl({ title: 'Samoa Language Week', startDate: '20260531', endDate: '20260607', nativeName: 'Vaiaso o le Gagana Samoa', theme: 'From the high mountains are the blessings of the village.' }),
  },
  {
    month: 'July',
    language: 'Kiribati Language Week',
    nativeName: 'Wikin te Taetae ni Kiribati',
    dates: 'Sunday 5 July – Saturday 11 July 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Kiribati theme closer to the celebration.',
    accent: '#1d7892',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/kiribati-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Kiribati-language-week/KIRIBATI_Language_Card.pdf',
    calendarUrl: createCalendarUrl({ title: 'Kiribati Language Week', startDate: '20260705', endDate: '20260712', nativeName: 'Wikin te Taetae ni Kiribati', theme: '2026 theme to be announced.' }),
  },
  {
    month: 'July',
    language: 'Vanuatu Bislama Language Week',
    nativeName: 'Vanuatu Bislama Lanwis Wik',
    dates: 'Sunday 26 July – Saturday 1 August 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Vanuatu Bislama theme closer to the celebration.',
    accent: '#28604a',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/vanuatu-bislama-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2025-pacific-language-weeks/Vanuatu-bislama-language-week/Vanuatu-bislama-language-cards.pdf',
    calendarUrl: createCalendarUrl({ title: 'Vanuatu Bislama Language Week', startDate: '20260726', endDate: '20260802', nativeName: 'Vanuatu Bislama Lanwis Wik', theme: '2026 theme to be announced.' }),
  },
  {
    month: 'August',
    language: 'Cook Islands Maori Language Week',
    nativeName: "'Epetoma o te reo Maori Kuki 'Airani",
    dates: 'Sunday 2 August – Saturday 8 August 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Cook Islands Maori theme closer to the celebration.',
    accent: '#0f6f78',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/cook-islands-maori-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Cook-islands-maori-language-week/PLW-2024-Language-Cards-COOK-ISLANDS.pdf',
    calendarUrl: createCalendarUrl({ title: 'Cook Islands Maori Language Week', startDate: '20260802', endDate: '20260809', nativeName: "'Epetoma o te reo Maori Kuki 'Airani", theme: '2026 theme to be announced.' }),
  },
  {
    month: 'August',
    language: 'Tonga Language Week',
    nativeName: "Uike Katoangai 'o e lea faka-Tonga",
    dates: 'Sunday 16 August – Saturday 22 August 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Tonga theme closer to the celebration.',
    accent: '#c94f3d',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/tonga-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Tonga-language-week/tonga-language-week-cards-2024.pdf',
    calendarUrl: createCalendarUrl({ title: 'Tonga Language Week', startDate: '20260816', endDate: '20260823', nativeName: "Uike Katoangai 'o e lea faka-Tonga", theme: '2026 theme to be announced.' }),
  },
  {
    month: 'September',
    language: 'Papua New Guinea Pidgin Language Week',
    nativeName: 'Papua Niugini Tok Pisin Wik',
    dates: 'Sunday 6 September – Saturday 12 September 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Papua New Guinea Pidgin theme closer to the celebration.',
    accent: '#6b4b34',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/papua-new-guinea-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Papua-new-guinea-pidgin-language-week/2024_PLW_PNG_Language_Card.pdf',
    calendarUrl: createCalendarUrl({ title: 'Papua New Guinea Pidgin Language Week', startDate: '20260906', endDate: '20260913', nativeName: 'Papua Niugini Tok Pisin Wik', theme: '2026 theme to be announced.' }),
  },
  {
    month: 'September',
    language: 'Tuvalu Language Week',
    nativeName: "Vaiaso o te 'Gana Tuvalu",
    dates: 'Sunday 27 September – Saturday 3 October 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Tuvalu theme closer to the celebration.',
    accent: '#2a88aa',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/tuvalu-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Tuvalu-language-week/Te-gana-tuvalu-language-cards.pdf',
    calendarUrl: createCalendarUrl({ title: 'Tuvalu Language Week', startDate: '20260927', endDate: '20261004', nativeName: "Vaiaso o te 'Gana Tuvalu", theme: '2026 theme to be announced.' }),
  },
  {
    month: 'October',
    language: 'Fijian Language Week',
    nativeName: 'Macawa ni Vosa vakaViti',
    dates: 'Sunday 4 October – Saturday 10 October 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Fijian theme closer to the celebration.',
    accent: '#184d86',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/fijian-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Fijian-language-week/Fijian-language-cards-2024.pdf',
    calendarUrl: createCalendarUrl({ title: 'Fijian Language Week', startDate: '20261004', endDate: '20261011', nativeName: 'Macawa ni Vosa vakaViti', theme: '2026 theme to be announced.' }),
  },
  {
    month: 'October',
    language: 'Niue Language Week',
    nativeName: 'Faahi Tapu he Vagahau Niue',
    dates: 'Sunday 18 October – Saturday 24 October 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Niue theme closer to the celebration.',
    accent: '#99630c',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/niue-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Niue-language-week/Niue-language-cards-2024.pdf',
    calendarUrl: createCalendarUrl({ title: 'Niue Language Week', startDate: '20261018', endDate: '20261025', nativeName: 'Faahi Tapu he Vagahau Niue', theme: '2026 theme to be announced.' }),
  },
  {
    month: 'October',
    language: 'Tokelau Language Week',
    nativeName: 'Te Vaiaho o te Gagana Tokelau',
    dates: 'Sunday 25 October – Saturday 31 October 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Tokelau theme closer to the celebration.',
    accent: '#1e5870',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/tokelau-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Tokelau-language-week/PLW-2024-language-cards-tokelau.pdf',
    calendarUrl: createCalendarUrl({ title: 'Tokelau Language Week', startDate: '20261025', endDate: '20261101', nativeName: 'Te Vaiaho o te Gagana Tokelau', theme: '2026 theme to be announced.' }),
  },
  {
    month: 'November',
    language: 'Solomon Islands Pidgin Language Week',
    nativeName: 'Solomon Aelan Pijin Langguis Wik',
    dates: 'Sunday 22 November – Saturday 28 November 2026',
    theme: '2026 theme coming soon',
    translation: 'The Ministry for Pacific Peoples will publish the 2026 Solomon Islands Pidgin theme closer to the celebration.',
    accent: '#704028',
    infoUrl: 'https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-language-weeks/solomon-islands-language-week/',
    resourceLabel: 'Language cards',
    resourceUrl: 'https://www.mpp.govt.nz/assets/2024-pacific-language-weeks/Solomon-islands-pidgin-language-week/Solomon-islands-pidgin-language-cards.pdf',
    calendarUrl: createCalendarUrl({ title: 'Solomon Islands Pidgin Language Week', startDate: '20261122', endDate: '20261129', nativeName: 'Solomon Aelan Pijin Langguis Wik', theme: '2026 theme to be announced.' }),
  },
]

function parseCalendarDate(dateStamp) {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(dateStamp)
  if (!match) return null

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function getWeekDateRange(week) {
  const dateRange = new URL(week.calendarUrl).searchParams.get('dates')
  const [startDate, endDate] = dateRange?.split('/') ?? []
  const start = parseCalendarDate(startDate)
  const end = parseCalendarDate(endDate)

  if (!start || !end) return null

  return { start, end }
}

function getTodayDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function getFeaturedLanguageWeek(today = getTodayDate()) {
  const activeWeek = languageWeeks.find((week) => {
    const range = getWeekDateRange(week)
    return range && today >= range.start && today < range.end
  })

  if (activeWeek) return activeWeek

  return languageWeeks.find((week) => {
    const range = getWeekDateRange(week)
    return range && today < range.start
  }) ?? languageWeeks[0]
}

function getLanguageWeekStatus(week, today = getTodayDate()) {
  const range = getWeekDateRange(week)

  if (range && today >= range.start && today < range.end) return 'Current'

  return 'Upcoming'
}

function formatShortDateRange(week) {
  const range = getWeekDateRange(week)
  if (!range) return week.dates

  const endInclusive = new Date(range.end)
  endInclusive.setDate(endInclusive.getDate() - 1)

  const formatter = new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'long',
  })

  return `${formatter.format(range.start)} – ${formatter.format(endInclusive)}`
}

const openingCeremonyAgenda = [
  { title: "Ta'ita'i o le Sauniga", detail: 'Susuga Taiti Teo' },
  { title: 'Tatalo Amata', detail: 'Dallin Lasike' },
  { title: 'Pese Muamua', detail: "Fa'afetai i le Atua" },
  { title: 'Faitauga o le Tusi Paia', detail: "Faitauga 1 - Robert Metzger - Fa'ataoto 3:5-6 (Samoan); Mil'e Matamua - Proverbs 3:5-6 (English)" },
  { title: 'Faitauga 2', detail: 'Taiti Teo - Iosua 1:9 (Samoan); Indi Paopao - Joshua 1:9 (English)' },
  { title: 'Faitauga 3', detail: 'Devante Iose - Ieremia 29:11 (Samoan); Emily Pio - Jeremiah 29:11 (English)' },
  { title: 'Pese Lua', detail: "Ua So'ona Olioli Nei" },
  { title: 'Manatu autu o le vaiaso o le Gagana Samoa', detail: 'Susana Filimilo Ulugia' },
  { title: 'Pese Tolu', detail: "Lo ta Nu'u" },
  { title: "Tatalo Fa'ai'u", detail: 'Cleo Paopao' },
]

const scriptureLinks = new Map([
  ["Fa'ataoto 3:5-6", 'https://www.churchofjesuschrist.org/study/scriptures/ot/prov/3?lang=eng&id=p5-p6#p5'],
  ['Proverbs 3:5-6', 'https://www.churchofjesuschrist.org/study/scriptures/ot/prov/3?lang=eng&id=p5-p6#p5'],
  ['Iosua 1:9', 'https://www.churchofjesuschrist.org/study/scriptures/ot/josh/1?lang=eng&id=p9#p9'],
  ['Joshua 1:9', 'https://www.churchofjesuschrist.org/study/scriptures/ot/josh/1?lang=eng&id=p9#p9'],
  ['Ieremia 29:11', 'https://www.churchofjesuschrist.org/study/scriptures/ot/jer/29?lang=eng&id=p11#p11'],
  ['Jeremiah 29:11', 'https://www.churchofjesuschrist.org/study/scriptures/ot/jer/29?lang=eng&id=p11#p11'],
])

const hymns = [
  {
    title: "Fa'afetai i le Atua",
    subtitle: 'O VIIGA IA TE IA',
    verses: [
      { label: '1', lines: ['FAAFETAI i le Atua,', 'Le na tatou tupu ai,', 'Ina ua na alofa fua', 'Ia te i tatou uma nei.', 'Ia pepese,', 'Aleluia, faafetai.'] },
      { label: '2', lines: ['Faafetai i lona Alo,', 'Le na afio mai luga,', 'Le ua fai ma faapaolo', 'Ai le puapuaga.', 'Ia pepese,', 'Aleluia, faafetai.'] },
      { label: '3', lines: ['Faafetai i le Agaga,', 'Le fesoasoani mai,', 'E manuia ai talosaga,', 'Atoa uma mea e fai.', 'Ia pepese,', 'Aleluia, faafetai.'] },
    ],
  },
  {
    title: "Ua So'ona Olioli Nei",
    subtitle: "There's Sunshine in My Soul",
    verses: [
      { label: '1', lines: ["UA soona olioli nei,", "Lo'u loto ia Iesu;", "Ua ia faaola ia te a'u.", "O la'u lea pese fou."] },
      { label: 'Chorus', lines: ['Pese, pese, Aleluia!', "O le la o lo'u agaga oe;", 'Iesu e, o le faaola mai,', 'Ua ou olioli ai.'] },
      { label: '2', lines: ["O le tau totogo a'e laau", "Lo'u ola ua fai nei;", "Talu lona alofa ia te a'u,", 'Ua mua mea lelei.'] },
      { label: 'Chorus', lines: ['Pese, pese, Aleluia!', "O le la o lo'u agaga oe;", 'Iesu e, o le faaola mai,', 'Ua ou olioli ai.'] },
      { label: '3', lines: ['Ia tupu olaola mai,', 'Se pama ua toto;', 'O Iesu lava le pogai,', "O la'u amio fou."] },
      { label: 'Chorus', lines: ['Pese, pese, Aleluia!', "O le la o lo'u agaga oe;", 'Iesu e, o le faaola mai,', 'Ua ou olioli ai.'] },
      { label: '4', lines: ['O mea i la le olaga nei,', 'Atoa le atali:', "O lo'u lea tofi e lelei,", 'O loo ua mausali.'] },
      { label: 'Chorus', lines: ['Pese, pese, Aleluia!', "O le la o lo'u agaga oe;", 'Iesu e, o le faaola mai,', 'Ua ou olioli ai.'] },
    ],
  },
  {
    title: "Lo ta Nu'u",
    subtitle: 'Swell the Anthem',
    verses: [
      { label: '1', lines: ['LOTA nuu ua ou fanau ai,', 'Ua lelei oe i le vasa e,', 'Ua e maua mai luga', 'O le tofi aoga!'] },
      { label: 'Chorus', lines: ['Samoana, ala mai,', 'Fai ai nei le faafetai,', "a'i Le pule ia maua ai", 'O lou nuu i le Vasa e.'] },
      { label: '2', lines: ['El ua lalelei Samoa,', 'Lona valevalenoa,', 'Ia moomia ai ou fanua,', 'Tama Samoa, ala mai.'] },
      { label: 'Chorus', lines: ['Samoana, ala mai,', 'Fai ai nei le faafetai,', "a'i Le pule ia maua ai", 'O lou nuu i le Vasa e.'] },
      { label: '3', lines: ['Ua e sui lou tautai,', 'Lou mamalu ia maua ai?', 'Tuputupu pea mai,', 'Talu nuu ua feagai'] },
      { label: 'Chorus', lines: ['Samoana, ala mai,', 'Fai ai nei le faafetai,', "a'i Le pule ia maua ai", 'O lou nuu i le Vasa e.'] },
      { label: '4', lines: ['Nuu mamao ua e maua ai,', "Mea lelei e ati a'e", 'Lou mamalu. Ia mautu', 'Matatupu tau Iesu.'] },
      { label: 'Chorus', lines: ['Samoana, ala mai,', 'Fai ai nei le faafetai,', "a'i Le pule ia maua ai", 'O lou nuu i le Vasa e.'] },
    ],
  },
]

const phrases = [
  { gagana: 'Talofa lava', english: 'Hello' },
  { gagana: "Fa'afetai", english: 'Thank you' },
  { gagana: "Fa'amolemole", english: 'Please' },
  { gagana: 'Manuia le vaiaso o le gagana Samoa', english: 'Happy Samoa Language Week' },
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatAgendaDetail(detail) {
  const withLineBreaks = detail.split('; ').join('\n')
  const entries = Array.from(scriptureLinks.entries())
  const matches = entries
    .flatMap(([reference, url]) => {
      const regex = new RegExp(escapeRegExp(reference), 'g')
      return Array.from(withLineBreaks.matchAll(regex)).map((match) => ({
        start: match.index,
        end: match.index + reference.length,
        reference,
        url,
      }))
    })
    .sort((a, b) => a.start - b.start || b.end - a.end)

  if (!matches.length) {
    return withLineBreaks.split('\n').flatMap((line, i, arr) => [
      line,
      ...(i < arr.length - 1 ? [<br key={i} />] : []),
    ])
  }

  const segments = []
  let cursor = 0
  let keyIdx = 0

  matches.forEach((match) => {
    if (match.start < cursor) return
    if (match.start > cursor) {
      const text = withLineBreaks.slice(cursor, match.start)
      text.split('\n').forEach((line, i, arr) => {
        segments.push(line)
        if (i < arr.length - 1) segments.push(<br key={`br-${keyIdx++}`} />)
      })
    }
    segments.push(
      <a key={`link-${keyIdx++}`} className="agenda-scripture-link" href={match.url} target="_blank" rel="noopener noreferrer">
        {match.reference}
      </a>
    )
    cursor = match.end
  })

  if (cursor < withLineBreaks.length) {
    const text = withLineBreaks.slice(cursor)
    text.split('\n').forEach((line, i, arr) => {
      segments.push(line)
      if (i < arr.length - 1) segments.push(<br key={`br-${keyIdx++}`} />)
    })
  }

  return segments
}

function LanguageCard({ week, isFeatured, status }) {
  const actions = [
    { label: 'Official info', href: week.infoUrl, tone: 'primary', external: true },
    week.resourceUrl ? { label: week.resourceLabel, href: week.resourceUrl, tone: 'muted', external: true } : null,
    week.ceremonyUrl ? { label: 'Kaitaia Opening Ceremony', href: week.ceremonyUrl, tone: 'secondary', external: false } : null,
    { label: 'Add to calendar', href: week.calendarUrl, tone: 'outline', external: true },
  ].filter(Boolean)

  return (
    <article className="language-card" style={{ '--week-accent': week.accent }}>
      <div className="language-card__top">
        <div>
          <p className="language-card__month">{week.month}</p>
          <h3>{week.language}</h3>
          <p className="language-card__native">{week.nativeName}</p>
        </div>
        {isFeatured && <span className="language-card__label">{status}</span>}
      </div>
      <div className="language-card__dates">{week.dates}</div>
      <p className="language-card__theme">
        {week.theme}
        <span className="language-card__translation">{week.translation}</span>
      </p>
      <div className="language-card__actions">
        {actions.map((action, i) => (
          <a
            key={i}
            className={`language-card__action language-card__action--${action.tone}`}
            href={action.href}
            {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {action.label}
          </a>
        ))}
      </div>
    </article>
  )
}

function AgendaItem({ item, index }) {
  return (
    <div className="agenda-item">
      <span className="agenda-item__number">{index + 1}</span>
      <div>
        <strong>{item.title}</strong>
        <p>{formatAgendaDetail(item.detail)}</p>
      </div>
    </div>
  )
}

function HymnCard({ hymn }) {
  return (
    <section className="hymn-card">
      <h4>{hymn.title}</h4>
      {hymn.subtitle && <p className="hymn-card__subtitle">{hymn.subtitle}</p>}
      <div className="hymn-card__verses">
        {hymn.verses.map((verse, i) => (
          <div key={i} className="hymn-verse">
            <em>{verse.label}</em>
            <p>{verse.lines.map((line, j) => <span key={j}>{line}</span>)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function PasifikaPage() {
  const [ceremonyOpen, setCeremonyOpen] = useState(false)
  const location = useLocation()
  const ceremonyRef = useRef(null)
  const featuredWeek = getFeaturedLanguageWeek()
  const featuredWeekStatus = getLanguageWeekStatus(featuredWeek)

  useEffect(() => {
    if (location.hash === '#opening-ceremony') {
      setCeremonyOpen(true)
      setTimeout(() => ceremonyRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [location.hash])

  return (
    <div className="pasifika-body">
      <SiteHeader />

      <main>
        <section className="pasifika-hero" aria-labelledby="pasifika-title">
          <HeroHoverEffect imageUrl="/pasifika-hero.png" />
          <div className="pasifika-hero__content">
            <p className="pasifika-kicker">Pacific Language Weeks in Te Hiku</p>
            <h1 id="pasifika-title">Pasifika</h1>
            <p className="pasifika-lede">
              A living showcase for Pasifika language weeks, celebration dates, themes, learning resources, and official information links.
            </p>
            <a className="pasifika-hero__cta" href="#weeks">View weeks</a>
          </div>
        </section>

        <section className="pasifika-strip" aria-label={`${featuredWeek.language} snapshot`}>
          <div>
            <span>{featuredWeekStatus}</span>
            <strong>{featuredWeek.nativeName}</strong>
          </div>
          <div>
            <span>2026 dates</span>
            <strong>{formatShortDateRange(featuredWeek)}</strong>
          </div>
          <div>
            <span>Official source</span>
            <strong>
              <a className="pasifika-strip__link" href={featuredWeek.infoUrl} target="_blank" rel="noopener noreferrer">
                Ministry for Pacific Peoples
              </a>
            </strong>
          </div>
        </section>

        <section className="pasifika-section" id="weeks">
          <div className="pasifika-section__heading">
            <p className="pasifika-kicker">Language week library</p>
            <h2>Celebrate, learn, and connect</h2>
          </div>
          <div className="language-grid" aria-live="polite">
            {languageWeeks.map((week, i) => (
              <LanguageCard
                key={i}
                week={week}
                isFeatured={week === featuredWeek}
                status={featuredWeekStatus}
              />
            ))}
          </div>
        </section>

        <section
          className="pasifika-section pasifika-section--ceremony"
          id="opening-ceremony"
          ref={ceremonyRef}
        >
          <div className="pasifika-section__heading">
            <p className="pasifika-kicker">Kaitaia Opening Ceremony</p>
            <h2>Sauniga Lotu tatalaina</h2>
            <button
              className="ceremony-toggle"
              type="button"
              aria-expanded={ceremonyOpen}
              aria-controls="openingCeremonyContent"
              onClick={() => setCeremonyOpen((prev) => !prev)}
            >
              {ceremonyOpen ? 'Hide Kaitaia Opening Ceremony' : 'Show Kaitaia Opening Ceremony'}
            </button>
          </div>
          {ceremonyOpen && (
            <div className="ceremony-content" id="openingCeremonyContent">
              <div className="ceremony-layout">
                <article className="ceremony-panel">
                  <div className="ceremony-panel__heading">
                    <span>Agenda</span>
                    <h3>Polokalame</h3>
                  </div>
                  <div className="agenda-list">
                    {openingCeremonyAgenda.map((item, i) => (
                      <AgendaItem key={i} item={item} index={i} />
                    ))}
                  </div>
                </article>
                <article className="ceremony-panel">
                  <div className="ceremony-panel__heading">
                    <span>Hymn lyrics</span>
                    <h3>Pese</h3>
                  </div>
                  <div className="hymn-stack">
                    {hymns.map((hymn, i) => (
                      <HymnCard key={i} hymn={hymn} />
                    ))}
                  </div>
                </article>
              </div>
            </div>
          )}
        </section>

        <section className="pasifika-section pasifika-section--feature" id="phrases">
          <div className="pasifika-section__heading">
            <p className="pasifika-kicker">Gagana Samoa</p>
            <h2>Starter phrases</h2>
          </div>
          <div className="phrase-grid">
            {phrases.map((phrase, i) => (
              <article key={i} className="phrase-card">
                <strong>{phrase.gagana}</strong>
                <span>{phrase.english}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

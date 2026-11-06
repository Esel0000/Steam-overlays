// Baut das Chatty-Profil "UMBRA" in %USERPROFILE%\.chatty-umbra und legt die Verknüpfung "Chatty UMBRA" an.
// Basis sind die bisherigen Einstellungen aus .chatty (ohne Anmeldedaten), darüber kommen Farben, Schrift,
// Hervorhebungen, Farbregeln und die Blacklist. Das alte Profil wird nicht verändert.
// Ausführen: node chatty/umbra-profil.js   (Chatty vorher schließen). Gestartet wird das Profil über die Verknüpfung "Chatty UMBRA" oder Strg+Alt+S.
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')

const ALT = path.join(os.homedir(), '.chatty', 'settings')
const ZIEL = path.join(os.homedir(), '.chatty-umbra')

// ---------- UMBRA-Farben ----------
const F = {
  grund: '#0B0708', grund2: '#110A0B', flaeche: '#1A1012', papier: '#F2EFE8', text: '#E8E3DA',
  grau: '#8A817A', dunkelgrau: '#5E5652', rot: '#C42A31', dunkelrot: '#5A1418', weinrot: '#3A1014',
  gruen: '#14382A', gelb: '#E8C547',
}

// ---------- Blacklist ----------
// Beleidigungen und Hass: rot markiert + Hervorhebung, damit du oder die Mods sofort handeln können.
const HASS = 'regwi:(hurensohn|huso|missgeburt|spast|spasti|(du|bist du|seid ihr|ihr) behindert|mongo|schwuchtel|transe|fotze|kanake|zigeuner|n[i1!]gg(a|er|ah)|f[a@]gg?ot|retard|kys|kill yourself|bring dich um)'
// Scam und Fremdwerbung: gelb markiert + Hervorhebung
const SCAM = 'regi:((free|gratis|kostenlos).{0,25}(followers?|viewers?|zuschauer|nitro)|(cheap|billig|buy|kauf).{0,25}(followers?|viewers?|zuschauer|primes?|subs?)|dogehype|streamboo|bigfollows|followkings|viewerboost|twitchboost|onlyfans|nudes|steamcommunity\.(ru|cc)|discordnitro|nitro.{0,10}(free|gift))'
// Kanäle (Stand 06.11.2026): MOD = dein Kanal + Mod-Kanäle, die du auch verfolgst (Twitch-Mod-Liste, gefolgt, Chatty-Logs)
// MITLESEN = nur zuschauen, dort keine Blacklist und keine Blacklist-Highlights
const MOD = ['esel_99', 'kasab329', 'basler20', 'kokofnr', '1jeffryy', 'mellivlne', 'reno_manchester', 'prinz_yache', '3lionx_', 'xysemih']
const MITLESEN = ['jiyovollkontakt']
const NUR_MOD = `chan:${MOD.join(',')}`

// Namen und Stichwörter, die immer auffallen sollen
const NAME = 'regwi:@?(esel(_?99|_?8i)?|basler|pasa ?paco|pasa|pruda(_?031)?)'

const HIGHLIGHT = [
  NAME,
  'regwi:@chat|@mods|@staff|@admin',
  'config:firstmsg',
  'config:info regi:(is gifting|gifted|subscribed|resubscribed|\\[Raid\\])',
  'config:info +regi:donated|tipped|spende',
  'config:t|bits',
  `${NUR_MOD} ${HASS}`,
  `${NUR_MOD} ${SCAM}`,
  // Banns und Timeouts landen so auch im Highlight-Fenster
  'config:info regi:\\[ModAction\\].*(ban|timeout|timed out|gesperrt)',
]

// Muster,Schriftfarbe/an/Hintergrund/an. Bewusst sparsam: normaler Text bleibt neutral,
// Highlights bekommen das UMBRA-Weinrot (highlightBackgroundColor), nur die Blacklist ist farbig.
const MSG_COLORS = [
  `${HASS},#FFFFFF/1/${F.rot}/1`,
  `${SCAM},#1A1204/1/${F.gelb}/1`,
  `config:info regi:^Channel was cleared by a moderator.*$,#FFFFFF/1/${F.rot}/1`,
  `config:info regi:^\\[ModAction\\].*$,${F.grau}/1/${F.grund}/0`,
]

const UMBRA = {
  // Oberfläche
  laf: 'hifiCustom', lafBackground: F.grund, lafForeground: F.text, lafGradient: 0, lafScroll: 'tiny',
  // Chat-Farben
  backgroundColor: F.grund, backgroundColor2: F.grund2, alternateBackground: true,
  foregroundColor: F.text, infoColor: F.grau, compactColor: F.grau,
  timestampColor: F.dunkelgrau, timestampColorEnabled: true, timestampColorInherit: 'off',
  highlightColor: '#FFFFFF', highlightBackground: true, highlightBackgroundColor: F.weinrot,
  separatorColor: F.rot, searchResultColor: '#4A1A1D', searchResultColor2: '#2A1A1C',
  inputBackgroundColor: F.flaeche, inputForegroundColor: F.papier,
  // Schrift
  font: 'Segoe UI', fontSize: 18, inputFont: 'Segoe UI 17', timestampFont: 'Consolas 12', timestampFontEnabled: true,
  paragraphSpacing: 4,
  // Hervorhebungen, Farbregeln, Blacklist
  highlightEnabled: true, highlight: HIGHLIGHT, highlightOwnText: false, highlightMatches: true,
  msgColorsEnabled: true, msgColorsPrefer: true, msgColors: MSG_COLORS,
  // Moderation (deutsch)
  banReasons: 'Spam\nScam-Link\nHass / Beleidigung\nBann umgehen\nFremdwerbung\nSpoiler / Backseat',
  // Kanal und Tabs
  // onStart 2: verbinden und den Kanälen aus "channel" beitreten (nicht den zuletzt offenen)
  channel: [...MOD, ...MITLESEN].join(', '), onStart: 2, tabsPlacement: 'top', roomFavorites: {}, channelHistory: {},
  // Eigene Tabs (Chatty ab 0.26): Kopien wichtiger Nachrichten landen zusätzlich in "Wichtig" und "Blacklist"
  routing: [
    `to:Wichtig ${NAME}`,
    'to:Wichtig regwi:@chat|@mods|@staff|@admin',
    'to:Wichtig config:firstmsg',
    'to:Wichtig config:info regi:(is gifting|gifted|subscribed|resubscribed|\\[Raid\\]|donated|tipped)',
    `to:Blacklist ${NUR_MOD} ${HASS}`,
    `to:Blacklist ${NUR_MOD} ${SCAM}`,
  ],
  routingMulti: true,
  // Beim Betreten die letzten Nachrichten (bis 24 h) nachladen, praktisch nach einem Neustart
  historyServiceEnabled: true,
  // Schreibtricks wie hur3ns0hn oder h.u.r.e.n.s.o.h.n erkennen
  matchingSubstitutesEnabled: true,
}

// Basis: das bestehende UMBRA-Profil (damit eigene Änderungen bleiben), beim ersten Mal das alte Chatty-Profil
const UMBRA_DATEI = path.join(ZIEL, 'settings')
const quelle = fs.existsSync(UMBRA_DATEI) ? UMBRA_DATEI : ALT
const basis = fs.existsSync(quelle) ? JSON.parse(fs.readFileSync(quelle, 'utf8')) : {}
// Bots lösen nie ein Highlight aus (bestehende Einträge bleiben)
basis.noHighlightUsers = [...new Set([...(basis.noHighlightUsers ?? []), 'fossabot', 'streamelements', 'nightbot'])]
// Fenster-Layout mit fremden Kanälen verwerfen, damit nur esel_99 (plus eigene Tabs) aufgeht
const erlaubt = new Set([...MOD, ...MITLESEN].map(k => '#' + k))
const fremd = (JSON.stringify(basis.layouts ?? {}).match(/"#[^"]+"/g) ?? []).some(k => !erlaubt.has(k.slice(1, -1).toLowerCase()))
if (quelle === ALT || fremd) basis.layouts = {}
for (const k of Object.keys(basis)) if (/token|login|pass|secret|oauth/i.test(k)) delete basis[k]
const neu = { ...basis, ...UMBRA }

fs.mkdirSync(ZIEL, { recursive: true })
const datei = path.join(ZIEL, 'settings')
if (fs.existsSync(datei)) fs.copyFileSync(datei, datei + '.vorher')
fs.writeFileSync(datei, JSON.stringify(neu))
console.log('Profil geschrieben:', datei, `(${Object.keys(neu).length} Einstellungen)`)

// Verknüpfung im Startmenü
const lnk = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Chatty UMBRA.lnk')
const ps = `$s=(New-Object -ComObject WScript.Shell).CreateShortcut('${lnk}'); $s.TargetPath='C:\\Program Files (x86)\\Chatty\\Chatty.exe'; $s.Arguments='-d "${ZIEL}"'; $s.WorkingDirectory='C:\\Program Files (x86)\\Chatty'; $s.Description='Chatty mit UMBRA-Profil'; $s.Save()`
execFileSync('powershell', ['-NoProfile', '-Command', ps])
console.log('Verknüpfung:', lnk)

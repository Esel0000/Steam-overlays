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
// Liste vom User am 06.11.2026 vorgegeben; Mod laut twitch.tv/moderator: restinpeace10, basler20, mellivlne
const MOD = ['esel_99', 'restinpeace10', 'basler20', 'mellivlne']
const MITLESEN = [
  'elias97', 'montanblack88', 'holyzuhla', 'xrohat', 'kerem_xtr', '17kaiser', 'inoiizy', 'armanibelfort',
  'emiliaperry', 'sarialivetv', 'ksfreak', 'pauiinski', 'therealknossi', 'unfair', 'kevinpannewitz',
  'cherrykiss__', 'hashloco', 'fabse304', 'justbeeingeli', 'itsmeclaiire',
]
const NUR_MOD = `chan:${MOD.join(',')}`

// Namen und Stichwörter, die immer auffallen sollen
const NAME = 'regwi:@?(esel(_?99|_?8i)?|basler|pasa ?paco|pasa|pruda(_?031)?)'

// ncat: = Kategorie für Benachrichtigungen (Ton nur bei Erwähnung und Blacklist)
// Nur die Namen gelten in allen Chats. Alles andere nur in den Mod-Kanälen, sonst fluten große Kanäle
// (z. B. xRohat, MontanaBlack) den Tab "Wichtig" mit Erstschreibern, Subs und "@chat".
const HIGHLIGHT = [
  `ncat:erwaehnung ${NAME}`,
  `${NUR_MOD} regwi:@chat|@mods|@staff|@admin`,
  `${NUR_MOD} config:firstmsg`,
  `${NUR_MOD} config:info regi:(is gifting|gifted|subscribed|resubscribed|\\[Raid\\])`,
  `${NUR_MOD} config:info +regi:donated|tipped|spende`,
  `${NUR_MOD} config:t|bits`,
  `ncat:blacklist ${NUR_MOD} ${HASS}`,
  `ncat:blacklist ${NUR_MOD} ${SCAM}`,
  // Banns und Timeouts landen so auch im Highlight-Fenster
  `${NUR_MOD} config:info regi:\\[ModAction\\].*(ban|timeout|timed out|gesperrt)`,
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
  channel: [...MOD, ...MITLESEN].join(', '), onStart: 2, tabsPlacement: 'top',
  // Eigene Tabs (Chatty ab 0.26): Kopien wichtiger Nachrichten landen zusätzlich in "Wichtig" und "Blacklist"
  routing: [
    `to:Wichtig ${NAME}`,
    `to:Wichtig ${NUR_MOD} regwi:@chat|@mods|@staff|@admin`,
    `to:Wichtig ${NUR_MOD} config:firstmsg`,
    `to:Wichtig ${NUR_MOD} config:info regi:(is gifting|gifted|subscribed|resubscribed|\\[Raid\\]|donated|tipped)`,
    `to:Blacklist ${NUR_MOD} ${HASS}`,
    `to:Blacklist ${NUR_MOD} ${SCAM}`,
  ],
  routingMulti: true,
  // Beim Betreten die letzten Nachrichten (bis 24 h) nachladen, praktisch nach einem Neustart
  historyServiceEnabled: true,
  // Schreibtricks wie hur3ns0hn oder h.u.r.e.n.s.o.h.n erkennen
  matchingSubstitutesEnabled: true,
  // Spam-Erkennung: gleiche Nachricht 3x innerhalb von 10 Minuten wird markiert (Mods ausgenommen)
  repeatMsg: true, repeatMsgRep: 3, repeatMsgTime: 600,
  // Emotes eine Spur kleiner, damit die Zeilen ruhig bleiben
  emoteScale: 90,
  // Mod-Knöpfe im Nutzerfenster (Zeichen in [] = Taste)
  timeoutButtons: [
    '@a1',
    'Löschen[1]=/delete $$(msg-id)',
    '.1s, 1m[2], 10m[3], 1h[4], 1d[5], 7d[7], /Ban[B], /Unban[U]',
    '@a2',
    './Spam[S]', './Scam-Link[L]', './Beleidigung[H]', './Bann umgehen', './Fremdwerbung[F]',
    '.Verwarnen[W]=/warn $$1 Bitte halte dich an die Regeln.',
    '.Mod-Karte=/card $$1',
    '',
    '@AutoMod',
    '.Erlauben[A]=/Automod_approve', '.Ablehnen=/Automod_deny',
  ].join('\n'),
  // Rechtsklick auf einen Namen
  userContextMenu: [
    'Verwarnen=/warn $$1 Bitte halte dich an die Regeln.',
    'Shoutout=/shoutout $$1',
    'Mod-Karte=/card $$1',
    'Nachrichten anzeigen=/userinfo $$1',
    '-',
    'Mod Lookup=/modlookup $$1',
    'Melden=/report $$1',
    'Übersetzen=/translate',
  ].join('\n'),
}

// Basis: das bestehende UMBRA-Profil (damit eigene Änderungen bleiben), beim ersten Mal das alte Chatty-Profil
const UMBRA_DATEI = path.join(ZIEL, 'settings')
const quelle = fs.existsSync(UMBRA_DATEI) ? UMBRA_DATEI : ALT
const basis = fs.existsSync(quelle) ? JSON.parse(fs.readFileSync(quelle, 'utf8')) : {}
// Bots lösen nie ein Highlight aus (bestehende Einträge bleiben)
basis.noHighlightUsers = [...new Set([...(basis.noHighlightUsers ?? []), 'fossabot', 'streamelements', 'nightbot'])]
// Layout: nur Kanal-Tabs entfernen, die nicht mehr in der Liste stehen. Aufteilung, angedockte Fenster
// und eigene Tabs (Blacklist, Wichtig, Live, Moderationsprotokoll) bleiben, wie du sie eingerichtet hast.
const erlaubt = new Set([...MOD, ...MITLESEN, 'blacklist', 'wichtig'].map(k => '#' + k))
const istFremd = (n) => typeof n === 'string' && n.startsWith('#') && !erlaubt.has(n.toLowerCase())
function aufraeumen(knoten) {
  if (Array.isArray(knoten)) {
    if (knoten[0] === 't' && Array.isArray(knoten[1])) {
      knoten[1] = knoten[1].filter(n => !istFremd(n))
      if (istFremd(knoten[2])) knoten[2] = knoten[1][0] ?? null
    }
    knoten.forEach(aufraeumen)
  } else if (knoten && typeof knoten === 'object') Object.values(knoten).forEach(aufraeumen)
}
if (quelle === ALT) basis.layouts = {}
else aufraeumen(basis.layouts)
// Favoriten: aus dem alten Profil nichts übernehmen; im UMBRA-Profil nur Kanäle behalten, die noch in der Liste stehen
if (quelle === ALT) { basis.roomFavorites = {}; basis.channelHistory = {} }
else for (const k of Object.keys(basis.roomFavorites ?? {})) if (istFremd(k)) delete basis.roomFavorites[k]
// Alle Kanäle der Liste sind Favoriten, damit die Live-Liste (Strg+L, "Nur Favoriten") genau sie zeigt
basis.roomFavorites ??= {}
for (const k of [...MOD, ...MITLESEN]) basis.roomFavorites['#' + k] ??= [Date.now(), false]
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

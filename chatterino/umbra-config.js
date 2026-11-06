// Chatterino im UMBRA-Look: Theme, Schrift, Highlights, Blacklist-Farben, Mod-Knöpfe, Bann-Befehle und Fenster-Layout.
// Ausführen: node chatterino/umbra-config.js   (Chatterino vorher über das X schließen, sonst überschreibt es beim Beenden)
// Felder laut Chatterino-Quellcode v2.5.5 (Settings.hpp, HighlightPhrase.hpp, ModerationAction.hpp, Command.hpp, WindowManager.cpp).
const fs = require('fs')
const path = require('path')
const BANNS = require('../bann-gruende.json')

const BASIS = path.join(process.env.APPDATA, 'Chatterino2')
const SETTINGS = path.join(BASIS, 'Settings')

// ---------- Kanäle (gleiche Liste wie im Chatty-Profil) ----------
const MOD = ['esel_99', 'restinpeace10', 'basler20', 'mellivlne']
const CHATS = [
  'elias97', 'montanblack88', 'holyzuhla', 'xrohat', 'kerem_xtr', '17kaiser', 'inoiizy', 'armanibelfort',
  'emiliaperry', 'sarialivetv', 'ksfreak', 'pauiinski', 'therealknossi', 'unfair', 'kevinpannewitz',
  'cherrykiss__', 'hashloco', 'fabse304', 'justbeeingeli', 'itsmeclaiire',
]

// ---------- Theme ----------
const theme = {
  $schema: 'https://raw.githubusercontent.com/Chatterino/chatterino2/v2.5.5/docs/ChatterinoTheme.schema.json',
  metadata: { iconTheme: 'light' },
  colors: {
    accent: '#c42a31',
    messages: {
      backgrounds: { alternate: '#110a0b', regular: '#0b0708' },
      disabled: '#990b0708',
      highlightAnimationEnd: '#00c42a31',
      highlightAnimationStart: '#6ec42a31',
      selection: '#40e0565c',
      textColors: { caret: '#f2efe8', chatPlaceholder: '#5e5652', link: '#e0565c', regular: '#e8e3da', system: '#8a817a' },
    },
    overlayMessages: {
      backgrounds: { alternate: '#32000000', regular: 'transparent' },
      disabled: '#64000000',
      selection: '#40e0565c',
      textColors: { caret: '#f2efe8', chatPlaceholder: '#5e5652', link: '#e0565c', regular: '#f2efe8', system: '#8a817a' },
      background: '#0b0708',
    },
    scrollbars: { background: '#00000000', thumb: '#2a1a1c', thumbSelected: '#4a1a1d' },
    splits: {
      background: '#0b0708',
      dropPreview: '#30c42a31', dropPreviewBorder: '#c42a31',
      dropTargetRect: '#00c42a31', dropTargetRectBorder: '#00c42a31',
      header: { background: '#0e0809', border: '#1a1012', focusedBackground: '#160c0e', focusedBorder: '#2a1a1c', focusedText: '#e0565c', text: '#e8e3da' },
      input: { background: '#120b0c', backgroundPulse: '#3a1014', text: '#f2efe8' },
      messageSeperator: '#2a1a1c',
      resizeHandle: '#70c42a31', resizeHandleBackground: '#20c42a31',
    },
    tabs: {
      liveIndicator: '#e0565c', rerunIndicator: '#e8c547', dividerLine: '#2a1a1c',
      highlighted: { backgrounds: { hover: '#160c0e', regular: '#110a0b', unfocused: '#110a0b' }, line: { hover: '#e0565c', regular: '#e0565c', unfocused: '#e0565c' }, text: '#f2efe8' },
      newMessage: { backgrounds: { hover: '#160c0e', regular: '#110a0b', unfocused: '#110a0b' }, line: { hover: '#5e5652', regular: '#5e5652', unfocused: '#5e5652' }, text: '#e8e3da' },
      regular: { backgrounds: { hover: '#160c0e', regular: '#0b0708', unfocused: '#0b0708' }, line: { hover: '#2a1a1c', regular: '#1a1012', unfocused: '#1a1012' }, text: '#8a817a' },
      selected: { backgrounds: { hover: '#1a1012', regular: '#1a1012', unfocused: '#1a1012' }, line: { hover: '#c42a31', regular: '#c42a31', unfocused: '#c42a31' }, text: '#f2efe8' },
    },
    window: { background: '#070304', text: '#e8e3da' },
  },
}

// ---------- Highlights ----------
// Farben als #AARRGGBB. Namen: Ton + Erwähnungen-Fenster. Blacklist: nur Farbe (Chatterino kann nicht nach Kanal filtern,
// deshalb kein Ton und nicht in den Erwähnungen, sonst würden große Chats nerven).
const NAME = '\\b@?(esel(_?99|_?8i)?|basler|pasa ?paco|pasa|pruda(_?031)?)\\b'
const HASS = '\\b(hurensohn|huso|missgeburt|spast|spasti|(du|bist du|seid ihr|ihr) behindert|mongo|schwuchtel|transe|fotze|kanake|zigeuner|n[i1!]gg(a|er|ah)|f[a@]gg?ot|retard|kys|kill yourself|bring dich um)\\b'
const SCAM = '((free|gratis|kostenlos).{0,25}(followers?|viewers?|zuschauer|nitro)|(cheap|billig|buy|kauf).{0,25}(followers?|viewers?|zuschauer|primes?|subs?)|dogehype|streamboo|bigfollows|followkings|viewerboost|twitchboost|onlyfans|nudes|steamcommunity\\.(ru|cc)|discordnitro|nitro.{0,10}(free|gift))'
const phrase = (pattern, color, { mentions = false, sound = false } = {}) =>
  ({ pattern, showInMentions: mentions, alert: sound, sound, regex: true, case: false, soundUrl: '', color })

const highlights = [
  phrase(NAME, '#b35a1418', { mentions: true, sound: true }),
  phrase('@(mods|chat|staff|admin)\\b', '#803a1014', { mentions: true }),
  phrase(HASS, '#d9c42a31'),
  phrase(SCAM, '#b3e8c547'),
]

// ---------- Mod-Knöpfe (Schwert-Symbol oben im Chat schaltet sie ein) ----------
const modActions = [
  { pattern: '/delete {msg.id}', icon: '' },
  { pattern: '/timeout {user.name} 1', icon: '' },
  { pattern: '/timeout {user.name} 600', icon: '' },
  { pattern: '/timeout {user.name} 3600', icon: '' },
  { pattern: '/timeout {user.name} 86400', icon: '' },
  { pattern: '/ban {user.name}', icon: '' },
]

// ---------- Befehle: /troll name, /spam name … (Bann oder Timeout mit festem Grund) ----------
const commands = BANNS.map(b => ({
  name: b.befehl,
  func: b.dauer ? `/timeout {1} ${b.dauer} ${b.grund}` : `/ban {1} ${b.grund}`,
  showInMsgContextMenu: false,
}))

// ---------- Fenster ----------
const split = (name, mod = false) => ({ type: 'split', moderationMode: mod, data: { type: 'twitch', name }, filters: [], flexh: 1, flexv: 1 })
const spezial = (type) => ({ type: 'split', moderationMode: false, data: { type }, filters: [], flexh: 1, flexv: 1 })
const spalte = (items, flexh = 1) => ({ type: 'vertical', items, flexh, flexv: 1 })
const layout = {
  windows: [{
    type: 'main', x: 0, y: 0, width: 1600, height: 1000,
    emotePopup: { height: 0, width: 0, x: 0, y: 0 },
    tabs: [
      // Tab 1: deine vier Mod-Chats im Raster, rechts Erwähnungen, AutoMod und wer live ist
      { selected: true, highlightsEnabled: true, splits2: { type: 'horizontal', flexh: 1, flexv: 1, items: [
        spalte([split('esel_99', true), split('restinpeace10', true)], 2),
        spalte([split('basler20', true), split('mellivlne', true)], 2),
        spalte([spezial('mentions'), spezial('automod'), spezial('live')], 1),
      ] } },
      // Danach je ein Tab pro Chat
      ...CHATS.map(name => ({ highlightsEnabled: true, splits2: split(name) })),
    ],
  }],
}

// ---------- Schreiben ----------
const lies = (datei, leer) => (fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, 'utf8')) : leer)
const schreibe = (datei, inhalt) => {
  if (fs.existsSync(datei)) fs.copyFileSync(datei, datei + '.vorher')
  fs.writeFileSync(datei, JSON.stringify(inhalt, null, 4))
  console.log('geschrieben:', datei)
}

fs.mkdirSync(path.join(BASIS, 'Themes'), { recursive: true })
schreibe(path.join(BASIS, 'Themes', 'UMBRA.json'), theme)

const s = lies(path.join(SETTINGS, 'settings.json'), {})
s.appearance = { ...(s.appearance ?? {}) }
s.appearance.theme = { ...(s.appearance.theme ?? {}), name: 'UMBRA.json', darkSystem: 'UMBRA.json' }
s.appearance.currentFontFamily = 'Segoe UI'
s.appearance.currentFontSize = 11
s.appearance.messages = { ...(s.appearance.messages ?? {}),
  showTimestamps: true, timestampFormat: 'HH:mm', separateMessages: true, alternateMessageBackground: true,
  boldUsernames: true, colorUsernames: true }
// Ruhiger Chat: nur Rang-Abzeichen (Broadcaster, Mod, VIP, Sub), keine Deko-Abzeichen
s.appearance.badges = { ...(s.appearance.badges ?? {}), vanity: false, predictions: false, chatterino: false, ffz: false, bttv: false, seventv: false }
s.behaviour = { ...(s.behaviour ?? {}), showJoins: false, showParts: false, mentionUsersWithAt: true }
s.highlighting = { ...(s.highlighting ?? {}),
  highlights: highlights,
  blacklist: ['fossabot', 'streamelements', 'nightbot'].map(pattern => ({ pattern, regex: false })),
  selfHighlightColor: '#b35a1418' }
s.moderation = { ...(s.moderation ?? {}), actions: modActions }
schreibe(path.join(SETTINGS, 'settings.json'), s)

schreibe(path.join(SETTINGS, 'commands.json'), { commands })
schreibe(path.join(SETTINGS, 'window-layout.json'), layout)
console.log(`Fertig: ${MOD.length + CHATS.length} Kanäle, ${highlights.length} Highlights, ${commands.length} Befehle`)

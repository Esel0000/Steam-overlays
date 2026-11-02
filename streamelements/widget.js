// Esel_99 Alerts für StreamElements (Custom Widget): Follow, Sub, Resub, Geschenk-Subs, Raid, Bits, Spenden.
// Texte im selben Familien-Ton wie die Fossabot-Chat-Alerts, je Ereignis ein eigener Sound.
// Schutz gegen Wellen: Follows, Cheers und Einzel-Geschenke kurz hintereinander werden zu einer Karte zusammengefasst,
// die Warteschlange ist begrenzt (kleine Alerts fliegen zuerst raus), bei Stau werden Karten kürzer gezeigt.
let field = {};
const queue = [];
let busy = false;
const WINDOW_MS = 4000;    // so lange werden gleichartige Ereignisse gesammelt
const MAX_QUEUE = 6;
const buckets = {};        // gesammelte Ereignisse je Art (und Schenker)
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const num = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

function grain() {
  const c = $("grain").getContext("2d"), img = c.createImageData(460, 130), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = 128 + (Math.random() - 0.5) * 90; d[i] = d[i + 1] = d[i + 2] = n; d[i + 3] = 255; }
  c.putImageData(img, 0, 0);
}

// Karte: [Überschrift, Name, Zeile darunter, groß?, Sound-Art]
function single(listener, e) {
  const name = esc(e.name || e.displayName || e.username || "Jemand");
  const n = Number(e.amount) || 0;
  if (listener === "raid-latest") return ["BESUCH", name, `kommt mit <b>${n}</b> Leuten. Respekt.`, n >= 10, "raid"];
  if (listener === "tip-latest") return ["SPENDE", name, `legt <b>${num(n)} €</b> auf den Tisch. Die Familie dankt.`, n >= 20, "tip"];
  if (listener === "subscriber-latest") {
    if (e.bulkGifted) return ["GESCHENK", esc(e.sender || e.name), `verteilt <b>${n}</b> Subs. So zeigt man Größe.`, n >= 5, "gift"];
    if (n > 1) return ["LOYALITÄT", name, `bleibt loyal: <b>${n}</b> Monate in der Familie.`, n >= 12, "sub"];
    return ["LOYALITÄT", name, "gehört jetzt zur Familie. Willkommen.", false, "sub"];
  }
  return null;
}

// Gesammelte Ereignisse einer Art zu einer Karte machen
function merged(kind, rows) {
  const names = rows.map((r) => r.name);
  if (kind === "follow") {
    return rows.length === 1
      ? ["NEU IN DER FAMILIE", names[0], "folgt jetzt. Die Familie sieht dich.", false, "follow"]
      : ["NEU IN DER FAMILIE", `${rows.length} Leute`, "folgen jetzt. Die Familie wächst.", false, "follow"];   // Follow-Wellen sind oft Bots: nie groß
  }
  if (kind === "bits") {
    const sum = rows.reduce((a, r) => a + r.amount, 0);
    return rows.length === 1
      ? ["TRIBUT", names[0], `legt <b>${num(sum)}</b> Bits auf den Tisch.`, sum >= 500, "bits"]
      : ["TRIBUT", `${rows.length} Leute`, `legen <b>${num(sum)}</b> Bits auf den Tisch.`, sum >= 500, "bits"];
  }
  // Einzel-Geschenke eines Schenkers
  const sender = rows[0].sender;
  return rows.length === 1
    ? ["GESCHENK", sender, `holt <b>${names[0]}</b> in die Familie.`, false, "gift"]
    : ["GESCHENK", sender, `holt <b>${rows.length}</b> Leute in die Familie.`, rows.length >= 5, "gift"];
}

function collect(key, kind, row) {
  if (!buckets[key]) {
    buckets[key] = { kind, rows: [] };
    setTimeout(() => {
      const b = buckets[key];
      delete buckets[key];
      enqueue(merged(b.kind, b.rows));
    }, WINDOW_MS);
  }
  buckets[key].rows.push(row);
}

function enqueue(row) {
  if (queue.length >= MAX_QUEUE) {
    const small = queue.findIndex((r) => !r[3]);
    if (small >= 0) queue.splice(small, 1);
    else if (!row[3]) return;   // Warteschlange voll mit großen Momenten: kleinen Alert verwerfen
  }
  queue.push(row);
  next();
}

function sound(src) {
  if (!src) return false;
  const s = new Audio(src);
  s.volume = Math.max(0, Math.min(1, (Number(field.volume) || 50) / 100));
  s.play().catch(() => {});
  return true;
}

function play(row) {
  busy = true;
  const [kicker, name, line, big, kind] = row;
  // Großer Moment: Boom läuft zusätzlich; sein Schlag (nach ~0,35 s) trifft die Landung der Karte
  if (big) sound(field.soundBig);
  sound(field["sound_" + kind]);
  show(kicker, name, line, big);
}

function show(kicker, name, line, big) {
  $("kicker").textContent = kicker;
  $("name").innerHTML = name;
  $("line").innerHTML = line;
  grain();
  const a = $("alert");
  a.className = "alert";
  void a.offsetWidth;   // Animation neu starten
  a.className = big ? "alert big in" : "alert in";
  // Bei Stau kürzer anzeigen, damit die Warteschlange abgebaut wird
  const seconds = queue.length >= 2 ? 4 : Number(field.duration) || 7;
  setTimeout(() => {
    a.className = (big ? "alert big" : "alert") + " in out";
    setTimeout(() => { busy = false; next(); }, 600);
  }, seconds * 1000);
}

function next() {
  if (!busy && queue.length) play(queue.shift());
}

window.addEventListener("onWidgetLoad", (obj) => {
  field = obj.detail.fieldData || {};
});

window.addEventListener("onEventReceived", (obj) => {
  const { listener, event: e } = obj.detail || {};
  if (!e) return;
  const n = Number(e.amount) || 0;
  const name = esc(e.name || e.displayName || e.username || "Jemand");
  if (listener === "raid-latest" && n < (Number(field.minRaid) || 2)) return;
  if (listener === "cheer-latest" && n < (Number(field.minBits) || 1)) return;
  if (listener === "tip-latest" && n < (Number(field.minTip) || 1)) return;

  if (listener === "follower-latest") return collect("follow", "follow", { name });
  if (listener === "cheer-latest") return collect("bits", "bits", { name, amount: n });
  if (listener === "subscriber-latest" && e.isCommunityGift) return;   // Teil einer Sammel-Spende, die kommt als eine Karte
  if (listener === "subscriber-latest" && e.gifted && !e.bulkGifted) {
    const sender = esc(e.sender || "Jemand");
    return collect("gift:" + sender, "gift", { name, sender });
  }
  const row = single(listener, e);
  if (row) enqueue(row);
});

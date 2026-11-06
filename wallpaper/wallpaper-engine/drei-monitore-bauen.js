// Baut die Wallpaper-Engine-Projekte "umbra-links" (Uhr) und "umbra-rechts" (System) aus umbra-nacht/index.html.
const fs = require("fs");
const path = require("path");
const base = "D:/SteamLibrary/steamapps/common/wallpaper_engine/projects/myprojects";
const src = fs.readFileSync(path.join(base, "umbra-nacht/index.html"), "utf8");

const css = `
  .seite { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 9vw; box-sizing: border-box; }
  .links .seite { align-items: flex-end; text-align: right; }
  .rechts .seite { align-items: flex-start; text-align: left; }
  .klein { font-size: clamp(10px, .62vw, 13px); letter-spacing: .3em; text-transform: uppercase; opacity: .55; }
  .rot { color: var(--rot); opacity: 1; }
  .grossuhr { font: 400 clamp(90px, 10.5vw, 220px)/.9 "Bodoni", Georgia, serif; letter-spacing: .02em; font-variant-numeric: tabular-nums; margin: .25em 0 .1em; text-shadow: 0 0 60px rgba(196,42,49,.25); }
  .grossuhr .sek { color: var(--rot); font-size: .3em; margin-left: .2em; vertical-align: 1.9em; }
  .tag { font: italic 400 clamp(22px, 1.9vw, 40px)/1.2 "Bodoni", Georgia, serif; margin-bottom: 2.2em; }
  .balken { width: min(26vw, 460px); height: 2px; background: rgba(242,239,232,.12); margin: 1em 0 .8em; position: relative; }
  .links .balken { margin-left: auto; }
  .balken i { position: absolute; top: 0; bottom: 0; right: 0; background: var(--rot); box-shadow: 0 0 14px var(--rot); }
  .rechts .balken i { right: auto; left: 0; }
  .titel { font: 400 clamp(30px, 2.6vw, 56px)/1 "Bodoni", Georgia, serif; letter-spacing: .3em; margin: .5em 0 1.1em; }
  .kal { display: grid; grid-template-columns: repeat(7, 2.9em); gap: .55em 0; font-size: clamp(11px, .8vw, 16px); letter-spacing: .08em; }
  .kal span { text-align: center; padding: .35em 0; opacity: .7; }
  .kal .kopf { opacity: .35; font-size: .8em; letter-spacing: .25em; }
  .kal .leer { opacity: 0; }
  .kal .heute { color: #070304; background: var(--rot); opacity: 1; box-shadow: 0 0 18px rgba(196,42,49,.6); }
  .kal .we { opacity: .4; }
  .dienste { margin-top: 2.6em; min-width: min(26vw, 460px); }
  .dienst { display: flex; align-items: center; gap: 1em; padding: .75em 0; border-top: 1px solid rgba(242,239,232,.08); font-size: clamp(11px, .75vw, 15px); letter-spacing: .2em; text-transform: uppercase; }
  .dienst b { width: 7px; height: 7px; border-radius: 50%; background: #3fbf7f; box-shadow: 0 0 10px #3fbf7f; animation: puls 2.4s infinite; }
  .dienst.down b { background: var(--rot); box-shadow: 0 0 10px var(--rot); }
  .dienst em { margin-left: auto; font-style: normal; opacity: .45; letter-spacing: .1em; }
  @keyframes puls { 50% { opacity: .35; } }
`;

const hudLinks = `
<div id="hud" class="links">
  <div class="ecke l" id="eckeL">UMBRA · Zeit</div>
  <div class="seite">
    <div class="klein" id="kw"></div>
    <div class="grossuhr" id="zeit"></div>
    <div class="tag" id="datum"></div>
    <div class="klein">Tag vergangen · <span class="rot" id="prozent"></span></div>
    <div class="balken"><i id="fortschritt"></i></div>
    <div class="klein status" id="status">Alles unter Kontrolle.</div>
  </div>
</div>`;

const hudRechts = `
<div id="hud" class="rechts">
  <div class="ecke r" id="eckeR">UMBRA · System</div>
  <div class="seite">
    <div class="klein" id="monatJahr"></div>
    <div class="titel" id="monat"></div>
    <div class="kal" id="kal"></div>
    <div class="dienste" id="dienste" hidden></div>
    <div class="klein" style="margin-top:2em" id="stand"></div>
  </div>
</div>`;

const scriptLinks = `
const zeit = document.getElementById("zeit"), datum = document.getElementById("datum"), status = document.getElementById("status");
const STATUS = ["Alles unter Kontrolle.", "Die Familie schläft nie.", "Niemand kommt rein.", "Sektor ruhig.", "Wir sehen alles."];
let si = 0;
function kw(d) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / 864e5 + 1) / 7); }
function tick() {
  const d = new Date(), p2 = (n) => String(n).padStart(2, "0");
  zeit.innerHTML = p2(d.getHours()) + ":" + p2(d.getMinutes()) + '<span class="sek">' + p2(d.getSeconds()) + "</span>";
  datum.textContent = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("kw").textContent = "Kalenderwoche " + kw(d) + " · " + d.getFullYear();
  const pct = ((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 864) | 0;
  document.getElementById("prozent").textContent = pct + " %";
  document.getElementById("fortschritt").style.width = pct + "%";
}
setInterval(tick, 1000); tick();
setInterval(() => { status.style.opacity = 0; setTimeout(() => { si = (si + 1) % STATUS.length; status.textContent = STATUS[si]; status.style.opacity = 0.9; }, 1200); }, 9000);
function apply() { document.getElementById("eckeL").classList.toggle("aus", !opt.texte); }
`;

const scriptRechts = `
function kalender() {
  const d = new Date(), y = d.getFullYear(), m = d.getMonth();
  document.getElementById("monat").textContent = d.toLocaleDateString("de-DE", { month: "long" }).toUpperCase();
  document.getElementById("monatJahr").textContent = y + " · " + d.toLocaleDateString("de-DE", { weekday: "long" });
  const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  let html = ["Mo","Di","Mi","Do","Fr","Sa","So"].map((t) => '<span class="kopf">' + t + "</span>").join("");
  for (let i = 0; i < first; i++) html += '<span class="leer">·</span>';
  for (let n = 1; n <= days; n++) { const wd = (first + n - 1) % 7; html += '<span class="' + (n === d.getDate() ? "heute" : wd > 4 ? "we" : "") + '">' + n + "</span>"; }
  document.getElementById("kal").innerHTML = html;
}
kalender(); setInterval(kalender, 60000);
// Status der Dienste von evrionstudio.com (nur wenn Wallpaper Engine den Abruf erlaubt, sonst bleibt der Block weg)
async function dienste() {
  const box = document.getElementById("dienste"), stand = document.getElementById("stand");
  try {
    const r = await fetch("https://evrionstudio.com/api/status", { cache: "no-store" });
    const s = await r.json();
    box.innerHTML = s.services.map((x) => '<div class="dienst' + (x.state === "up" ? "" : " down") + '"><b></b>' + x.label + "<em>" + (x.state === "up" ? (x.uptime != null ? x.uptime.toFixed(2) + " %" : "online") : "gestört") + "</em></div>").join("");
    box.hidden = false;
    stand.innerHTML = s.allUp ? 'Alle Systeme · <span class="rot">stabil</span>' : 'Achtung · <span class="rot">Störung</span>';
  } catch { box.hidden = true; stand.textContent = "Sektor ruhig."; }
}
dienste(); setInterval(dienste, 60000);
function apply() { document.getElementById("eckeR").classList.toggle("aus", !opt.texte); }
`;

function build(name, title, offsetX, hud, script) {
  let html = src;
  html = html.replace("<title>UMBRA · Nacht</title>", `<title>${title}</title>`);
  html = html.replace("</style>", css + "</style>");
  html = html.replace(/<div id="hud">[\s\S]*?\n<\/div>\n<script>/, hud + "\n<script>");
  // gemeinsame Zeitbasis: alle Bildschirme laufen synchron, das Feld ist über die Monitore hinweg eine Landschaft
  html = html.replace("let last = 0, t0 = performance.now();", "let last = 0;");
  html = html.replace("const t = (now - t0) / 1000 * 0.035 * opt.tempo;", "const t = (Date.now() / 1000 % 100000) * 0.035 * opt.tempo;");
  html = html.replace("const period = 16, ph = ((now - t0) / 1000 % period) / period;", "const period = 16, ph = (Date.now() / 1000 % period) / period;");
  html = html.replace("const px = x * CELL, py = y * CELL;", `const px = x * CELL + ${offsetX}, py = y * CELL;`);
  html = html.replace("const dx = px - maus.sx,", `const dx = px - ${offsetX} - maus.sx,`);
  html = html.replace(/\/\/ ---------- Uhr, Datum, Status ----------[\s\S]*?\/\/ ---------- Wallpaper Engine Eigenschaften ----------\nfunction apply\(\) \{[\s\S]*?\n\}\n/, script + "\n// ---------- Wallpaper Engine Eigenschaften ----------\n");
  if (html.includes("t0") || !html.includes(String(offsetX))) throw new Error(name + ": Ersetzung fehlgeschlagen");
  const dir = path.join(base, name);
  fs.mkdirSync(path.join(dir, "fonts"), { recursive: true });
  for (const f of ["bodoni.woff2", "martian-mono.woff2"]) fs.copyFileSync(path.join(base, "umbra-nacht/fonts", f), path.join(dir, "fonts", f));
  fs.writeFileSync(path.join(dir, "index.html"), html);
  const project = JSON.parse(fs.readFileSync(path.join(base, "umbra-nacht/project.json"), "utf8"));
  project.title = title;
  project.description = name === "umbra-links" ? "Linker Monitor: Uhr, Datum, Kalenderwoche, Tagesfortschritt. Höhenlinien laufen mit dem rechten Monitor zusammen." : "Rechter Monitor: Kalender und Status der Dienste. Höhenlinien laufen mit dem linken Monitor zusammen.";
  delete project.general.properties.uhr;
  fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, "\t"));
  console.log("gebaut:", dir);
}

build("umbra-links", "UMBRA · Zeit", -1920, hudLinks, scriptLinks);
build("umbra-rechts", "UMBRA · System", 1920, hudRechts, scriptRechts);

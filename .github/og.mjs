// Her aktif kullanıcı için /u/<kullanıcı>.html üretir: X, WhatsApp, Instagram vb. link önizlemesi (kart) için.
import fs from "node:fs";
const SB = "https://ewxocsbeqdfwxqdljmdr.supabase.co";
const KEY = "sb_publishable_PO2_8gHQEUxDqbResoGrpQ_vptsU78o"; // herkese açık (publishable) anahtar
const SITE = "https://sorsana.github.io";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const r = await fetch(`${SB}/rest/v1/rpc/og_profiles`, {
  method: "POST", body: "{}",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
});
if (!r.ok) { console.error("og_profiles:", r.status, await r.text()); process.exit(0); }
const users = await r.json();
const tpl = fs.readFileSync("index.html", "utf8");
fs.mkdirSync("u", { recursive: true });
let n = 0;
for (const u of users) {
  if (!/^[a-z0-9_.]{1,40}$/.test(u.username)) continue;
  const name = u.display_name || u.username;
  const title = `${name} (@${u.username}) · sorsana`;
  const desc = "Bana anonim olarak soru sor 👀";
  const url = `${SITE}/u/${u.username}`;
  const img = !u.avatar_url ? `${SITE}/icons/icon-512.png`
    : /^https?:\/\//.test(u.avatar_url) ? u.avatar_url : `${SB}/storage/v1/object/public/media/${u.avatar_url}`;
  const og = [
    '<meta property="og:site_name" content="sorsana">',
    '<meta property="og:type" content="profile">',
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
  ].join("\n  ");
  const html = tpl.replace(/<!--og-->[\s\S]*?<!--\/og-->/, og).replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  fs.writeFileSync(`u/${u.username}.html`, html);
  n++;
}
console.log(`${n} profil sayfası üretildi`);

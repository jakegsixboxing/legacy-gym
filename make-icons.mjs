// Generates the Legacy Gym app icons at build time.
// Tries the real Legacy Gym logo from the website CDN first;
// falls back to a text mark if the fetch fails.
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';

const OLD_UA = 'Mozilla/4.0'; // old UA makes Google Fonts return plain TTF urls

async function fontFile(query, out) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${query}&display=swap`, {
    headers: { 'User-Agent': OLD_UA }
  })).text();
  const m = css.match(/url\((https:[^)]+)\)/);
  if (!m) throw new Error('No font url for ' + query + '\n' + css);
  const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
  fs.writeFileSync(out, buf);
  return out;
}

const oswald = await fontFile('Oswald:wght@600', '/tmp/oswald.ttf');

let svg;
try {
  const LOGO_URL = 'https://www.legacygym.net/cdn/shop/files/legacy_website_logo_480x.png?v=1767085643';
  const res = await fetch(LOGO_URL);
  if (!res.ok) throw new Error('logo fetch ' + res.status);
  const b64 = Buffer.from(await res.arrayBuffer()).toString('base64');
  svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="512" height="512" fill="#0b0b0c"/>
    <image xlink:href="data:image/png;base64,${b64}" x="66" y="106" width="380" height="300" preserveAspectRatio="xMidYMid meet"/>
  </svg>`;
  console.log('using real Legacy Gym logo');
} catch (e) {
  console.log('logo fetch failed (' + e.message + ') — falling back to text mark');
  svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#0b0b0c"/>
    <text x="256" y="250" font-family="Oswald, Oswald SemiBold" font-weight="600" font-size="96" letter-spacing="6" fill="#ffffff" text-anchor="middle">LEGACY</text>
    <text x="256" y="352" font-family="Oswald, Oswald SemiBold" font-weight="600" font-size="72" letter-spacing="18" fill="#c9a44c" text-anchor="middle">GYM</text>
    <rect x="216" y="392" width="80" height="4" fill="#c9a44c"/>
  </svg>`;
}

function render(width, out) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: [oswald], loadSystemFonts: false }
  });
  fs.writeFileSync(out, r.render().asPng());
  console.log('wrote', out);
}

fs.mkdirSync('public', { recursive: true });
render(512, 'public/icon-512.png');
render(192, 'public/icon-192.png');
render(180, 'public/apple-touch-icon.png');

for (const f of ['index.html', 'manifest.json', 'sw.js']) {
  fs.copyFileSync(f, 'public/' + f);
  console.log('copied', f);
}
console.log('build done');

#!/usr/bin/env node
// 按 index.html / main.js 里实际用到的字重新生成 fonts/*.woff2。
//
//   npm install --no-save subset-font
//   node tools/subset-fonts.js <放着 Noto 源字体的目录>
//
// 源字体（github.com/notofonts/noto-cjk）：
//   NotoSansCJKsc-Regular.otf  -> fonts/sans-400.woff2   全页用字
//   NotoSansCJKsc-Bold.otf     -> fonts/sans-700.woff2   只含加粗处用字
//   NotoSerifCJKsc-Bold.otf    -> fonts/serif-700.woff2  只含标题用字
// fonts/mono-400.woff2 只有拉丁字符，不用重做。

const fs = require("fs");
const path = require("path");
const subsetFont = require("subset-font");

const root = path.resolve(__dirname, "..");
const srcDir = process.argv[2];
if (!srcDir) {
  console.error("用法: node tools/subset-fonts.js <源字体目录>");
  process.exit(1);
}

const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "main.js"), "utf8");
const body = html.slice(html.indexOf("<body")).replace(/<script[\s\S]*?<\/script>/g, "");
const strip = (s) => s.replace(/<[^>]+>/g, "");
const jsText = (js.match(/"[^"]*[^\x00-\x7f][^"]*"/g) || []).join("");

// 全页文字，加上 main.js 里会写进页面的中文提示。
const allText = ASCII + strip(body) + jsText;

// 用到粗体（Kai Serif 700 / Kai Sans 700）的地方：标题、strong，以及下面这些 class。
// 在 styles.css 里给别的元素加了衬线或粗体，要同步加到这里。
const BOLD_CLASSES = ["brand", "headline", "contact-mail", "btn-primary"];
let boldText = ASCII;
for (const m of body.matchAll(/<(h[1-4]|strong|b)\b[^>]*>([\s\S]*?)<\/\1>/g)) boldText += strip(m[2]);
for (const m of body.matchAll(/<(\w+)\b[^>]*\bclass="([^"]*)"[^>]*>/g)) {
  if (!m[2].split(/\s+/).some((c) => BOLD_CLASSES.includes(c))) continue;
  const start = m.index + m[0].length;
  const end = body.indexOf("</" + m[1] + ">", start);
  if (end > start) boldText += strip(body.slice(start, end));
}

const uniq = (s) => Array.from(new Set(Array.from(s.replace(/\s/g, " ")))).join("");

const JOBS = [
  { src: "NotoSansCJKsc-Regular.otf", out: "sans-400.woff2", family: "Kai Sans", style: "Regular", text: uniq(allText) },
  { src: "NotoSansCJKsc-Bold.otf", out: "sans-700.woff2", family: "Kai Sans", style: "Bold", text: uniq(boldText) },
  { src: "NotoSerifCJKsc-Bold.otf", out: "serif-700.woff2", family: "Kai Serif", style: "Bold", text: uniq(boldText) },
];

// ---- sfnt 读写：只为了把 name 表换成改名后的版本（OFL 再分发时不沿用原名） ----

function readTables(buf) {
  const n = buf.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < n; i++) {
    const r = 12 + i * 16;
    const offset = buf.readUInt32BE(r + 8);
    const length = buf.readUInt32BE(r + 12);
    tables.push({ tag: buf.toString("latin1", r, r + 4), data: buf.subarray(offset, offset + length) });
  }
  return { flavor: buf.subarray(0, 4), tables };
}

function checksum(data) {
  let sum = 0;
  const padded = data.length % 4 ? Buffer.concat([data, Buffer.alloc(4 - (data.length % 4))]) : data;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
}

function writeTables({ flavor, tables }) {
  tables = tables.slice().sort((a, b) => (a.tag < b.tag ? -1 : 1));
  const n = tables.length;
  const pow = 2 ** Math.floor(Math.log2(n));
  const header = Buffer.alloc(12 + n * 16);
  flavor.copy(header, 0);
  header.writeUInt16BE(n, 4);
  header.writeUInt16BE(pow * 16, 6);
  header.writeUInt16BE(Math.log2(pow), 8);
  header.writeUInt16BE(n * 16 - pow * 16, 10);
  const chunks = [header];
  let offset = header.length;
  let headAt = -1;
  tables.forEach((t, i) => {
    let data = t.data;
    if (t.tag === "head") {
      data = Buffer.from(data);
      data.writeUInt32BE(0, 8);
      headAt = offset;
    }
    const r = 12 + i * 16;
    header.write(t.tag, r, "latin1");
    header.writeUInt32BE(checksum(data), r + 4);
    header.writeUInt32BE(offset, r + 8);
    header.writeUInt32BE(data.length, r + 12);
    const pad = (4 - (data.length % 4)) % 4;
    chunks.push(data, Buffer.alloc(pad));
    offset += data.length + pad;
  });
  const out = Buffer.concat(chunks);
  if (headAt >= 0) out.writeUInt32BE((0xb1b0afba - checksum(out)) >>> 0, headAt + 8);
  return out;
}

function readName(data, id) {
  const count = data.readUInt16BE(2);
  const strings = data.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    if (data.readUInt16BE(r) === 3 && data.readUInt16BE(r + 4) === 0x409 && data.readUInt16BE(r + 6) === id) {
      const raw = Buffer.from(data.subarray(strings + data.readUInt16BE(r + 10), strings + data.readUInt16BE(r + 10) + data.readUInt16BE(r + 8)));
      return raw.swap16().toString("utf16le");
    }
  }
  return "";
}

function buildName(records) {
  const ids = Object.keys(records).map(Number).sort((a, b) => a - b);
  const head = Buffer.alloc(6 + ids.length * 12);
  head.writeUInt16BE(ids.length, 2);
  head.writeUInt16BE(head.length, 4);
  const strs = [];
  let offset = 0;
  ids.forEach((id, i) => {
    const s = Buffer.from(records[id], "utf16le").swap16();
    const r = 6 + i * 12;
    head.writeUInt16BE(3, r);
    head.writeUInt16BE(1, r + 2);
    head.writeUInt16BE(0x409, r + 4);
    head.writeUInt16BE(id, r + 6);
    head.writeUInt16BE(s.length, r + 8);
    head.writeUInt16BE(offset, r + 10);
    strs.push(s);
    offset += s.length;
  });
  return Buffer.concat([head, ...strs]);
}

function rename(buf, family, style) {
  const font = readTables(buf);
  const name = font.tables.find((t) => t.tag === "name");
  const ps = family.replace(/\s/g, "") + "-" + style;
  name.data = buildName({
    0: readName(name.data, 0),
    1: family,
    2: style,
    3: ps,
    4: style === "Regular" ? family : family + " " + style,
    5: readName(name.data, 5),
    6: ps,
  });
  return writeTables(font);
}

(async () => {
  for (const job of JOBS) {
    const src = rename(fs.readFileSync(path.join(srcDir, job.src)), job.family, job.style);
    const out = await subsetFont(src, job.text, { targetFormat: "woff2", noLayoutClosure: true });
    fs.writeFileSync(path.join(root, "fonts", job.out), out);
    console.log(job.out.padEnd(16), String(Array.from(job.text).length).padStart(4) + " 字", (out.length / 1024).toFixed(1) + " KB");
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

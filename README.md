# 王凯 · UE 客户端简历

线上地址：[https://wangk0221.github.io/](https://wangk0221.github.io/)

单页静态页面，直接改 `index.html` 和 `styles.css`，不用构建。

## 本地预览

在这个目录执行：

```bash
python -m http.server 8000
```

浏览器打开 http://127.0.0.1:8000 。

## 改内容

都在 `index.html`：

- `#work` 工作经历
- `#projects` 项目
- `#skills` 技能
- `#education` 教育
- `#contact` 联系方式

邮箱和电话在三个地方：`<head>` 里的 JSON-LD、首屏（`.hero`）和联系区（`#contact`），其中邮箱还写在按钮的 `mailto:` 和 `data-copy` 里。改的时候全文搜一遍旧值再替换。主色在 `styles.css` 的 `--gold`。

提交并推到 `main` 后，GitHub Pages 会更新线上页面。

字体是 Noto CJK / Noto Sans Mono 的子集，按 SIL Open Font License 1.1 再分发，名字改成了 Kai Sans / Kai Serif / Kai Mono。许可证在 `fonts/OFL.txt`。字体只包含页面用到的字，改了文案之后要重新做子集，否则新字会回退成系统字体（见下面「重做字体子集」）。

## 重做字体子集

改了 `index.html` 的文案后执行一次。需要 Node，以及 [noto-cjk](https://github.com/notofonts/noto-cjk) 里的三个源字体：`NotoSansCJKsc-Regular.otf`、`NotoSansCJKsc-Bold.otf`、`NotoSerifCJKsc-Bold.otf`，放在同一个目录下。

```bash
npm install --no-save subset-font
node tools/subset-fonts.js <源字体目录>
```

常规字重包含全页用字；两个粗体只包含标题、`<strong>` 和少数几个 class 里的字，清单在 `tools/subset-fonts.js` 的 `BOLD_CLASSES`。在 `styles.css` 里给别的元素加了粗体或衬线，要同步加进去。

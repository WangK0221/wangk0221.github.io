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

邮箱和电话在页头、工作经历和页尾各有一处，改的时候三处一起改。主色在 `styles.css` 的 `--gold`。

提交并推到 `main` 后，GitHub Pages 会更新线上页面。

字体是 Noto CJK / Noto Sans Mono 的子集，按 SIL Open Font License 1.1 再分发，名字改成了 Kai Sans / Kai Serif / Kai Mono。许可证在 `fonts/OFL.txt`。页面里没有的字会用系统字体补上。

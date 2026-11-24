# 王凯 · UE 客户端简历站

单页静态简历，没有构建步骤。把这个目录推到 GitHub，打开 Pages 就能访问。

内容对应 2026 年 11 月的简历：工作经历、项目、技能、教育和联系方式。已上线项目链到 Steam 商店页。

## 本地预览

在这个目录执行：

```bash
python3 -m http.server 8000
```

浏览器打开 http://127.0.0.1:8000 。

## 部署到 GitHub Pages

仓库需要是公开的，别人才能打开页面。

1. 在 GitHub 新建仓库，把本目录的文件推上去。`main` 分支即可。
2. 打开仓库的 **Settings → Pages**。
3. **Build and deployment** 选 **Deploy from a branch**。
4. Branch 选 `main`，Folder 选 **`/ (root)`**，保存。
5. 等一两分钟。地址是 `https://<用户名>.github.io/<仓库名>/`。

如果希望地址是 `https://<用户名>.github.io/`，仓库名要刚好叫 `<用户名>.github.io`，同样从 `main` 的根目录发布。

以后改 `index.html`，提交并推送，Pages 会自己更新。

浏览器里也可以直接打印，或另存为 PDF。打印样式会去掉导航和按钮。

## 改内容

都在 `index.html`：

- `#work` 工作经历
- `#projects` 项目
- `#skills` 技能
- `#education` 教育
- `#contact` 联系方式

电话和邮箱在页面顶部、工作经历和页尾各出现一次，改的时候三处一起改。主色在 `styles.css` 的 `--gold`。

页面字体是 Noto CJK / Noto Sans Mono 的子集，按 SIL Open Font License 1.1 再分发，字体名改成了 Kai Sans / Kai Serif / Kai Mono，避免占用 Noto 这个保留名。许可证在 `fonts/OFL.txt`。新增生僻字时，系统字体会自动补上那个字。

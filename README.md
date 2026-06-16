# Ziki's Task Board v7 - Work / Life / Calendar / Note

这版加了：
- 顶部 Work / Life / Calendar / Note 四个入口
- Calendar：内置 2026 荷兰和中国节假日
- Calendar：可以自己创建 event，并同步到 Supabase
- Note：可以写备忘录 / 灵感 / 笔记，并同步到 Supabase
- Refresh 按钮
- 原来的 Work / Life Todo 继续保留

## 使用步骤

1. 先去 Supabase SQL Editor 跑 `setup_events_notes.sql`
2. 打开 `config.js`
3. 把 `PASTE_YOUR_PUBLISHABLE_KEY_HERE` 换成你的 Supabase Publishable key
4. 上传这些文件到 GitHub 仓库根目录：
   - index.html
   - style.css
   - script.js
   - config.js
   - README.md

`setup_events_notes.sql` 不需要上传到 GitHub，它只是给 Supabase 跑一次。

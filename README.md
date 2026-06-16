# Ziki's Task Board v5 - Supabase Sync

这版已经改成 Supabase 云同步。

## 使用步骤

1. 打开 `config.js`
2. 把 `PASTE_YOUR_PUBLISHABLE_KEY_HERE` 换成 Supabase 的 Publishable key
3. 确认 `SUPABASE_URL` 是你的 Project URL，不要带 `/rest/v1/`
4. 上传这 5 个文件到 GitHub 仓库根目录：
   - index.html
   - style.css
   - script.js
   - config.js
   - README.md

## 注意

不要把 Secret key 放进前端代码。只用 Publishable key。

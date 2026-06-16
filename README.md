# Ziki's Task Board v9

修正：
- 修复点击 Calendar / Note 时 Work Todo 页面仍然显示的问题
- Work / Life 保持原来的 Todo 页面
- Calendar 是独立页面，不会再挤在 Work 页面下面
- Note 是独立页面，不会再挤在 Work 页面下面
- Work / Life / Calendar / Note 四个按钮统一成之前的 pill 按钮样式
- Refresh 改成小图标按钮
- Calendar 参考 Google Calendar：月份视图 + 右侧 day agenda + 自己新增 event
- Note 参考 Apple Notes：左侧编辑区 + 右侧 notes 列表

## 必须先做

在 Supabase SQL Editor 里跑一次：

setup_events_notes.sql

## 上传 GitHub

上传这 5 个文件覆盖原来的：

- index.html
- style.css
- script.js
- config.js
- README.md

不要上传 setup_events_notes.sql 到 GitHub。

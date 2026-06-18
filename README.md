# Ziki's Task Board v18

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


## PIN

这版加了 PIN 锁屏。

在 `config.js` 里改：

```js
const APP_PIN = "0819";
```

换成你自己的 PIN。

注意：这是前端 PIN，只能防止别人随手打开页面看到内容，不是真正的安全登录。因为 GitHub 仓库是 public，懂技术的人仍然能查看前端代码。真隐私要做 Supabase Auth + 用户级 RLS。


## v18

修复手机端 Calendar：不再把 agenda 卡片盖在日期格子上，日历格子更小，右侧 agenda 在手机上改成下方独立区域。


## v18

- 已把章鱼图标接进网站
- 支持 iPhone 添加到主屏幕时显示自定义图标
- 新增 apple-touch-icon、favicon 和 site.webmanifest
- 这版压缩包里不再包含 setup_events_notes.sql（网站仓库不需要它）


## v18

- 顶部标题左侧新增章鱼图标
- `Ziki's Task Board` 标题整体右移，与图标并排显示
- 保留之前的 iPhone 主屏幕图标配置


## v18

- 修复手机端 Calendar 里日期输入框超出卡片边界的问题
- 删除 Note 页面里那句 Apple Notes 玩笑文案


## v18

- 更强制地修复 iPhone PWA 里 Calendar 日期输入框撑出卡片的问题
- 再次移除 Note 页面里的 Apple Notes 玩笑文案


## v18

- 手机和桌面任务卡片变矮，间距变小，一屏能显示更多任务
- Task / Event / Note 增加编辑按钮 ✎
- Calendar 支持左右滑动切换月份，也保留左右箭头


## v18

- To Do 输入区压缩：标题一行，日期 / 优先级 / 添加按钮合并到一行
- 手机端输入框高度和间距缩小，下面能露出更多 task list
- 桌面端也稍微收紧 To Do 卡片内部留白


## v18

- 删除 Task 的 transfer / Work-Life 移动按钮
- Task 编辑从系统 prompt 改成底部弹出编辑卡片
- 编辑卡片可直接修改标题、日期、优先级

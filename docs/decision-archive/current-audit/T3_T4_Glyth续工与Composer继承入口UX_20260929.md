# T3/T4 Glyth 续工与 Composer 继承入口 UX

## 改动

上一版 2×2 大卡撤掉了。续工展开态现在用一条紧凑的 4 项图标选择带（续用 / 精选 / 空白 / 分支）；选中项下方即时说明历史与引用继承，工作目录单独成条。选项只预览，保留原确认提交、capability 限制、只读引用快照、同 operation 重试和核对/恢复入口。

引用仅在“精选上下文新建”下显示预览，沿用 Composer reference strip 的真实缩略图/名称呈现。接收者身份仍由现有 Glyth/Composer 显示；没有添加接收者切换或其他新能力。

## 依据与复用核对

- T7 原卡 `E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T7\GEN2_T7_Glyth续工_AgentAdapter源码蓝图施工正本_V2_20260911.md` §9、§12.3：区分续用、精选上下文新建、空白新建、完整历史分支；历史、上下文、工作目录是独立轴。
- Figma 采用清单同路径 `references\figma-master\LCOS_Figma_前端施工完整采用清单_20260913.md`：5352:1958 是 Oreo prompt + 引用 + 图标动作（352×240）；5352:1969 继承选择是横向 317×40；5352:1965 是继承材料，5352:1974 工作目录独立选择，5352:1980 才是确认操作。近场基准截图见 `_cabin\06_Figma\LCOS_Figma_全设计包_20260913\key-frames\5246-59.png`。这支持紧凑选择与分离确认，不支持重复大卡。
- `E:\OS开发\LCOS_GEN2\huabu\apps\web\src\lcos\professional\ConversationWorkViewBody.tsx` 有图标续工按钮，但点击即执行；不能照搬到要求先预览再确认的 Composer。`continuation-attach-vertical` worktree handoff 主要是请求/回执接线，没有匹配的预览控件。

## 文件与实测

- 改动：`huabu/apps/web/src/lcos/professional/ConversationContinuationControls.tsx`、`huabu/apps/web/src/lcos/ui/professional/conversation-continuation.css`；既有测试 helper 调整为 radio 选择，没有增加测试场景。
- Playwright 用 Chromium 加载并挂载生产 `ConversationContinuationControls` 模块，实点“精选”；确认继承说明、独立工作目录和引用缩略图预览显示正确。截图：`E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\output\playwright\continuation-inheritance-nearfield.png`。
- 页面未连接 `/api/workspace` 和 LCOS Core；截图中的能力区真实呈现“能力未确认 / 提交禁用”，因此没有声称服务端能力或提交链已验收。缩略图是浏览器预览 fixture。
- 定向 `ConversationContinuationControls.test.tsx`：9 项通过；定向 ESLint 通过。无 Core 变更、未 commit/merge/push。

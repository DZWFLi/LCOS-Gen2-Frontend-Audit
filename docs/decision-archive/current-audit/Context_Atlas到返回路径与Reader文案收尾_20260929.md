# Context 路径与 Reader 文案收尾（2026-09-29）

## 结论
Context Atlas → 子现场 → Temporal Rail → 返回来源的现有用户链已接入真实 owner；本轮确认不应把 Atlas/Temporal Rail 编成假时间或集合字段。补了 Atlas 入口的展开状态反馈，Reader/Assembly 中文状态文案收尾。

## 变更
- `huabu/apps/web/src/lcos/surfaces/context/ContextWorksite.tsx`：Atlas 按钮现在暴露 `aria-expanded`，开合标签同步变化；入口可反向切换，读屏能感知状态。
- `huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx`：集合结果数作为 polite live status，搜索/载入后数量变化可被辅助技术获知。
- `huabu/apps/web/src/lcos/surfaces/context/ContextWorksite.navigation.test.tsx`：复用现有导航测试验证打开后状态为 expanded。
- Reader/Assembly 已做中文可读类型与版本状态、保留溯源 tooltip、单版本图片不显示空工具栏；补齐单版本图片测试预期。

## 代码链与边界
Atlas 的集合进入使用 `workspaceTargetsForItem` → `beginChildWorksiteNavigation`；Child Context 才挂载 `TemporalRail`，它从现有 temporal index 生成目标并发 `requestLocate`。Child 返回按钮在 `LcosProjectShell`，`returnToSourceWorksite` 恢复来源 canvas、viewport 和可恢复 selection。Atlas 外点收起与 Escape 已由 `LightCurtainDismissPlane`、`useCloseOnEscape` 处理。无需重复造导航状态。

Warehouse 当前没有正式的事情/时间组织字段，`contextAtlasSemantics.ts` 明确不以 kind/updatedAt 伪造分组；Atlas 集合拆分/合并/删除等仍依赖正式 Core 成员 owner，本轮不补造能力。Temporal Rail 的真实密度/多目标聚焦与 return continuity 尚需 T6 同会话浏览器核验；本轮没有声称视觉或 Core 闭环已验收。

## 验证
- `npx vitest run src/lcos/surfaces/context/ContextWorksite.navigation.test.tsx`：5/5 passed。
- `npx vitest run src/lcos/professional/ArtifactReaderBody.test.tsx`：25/25 passed。
- Reader/Assembly 无本轮浏览器截图；Context 等待 T6 复用会话验证。

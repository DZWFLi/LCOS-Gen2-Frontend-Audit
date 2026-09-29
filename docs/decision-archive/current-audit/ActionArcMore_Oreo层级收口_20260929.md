# Action Arc More 收口（2026-09-29）

## 结论
More 已改为贴节点右上侧的紧凑二列动作弹层；尺寸、强调色各自打开相邻小 inspector，不再把输入框/色板塞进一张高滚动表单。真实位置截图尚未补拍，本次以原实页审计图定位问题、用定向组件测试和 TS 校验交付。

## 依据与改动
- 实页问题依据：`GUI全量对齐_20260926/全量实页审计_20260929/24-action-arc-more-after-fix.png`；Arc 锚点被漂移到屏幕上缘，More 中混排了全组命令和编辑控件。
- `huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx`：More 使用 `right-start`、8px 间距锚定节点右上侧；232px 紧凑二列首层只列命令。尺寸字段与色板分离到二级 inspector，保留现有 `setNodeGeometry` / `updateNodeData` 写入逻辑、草稿确认和返回路径；按节点切换、关闭 More、Esc 都清理子层状态。
- `huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx`：为现有浮层 owner 补 `right-start` 放置类型，继续使用其 flip/shift 边界策略，不新建定位 owner。
- `huabu/apps/web/src/lcos/navigation/GlythStateActions.test.tsx`：覆盖首层不出现尺寸输入/色板、右侧锚位、尺寸/强调色二级入口。

Portal 边界：现有 `buildLcosNodeCommands` 没有 Portal 创建命令；`canvasRef` 只提供真实目标存在时的“查看入口目标”。本次保留该正式打开动作，不造本地创建/投递 inspector 或假回执。

## 验证
- `pnpm exec vitest run src/lcos/navigation/GlythStateActions.test.tsx`：25/25 通过。
- `pnpm exec tsc --noEmit --pretty false`：修正 inspector discriminant 类型后通过。
- 未操作浏览器、未伪称新截图或实页验收。更窄窗口下 More 与 inspector 翻转后的实际可读性仍待同会话实测。

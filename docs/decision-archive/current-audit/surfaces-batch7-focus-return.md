# 特殊视图第七批：把“返回”接回原位置

日期：2026-09-27。

结论：修复手牌近预览、Workflow/Main手牌和Context光幕关闭后键盘焦点落回BODY的问题。现在第一次Esc回原卡，第二次Esc收回手牌并回原入口；不改业务状态、不抢新输入框的焦点。

## 依据与真实问题

- 本地Figma `unification/specs/workflow.json`：5392:4889明确“单击卡轻预览…Esc返回恢复”；5392:4890规定减少动态效果保留稳定网格和焦点边；5392:4922要求selected与focus分开。
- T5原件 `LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md` §9.3，第609–622行：单击light preview，双击/Enter resolve真实region/child。此次只恢复预览层与现场入口间连续性，不重解释进入语义。
- 真实页面修前，点击“返回手牌”、近预览按钮上按Esc、第二次Esc收手牌、关闭Context光幕，四项document.activeElement均为BODY。用户下一个Tab会从页面其它入口重新走。

## 改了什么

- `ui/workflow/WorkflowTaskCardView.tsx`：现有article持有ref；关闭近预览时focus原卡，preventScroll，不重建卡片，不让第一个Esc穿透关闭整层。
- `ui/workflow/WorkflowHandView.tsx`、`ui/context/ContextAtlasView.tsx`：使用纯DOM焦点恢复hook。
- `ui/spatial/useLayerReturnFocus.ts`：沿Huabu Modal的原生opener模式；没有新overlay/window/store。仅当焦点还在该层或BODY且原入口仍连在DOM时恢复；新输入框/新路由已持有焦点时不抢回。
- `ui/spatial/useLayerReturnFocus.test.tsx`：6项新行为测试。

## 验证

- 6项新测试覆盖原入口、直接卸载、原入口已删除、新输入框接管、按钮返回原卡、Esc返回后可空格再开预览。
- 连同既有Stage6Presentation与Workflow caller测试：3文件18项通过。
- 全前端tsc通过；本批5个文件eslint通过。
- 真实fixture浏览器：1440×1000普通动效、390×1000减少动效，各6步，共12状态，0pageerror。未创建或执行Run、会话或Core材料。
- Main入口真实名称“呼出工作流手牌”，Workflow为“打开工作流手牌”；两者均返回各自原按钮。

## 证据文件

- 脚本：[surfaces-focus-return-qa.cjs](./surfaces-focus-return-qa.cjs)
- 修前：[surfaces-focus-before.json](./surfaces-focus-before.json)
- 宽屏：[surfaces-focus-after-normal.json](./surfaces-focus-after-normal.json)
- 窄屏：[surfaces-focus-after-390.json](./surfaces-focus-after-390.json)
- 窄屏原卡焦点：[截图](./surfaces-focus-after-390-card-escape.png)
- 其它截图同目录 `surfaces-focus-after-normal-*` / `surfaces-focus-after-390-*`。

## 边界与后续

S11双组窗口保持未施工。ConversationWorkViewBody/Glyth/Core未改。导航代理正在单独处理child实际加载失败仍navigate/过早收起的问题；本批不声称该问题已解决。

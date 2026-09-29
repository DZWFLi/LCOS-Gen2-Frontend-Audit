# Glyth 会话导入、关联与持久上下文验收（2026-09-29）

## 结论

Glyth 首次接入链已真实走通：手动导入 → 人工确认关联 → Assembly 材料拖入 Glyth → 页面重载后回读持久会话上下文。会话/内容由现有 Local Core 接口创建与保存；未调用 provider，也未改 Core。当前页显示会话上下文含「项目定位」，Core work-view 将其列为 `bound`。

## 前端改动

- [`apps/web-gen2/src/backend/conversations.ts`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/backend/conversations.ts)：增加会话列表、手动导入、精确 ID 关联的 typed client；修复重复导入。
- [`ConversationWorkViewBody.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.tsx)：在既有 Glyth Conversation Work View 内增加轻量“关联资料会话”入口和可展开手动导入。创建后仅选中，不自动关联；需要再次点击“确认关联”。导入要求当前真实 workspace/scope 与非空消息。切换项目或目标时使用 abort signal 防止迟到写入；关联成功沿用现有 collaboration projection refresh。
- [`ConversationWorkViewBody.test.tsx`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ConversationWorkViewBody.test.tsx)：补齐 scope/workspace 与导入 mock，修正 option 元素类型并覆盖“导入后单独确认关联”。
- [`t4-professional-windows.test.ts`](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/test/t4-professional-windows.test.ts)：覆盖 Core typed client 的真实契约字段。

身份语义遵循 T3 Receiver：Glyth 持久关联使用 canonical `conversationSessionId`；Composer 的单次草稿引用仍是独立路径，没有混用。

## 真实页面操作证据

在 `http://127.0.0.1:5286/projects/lcos-gen2-dev/main` 的 e2e fixture 上，通过 GUI 完成：

1. 打开「承接会话（e2e fixture）」→「关联资料会话」→展开手动导入。
2. 以当前现场真实 scope/workspace 导入标题「项目定位·材料关联实测」及一条来自项目定位材料的用户消息。导入后界面明确提示还需单独确认；随后点击「确认关联」。
3. 打开 Assembly，从真实材料「项目定位」拖到 Glyth。本体出现「已保存到会话上下文 · 1 项 / 已加入」回执。
4. 刷新页面，再打开 Glyth。Conversation Work View 仍显示导入会话标题；「会话上下文」区域保留「项目定位」。

截图：
- 投放成功及逐项回执：[page-2026-09-29T13-03-59-474Z.png](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/.playwright-cli/page-2026-09-29T13-03-59-474Z.png)
- 重载后 Glyth 会话/上下文回读：[page-2026-09-29T13-05-32-007Z.png](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/.playwright-cli/page-2026-09-29T13-05-32-007Z.png)

Network/Core 证据：
- `POST /conversations/import-manual` → `201 Created`。
- `POST /connected-conversations/conversation-e2e-fixture/link-session` → `200 OK`。
- 材料投放 `POST /assembly/apply` → `200 OK`，请求体 target 为 `{kind:"conversation", id:"conversation-e2e-fixture"}`，source 为 `view-positioning`。
- 重载后 `GET /connected-conversations/conversation-e2e-fixture/work-view` 返回 `conversationSessionId=conversation-416c35758d644d86dd7d184c`；`reach.items` 含 `artifact-positioning / view-positioning`，tier 为 `bound`，reason 为 `explicit conversation_context binding`。
- 手动导入生成真实 Core session `conversation-416c35758d644d86dd7d184c`，来源 `manual`，一条消息；artifact/view ID 分别为 `artifact-text-37ba4699-8ce1-4291-b50c-b1cc594f7a33` / `view-text-37ba4699-8ce1-4291-b50c-b1cc594f7a33`。

### 操作侧效应说明

一次较早的拖拽尝试还出现过 `assembly/apply` 指向 `{kind:"main"}`（12:58:55，source `view-positioning`）的成功请求，随后才完成本次指向 Glyth 的正式投放。该主画布投放来自真实材料、未触及 provider；因无法仅凭该回执确认其画布节点归属和是否为既有操作，本批未擅自删除。需主审在同一 fixture 决定是否保留或回收这一额外 Main 投放。

## 验证与边界

- `ConversationWorkViewBody.test.tsx`：5/5 通过。
- `apps/web-gen2/test/t4-professional-windows.test.ts`：23/23 通过。
- `apps/web-gen2` 与 `huabu/apps/web` 各自 `tsc --noEmit` 通过。以上均为组件/契约和类型验证；端到端用户链的证据另由上述真实浏览器操作、HTTP 响应、Core 回读及截图提供。
- 当前回读确认 `bound`，不代表执行 owner 已可发送；界面仍如实显示“当前会话没有已绑定且可发送的续工 owner”。
- Portal / Railway 由另一工作项负责，本批未修改其文件。
- 未提交、未推送。

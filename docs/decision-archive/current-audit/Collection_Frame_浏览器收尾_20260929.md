# Collection 展开/收起与成员同步验证（2026-09-29）

## 结论

真实浏览器已覆盖新建集合、正式成员写入/回读、展开与折叠、Frame 内拖动持久化、重载及成员移除。发现并修复：从展开 Collection 移除仍挂在其 Huabu Frame 下的成员时，只删了 canonical membership，旧 `parentId` 仍让它留在 Collection 空间里。现在只有 Core 回执 `removed` 后，才对匹配且直属当前 Collection Frame 的投影调用 Huabu `moveNodeOutOfFrame`；语义 membership 与空间 parent 分属各自 owner。

## 实测链路

- Atlas 通过正式 UI 新建 `UX 验收集 0929`；Core 返回 canonical Collection `collection-d74591ea-ae14-437b-92ab-f906cff00041`，Main 投影随后出现。
- 先前真实 Canvas drop 将 `artifact-rules` 加入集合；Core GET 与集合面板的成员数/标签一致。T1 原卡对 expanded left-drop / collapsed left-drop / right-drag 规定不同的空间行为，right-drag 保留 source placement。
- Collection 展开生成 Huabu Frame，并挂入 `lcosCollectionId` 与 `lcosCollectionNodeId`。折叠使用 Huabu session-only `collapsedFrameIds`：保留 canonical Collection 外观，隐藏成员和 Frame 边界；展开恢复。该状态未改写持久几何。
- 对 Frame 子节点做真实拖动后，从 `GET /api/canvas/:canvasId` 读回 position；重载后 membership 与 Frame 拓扑仍存在，默认展开，符合 T1 的 session-only 折叠要求。
- UI 移除测试：移除画外成员后，Core 列表与卡片即时从 2 个变为 1；移除 Frame 内的 `artifact-rules` 时，Core 成员数为 0，修复后的 Huabu 回读 `parentId: null`。移出命令保留绝对空间位置。为稳定复现第二个场景，测试夹具通过 canonical Core members endpoint 写入真实 membership，然后经 UI 点击删除；没写 store，也没有模拟成功回执。
- 对 Collection 自身的错误 Drop 有真实 422 和局部结果提示 `A Collection cannot contain itself.`，没有假加入。
- 截图：![展开态空集合与成员移除后的画布](/E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/output/playwright/collection-empty-after-remove.png)

## 代码变更

- `huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx`：成功移除成员后，匹配同实体的 Huabu 投影；仅当其 `parentId` 是当前 Collection Frame 时调用现有 `moveNodeOutOfFrame`，再刷新 Core binding。
- 本批已有增量实现：`Canvas.tsx` 消费 Collection 折叠投影；`LcosSpeciesBodies.tsx` 以图标操作按钮切换 collapse，不再误调用 dissolve/unframe；`canvasStore.ts`、`uiIntent.ts`、`resolveGroupSelectionIntoFrame.ts` 传递 Collection 身份并标记 Frame；`context-spatial.css` 修正 Atlas 新建/关闭按钮重叠。

## 验证边界

- `pnpm --filter @huabu/web typecheck` 未通过，但仅报告既有其他区域问题：`apps/web-gen2/src/backend/conversations.ts` 重复导入 `ConversationIdentityChainV1`，`ConversationWorkViewBody.test.tsx` 将 `Element` 访问 `.disabled`。这两处不在本批文件。Vite 实际热编译并运行了当前修改。
- 浏览器全链路没有重新跑大测试套。右键创建 Collection 的要求没有在 T1/T2 原卡找到；T1 只要求“Selection → Create Collection → expand”，Atlas 正式入口满足该步骤。当前测试主要用 Atlas，新建 Collection 的专用右键菜单未宣称存在。
- 测试用 `lcos-gen2-dev` 画布做了本地交互；末尾把测试节点拖回非集合位置，Core 回读其 `parentId: null`，position 约为 `x=-76.34,y=-193`（测试过程中有意执行拖动/移出）。

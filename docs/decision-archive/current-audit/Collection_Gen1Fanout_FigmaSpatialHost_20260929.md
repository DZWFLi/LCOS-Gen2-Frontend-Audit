# Collection Gen1 展开、Figma 形态与框选建集收尾（2026-09-29）

结论：Collection 展开现在复用 Gen1 的真实尺寸向右分列与避障规则，再交给 Huabu 的 `SET_NODE_GEOMETRY` / Frame command 执行空间托管。Frame 只作无视觉边框的底层成员宿主，Collection folder 本体仍留在 Main；折叠隐藏成员并保留 Frame 子位置，之后展开可重现。空集改为 Figma/Gen1 的叠片文件夹轮廓，没有模拟成员封面或内部占位文案。框选 toolbar 的真实 LCOS caller 继续复用 Huabu 默认工具条；创建集合现在使用起始现场快照和逐项 canonical receipt。

## 变更

- `huabu/apps/web/src/lcos/nodes/collectionExpandLayout.ts`：移植 donor `collectionExpandLayout.ts` 的布局语义：真实节点宽高、右侧列、列宽/间距、向下避开现有对象；布局是纯 geometry，不写成员 truth。新增成员加入已展开集合时放在不覆盖现有项的位置，折叠期间加入的投影在下次展开并入宿主。
- `huabu/apps/web/src/handler/canvasCommand/uiIntent.ts`、`resolvers/resolveGroupSelectionIntoFrame.ts`、`store/canvasStore.ts`：让现有 `GROUP_SELECTION_INTO_FRAME` 一次命令接收预排位置，执行顺序为 geometry → frame creation → parentage。单个真实成员也可建立集合宿主。Frame 选择结束后回到 Collection 节点，折叠时文件夹本体不会一起隐藏。
- `huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx`：Collection Frame 只包含实际成员投影；成员从 Core membership 与当前 canvas binding 相交解析。折叠时保留 Huabu Frame 与几何；再展开时将新成员接回，不把 `parentId` 当 membership。
- `huabu/apps/web/src/components/Nodes/frame/FrameNode.tsx`、`lcos/nodes/collection-node.css`：识别 `lcosCollectionId` 的 Frame 隐去 Frame 边线、标题、工具条和 resize，把它留作低层空间 owner。用户看见 Figma Collection 本体。
- `huabu/apps/web/src/lcos/ui/context/ContextCollectionFace.tsx`、`ui/context/context-spatial.css`、`nodes/collection-node.css`：空集保留两张无内容、无文字的装饰背片加 folder face；只有真实来源才进入媒体封面。Gen1 实际 CollectionObject 也在无成员时绘出空的 stack sheets；不造“暂无预览”、纸张内容或 member label。
- `huabu/apps/web/src/lcos/navigation/LcosMultiSelectToolbar.tsx`：删除未使用的 `referenceProjectId`；canonical 选择按 `type:id` 去重。创建时冻结起始 project/canvas/surface，逐条检查 Core receipt 状态及回执对象。若中途换现场，结果照常归属起始项目，但不触发新现场 camera/locate；部分失败明确回执并关闭创建表单，避免重复点击建出第二个集合。
- `huabu/apps/web/src/lcos/LcosHostOverlay.tsx`：Canonical Drop 成员回执确认后，只有同项目、同画布、真实 Frame 已展开且来源 projection 没有另一个空间 parent 时，才在 Frame 中安置成员；其余只写 membership，不擅自搬动空间对象。

## 对照与验证

Gen1 对照：`_cabin/05_donor源码/GitHub原件/LCOS-local-creativeOS/apps/web/src/features/canvas/collectionExpandLayout.ts`；`ProjectCanvas.tsx` 维护 `expandedCollectionScopeIds`、成员与 motion 并传给 CanvasCard；`CanvasNodeVisual.tsx:319` 的 `CollectionObject` 展示 folder face、stack sheet 和成员数；同仓 `src/interaction-system.css:2465–2540` 定义三张叠片、folder face/tab。donor `collectionExpandLayout.ts` 本身按尺寸分列并避障；它没有考古文档曾提到的 2–9 阈值，故实现未引入该阈值。

T1 对照：主卡 `LCOS_T1_C1-S3_Formal_Exact_Source_Construction_Plan_20260906.md §4 C2-03、§14 BA-02`；Patch `T1_Patched_Construction_Cards_20260905.md §C03`。canonical membership 仍由 Core 所有，Huabu Frame 保存本地投影几何，折叠只隐藏成员、留在原 Canvas；collection body 不会被塞进不可见 Frame。

Figma 对照：本地主画布 Collection `5333:96`；当前实现使用批准的现有 `ContextCollectionFace` folder back/tab/pocket，空态仅为空背片形态，不显示伪造内容。相关导出：`E:\Codex 项目\OS开发\exports\LCOS_Figma_全设计包_20260913\key-frames\5333-96.png`。

定向验证：4 个相关 Vitest 文件 / 19 tests 全通过，包括布局真实尺寸避障、三列扩展、collection 一成员 Frame command 顺序与 host 回选、生产框选 toolbar 可达、collection body状态。`git diff --check` 通过。全 web TypeScript 检查仍失败于两个现存 `ContextAtlasStage*.test.ts` 测试夹具把 `scope` 传给 `WarehouseEntityKindV1` 的不兼容类型，与本批文件无关。

## 本轮真实动作验收（2026-09-29）

主审释放共享浏览器后，我先尝试连接 Edge 扩展，但 `tabs.list()` 与 `tabs.new()` 均因浏览器请求失败而未建立页面控制。按主审指示切到应用内浏览器时，运行环境返回 `Browser is not available: iab`。没有导航、reload 或操作其他人的页面。

随后只运行隔离 e2e fixture 的真实鼠标框选/多选/组拖测试：

```text
pnpm exec playwright test e2e/canvas-mouse.spec.ts -g "box-select two nodes then dragging one moves the whole group"
```

该测试在启动浏览器前失败：Playwright 缺少 `chromium_headless_shell-1243` 可执行文件；因此这不是产品断言失败，且没有执行任何页面动作。按“iab 不可用则停止浏览器”的指示，没有另起 Edge、下载浏览器或改走开发库。历史的 19 个 Vitest 定向用例仍通过，但它们不替代真实鼠标/持久链验收。

本轮没有新 GUI 截图。完整链条 **框选→LCOS 工具条→选择创建集合→canonical 成员回执/持久化→同画布定位→展开 fanout/避障→拖动→折叠保留 folder→再展开恢复→重载** 仍属未实测；不得将此前静态组件/单测或已有旧图当成通过证据。下一次具备应用内浏览器或已安装 e2e 浏览器后，再用隔离 fixture 完整验收。

改动保持未提交、未推送。

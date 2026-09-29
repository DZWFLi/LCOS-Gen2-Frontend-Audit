# LCOS 框选工具条与 Collection 主画布呈现修正（2026-09-29）

## 结果

修正了两个容易误判成“功能消失/集合造型错”的点：集合入口现在归真实 production host `LcosMultiSelectToolbar`，依旧复用 Huabu 多选几何与选区；Collection 主画布继续使用 Figma Collection 文件夹身体，不把 expanded host 的 Huabu Frame 边线当成集合造型。未新增另一个 selection、membership 或 layout owner。

## 代码路径与改动

- `huabu/apps/web/src/lcos/useLcosCanvasProps.tsx` 注入 `<LcosMultiSelectToolbar />`；`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx` 用 `hostExtension.multiSelectionToolbar` 覆盖普通 Huabu toolbar。故动作owner应放 LCOS wrapper。`LcosMultiSelectToolbar.tsx` 现在负责依据当前 project/binding 身份呈现“将所选对象创建为集合”入口：身份水合中按钮保留但禁用并解释；全部选中项均具有可写 canonical identity 时可执行。调用现有 `CoreCollectionClient.create/addMember`，逐项反馈成员回执状态，随后请求 projection refresh、等待真实投影并定位。对齐/散布、尺寸、受保护对象的 move/delete policy 仍由复用的 Huabu toolbar 承担。
- `FloatingToolbars/MultiSelectToolbar.tsx` 只新增 `selectionAction` slot，不承载 LCOS Core 语义或第二份实现。
- `CollectionNodePresentation.tsx` 仍把 Figma `ContextCollectionView` 文件夹脸作为 Main presentation；无计数时显示身份“集合”，只在 Core 明确给出 0 时显示“空集合”。`ContextCollectionView.tsx` 对未指定组织类别采用已有的 Figma folder glyph `context-thing.svg`，不再用 Layers3 代替，也不伪称“按事情组织”。

## 原件依据

- `READ_SOURCE`：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T1\LCOS_T1_PhaseC1_Step2A_Collection_VisibleHost_ExactSource_Plan_20260906.md` §0、§1.1、§1.2、§13；明确 Collection canonical identity/membership 与 spatial host/Frame 分离，选中集创建后可第一次 fan-out，但不得把全部远端成员搬动。入口场景 `Selection → Create Collection → expand`。
- `VISUAL_SOURCE`：本地 Figma `5333:96`（CollectionSurface / ContextCollection），导出 `E:\Codex 项目\OS开发\exports\LCOS_Figma_全设计包_20260913\key-frames\5333-96.png`；当前 Main body 复用磨砂文件夹层次（后壳、tab、半透明 pocket、图标/身份），没有封面数据时不画模拟预览。Expanded Frame 是空间托管mechanic，不替代文件夹身体。
- `ADOPTED`：Huabu `CanvasHostExtension.multiSelectionToolbar` → `LcosMultiSelectToolbar` → `MultiSelectToolbar` generic geometry/action slot；Core canonical `create/addMember` 和现有 host projection/locate。没有引入新状态库或节点成员模拟。
- `RETIRED`：没有移除旧的 Huabu selection、alignment、distribution、geometry 或 Frame primitive；未将 `parentId` 作为 Collection membership。

## 验证与未完成

- `VERIFIED`：定向 Vitest `LcosMultiSelectToolbar.test.tsx` + `LcosSpeciesBodies.test.tsx`：2 个文件、16 个断言通过；新增测试覆盖生产 host 多选且 refs 齐备时创建集合入口可见/可用；Main Collection body 测试覆盖文件夹面、未知组织不显示技术占位。之前的 `git diff --check` 通过。
- 全仓 Web `tsc --noEmit` 本轮终止于非本改动的既有 `components/Panels/Canvas/edges/connectionViewEdges.test.ts:26`（测试样本联合类型没有 `className`）；本轮改动文件没有出现在错误中。
- `VERIFIED` 屏幕截图：未取得。尝试连接共享 Edge 时 `tabs.list()` 连续返回连接失败；按浏览器说明停止，不切换到无关浏览器或伪造截图。已看过本地原 Figma 导出；`Collection_empty_folder_LOD_20260929.png` 是本修正前的浏览器旧图，不能作为 after 证据。真实框选/多选动作、创建成员回读、展开/折叠回程以及当前视觉 after 仍需浏览器验收。
- `UNRESOLVED`：T1 spatial expand/collapse 仍依赖既有 Frame/fold owner；本批没自动扩展，也不应在创建 membership 后重排未指定集合中的全部成员。创建后这里只定位 canonical Collection 节点，由用户显式触发当前空间的展开动作。

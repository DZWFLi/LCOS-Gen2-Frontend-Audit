# 集合远中景身份图标修复 · 20260927

结论：修复了集合在 mark / summary 密度下连身份图标一起消失的问题。不是新集合实现；普通集合生产、成员托管与跨视图完整性仍未完成。

## 原因与修复

`collection-node.css` 原规则 `.lcos-context-collection-copy span` 原意是隐藏次级说明，却同时命中了包着文件夹 / 时间 / 未指定集合身份 SVG 的 `.lcos-context-collection-icon`。远中景因此只剩标题，弱化了物种辨识。

现改为 `.lcos-context-collection-copy > div > span`，只隐藏次级说明；工作流对应规则收窄为直接子元素。四档保持同一个对象、原有尺寸、既有缩放与 owner。

## 六字段回传

- **READ_SOURCE**：`E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/core_plans/LCOS_Gen2_节点呈现宪法_完整版_20260902.md` §1、§1.5、§4；同包 `references/original_route_cards/T1/LCOS_T1_PhaseC1_Step2A_Collection_VisibleHost_ExactSource_Plan_20260906.md` §0、§1（空间 host 与成员 owner 边界）；`LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md` LOD/compact identity 索引。当前 `CollectionNodePresentation.tsx`、`ContextCollectionFace.tsx`、`WorkflowCollectionFace.tsx` 及 CSS。
- **ADOPTED**：保留现有 Figma 派生 Collection Face 与集合身份 SVG；收窄本地 CSS selector → `LcosSpeciesBodies` 的 collection 分支 → `CollectionNodePresentation` → `ContextCollectionView/Face`。没有新增 donor 或存储，不改原生 Huabu 几何。
- **VISUAL_SOURCE**：Figma 文件 `nFUdroLvI5qJZuYTW8h2rF`，13 页集合变体 `5333:96`；本地确切参考 `E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_Figma_全设计包_20260913/prior-exports/集合手牌_Figma_20260911/lcos-collection-forms.png` 已查看。
- **RETIRED**：退掉 broad descendant span 隐藏；没有删除原来 API、交互入口或业务状态。
- **VERIFIED**：Playwright 独立浏览器 `node-lod-proof`，在隔离开发项目上临时挂载真实生产 `CollectionNodePresentation`，四档实际 DOM/CSS 渲染。修前 mark/summary 的 iconDisplay 为 none，working/reading 为 grid；修后四档均为 grid、宽 21px，mark/summary 次级文字仍为 none，working/reading 为 block。已检查截图。此证据是生产组件的浏览器验证，不冒称普通集合 producer 的整机验收。
- **UNRESOLVED**：普通集合生产与 canonical 成员托管仍在 `collection-owner-investigation.md`；实际集合有真实预览时的多素材图面、极远景屏幕字号和完整跨视图 motion 仍需整机素材与录像验收。本次无预览时诚实展示“暂无预览”，未拿宣传图补数据。

## 文件与证据

- 改动：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/collection-node.css`
- 截图：[集合四档真实组件渲染](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/collection-lod-identity-fixed.png)
- 本批仅 CSS 选择器修复；以实际浏览器显示验证，没有为字符串镜像新增单测。
- 没有修改 Core、Glyth、shell、Figma，也没有 commit / push。
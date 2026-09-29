# S20 集合生产命令入口 · 原件与 API 缺口核实

结论：**当前不能只在 Atlas 补入口就完成合并、拆分、删除集合壳。** 原件明确要求成员 owner 先返回方案/能力，再执行真实 mutation；当前生产只具备集合摘要读取、打开现场和定位。缺的是动作真值接口，不是图标。按本轮边界，本项只回证据，**没有改生产代码或增加假按钮**。

## READ_SOURCE

- [T5 最细专项原卡](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T5/LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md:314)：§6.5 Collection mutation 列 merge/split/extract/move/delete collection shell，并明确先 proposal/preview，再真实 mutation。
- [三视图统一裁决](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T5/LCOS_三视图交互合同_RhineDonor统一裁决_20260910.md:171)：§5.1 增加 rename；179 行明确删除 collection 不删除真实 canonical objects。
- [T3 全范围原件](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T3/LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md:2046)：§15，T3 gesture / T6 membership / T1 presentation；不能自行推断 collapsed target 的空间结果。
- [T3 更细 seam 卡](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T3/LCOS_Gen2_T3_C1-S2_Source_Engineering_Seam_Skeleton_20260906.md:1348)：§13，目标 domain owner 注入 canReceive/resolve/commit，T3 不写 canonical mutation。
- 已检索 V6 T3/T4/T5 指引：没有提供能覆盖该专项的 merge/split/delete-shell 生产接口；没有用它们的通用规划替代上述细卡。
- [现有 WarehouseItemV1](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/contracts/src/assembly.ts:48)：只有 identity/title/preview/usage 等摘要，没有成员列表、组织语义、allowedActions、proposal 或 command receipt。
- [仓库投影来源](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/warehouse-service.ts:184)：context/workflow/collection 由 `repository.getScopes(projectId)` 派生；scene 则来自 Workspace。
- [Atlas 实际 caller](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/surfaces/context/ContextAtlasStage.tsx:39)：CoreAssemblyClient + useWarehouseBrowse → ContextCollectionView；动作只调用 onEnterSurface/focusOnCanvas。
- [实体 HTTP 路由](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/routes/entity.ts) 与 [CoreProjectClient](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/backend/projects.ts)：Workspace 的读取/更新不等于集合壳 mutation；不存在可直接调用的集合命令客户端。
- [通用 MutationOperation](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/packages/contracts/src/index.ts:658)：有 upsert_scope，**无 delete_scope、merge_collection、split_collection 或 delete_collection_shell**。通用图写入不提供本需求需要的成员保留策略。

## ADOPTED

本批只核实可复用范围，未引入实现：

| 现有能力 | 可保留用途 | 不能冒充 |
|---|---|---|
| CoreAssemblyClient.queryWarehouse → ContextAtlasStage | 集合摘要、分页、搜索 | 集合 allowedActions 或成员操作 |
| workspaceTargetsForItem → onEnterSurface | 进入已有真实现场 | 集合合并/拆分 |
| ContextCollectionView / Arc 更多视觉规则 | 未来真实命令入口的外观 | 无 owner 回执的成功状态 |
| Gen1 `layoutExpandedCollectionMembers` | 已知成员的展开几何 | canonical membership 操作 |

Gen1 donor 已读：[collectionExpandLayout.ts](E:/TRAE项目/LCOS0.1收口/_cabin/05_donor源码/GitHub原件/LCOS-local-creativeOS/apps/web/src/features/canvas/collectionExpandLayout.ts)。函数注释明确它只处理 Presentation geometry，不能用它反向推断成员。

两条特别容易误接的现有 API：

- [context-proposals](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/routes/context-proposals.ts:35) 只接受 baseContextVersion/addViewIds/removeViewIds/targetViewId/reason，操作 ActiveContext；没有集合 shell 身份或合并/拆分计划。
- [workbench/merge](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/routes/workbench.ts:7) 是临时工作现场并回 Root；[WorkbenchService.merge](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/local-core/src/workbench-service.ts:25) 会复制符合当前 revision 条件的引用到 Root，再删除临时 benchViews。它**不是任意两集合合并**。直接借用会改变目标并删除原临时视图，不能满足 Atlas 的壳/成员语义。

## VISUAL_SOURCE

- 页 13 集合多形态基础：5333:96；最终 Atlas 主稿：5388:24294。
- [最终 Atlas 采用说明](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/unification/specs/atlas.json)：**5392:4931** 明确“拆/合/删除从 Arc 更多进入真实动作，删除集合不删成员”。
- 同一说明的 **5392:4933** 明确 T2 表征导航 / T1 集合投影 / T6 成员事实，Exact source caller = **NEEDS_SOURCE_BINDING**。
- 因此最终视觉已明确入口位置，但没有替 Core 冻结 command 请求/回执，更没有 allowedActions 生产者。

## RETIRED

无。本批未删除现有打开、定位、搜索、分页、错误重试或画布返回行为，也未把已有可用动作替换为占位。未改 Core/store/S11/Shell/Stage。

## VERIFIED

- 在隔离 5286 fixture 打开实际项目 → Context → 集合总览，读取真实 GET warehouse 响应。
- 生产 Atlas 的按钮只有打开/选择现场或定位；无合并、拆分、删除壳入口。0 pageerror。
- 本次真实 fixture 的 6 个 Atlas 条目均为 `scene`（Workspace 投影），没有可执行的 canonical collection 样本；每行均无 allowedActions。该字段不是遗漏渲染，而是当前读取契约未提供。这里仅证明真实 Atlas 当前入口与响应，不能冒充集合 mutation 的运行验证。
- [实际截图](surfaces-S20-atlas-current.png)
- [按钮、响应字段与请求记录](surfaces-S20-command-gap.json)
- [可复跑只读脚本](surfaces-S20-command-gap-qa.cjs)
- 未执行集合、ActiveContext 或 Workbench mutation。没有代码改动，故本批不以新增单测数量冒充功能完成。

## UNRESOLVED

**P1 / S20 / NEEDS_SOURCE_BINDING：当前没有同时具备完整原件与现有 API 的 merge/split/delete-shell 子项。**

最小待补事实如下；这是缺项清单，不是本批新定接口：

1. 同一集合的可执行动作与理由由哪个现有 owner 返回，精确读取路径是什么。
2. 合并的源/目标、拆分成员分区，以及删除壳后的成员归属，由哪个 proposal/preview 结果确认。
3. delete-shell 对 Workspace、投影、引用、成员的实际影响及保留规则，以及正式 command/receipt。
4. 失败、冲突或结果未知时应重读哪一份 owner 结果，是否可沿同一 operation 重试。

推荐顺序：先让集合成员 owner 提供上述真实能力并复用当前事实存储；随后 UI 只把 allowed 动作接到 Arc 更多及确认预览，成功后重读 warehouse/目标。**不要前端拼通用图操作，更不要拿删除 Artifact、删除 Workspace 或 Workbench merge 顶替。**

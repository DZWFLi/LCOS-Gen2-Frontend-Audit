# Railway：V0 ref 与稳定 Workspace 身份落地判定（2026-09-29）

## 结论

**不能只看 `V0` 名称就判当前 Railway identity 无效。** `ProjectViewRailRefV0.viewId` 在实际落地路径中能精确解析为现存 Workspace/Scope；Workspace 是 Core 持久实体并有稳定 `id` 与稳定 `canvasId`，因此唯一匹配时，前端可安全把它用作这次导航与 Drop 的精确 workspace target。主区后续实现已经接回“显示→进入→Receive Drop”用户链，本修复区也已有对应调用，不需要造第二套 Railway 或协议。

但，**这仍没有证明 `workspaceId` 已被 T6 正式裁定为最终 `worksiteId`**。T2 的正式 blueprint 明确说最终 ref 类型/Worksite identity 未收到 T6 exact export，V0 仅作 legacy compatibility；不自动把 Scope/Collection 物化成长期 Worksite。Railway 新增目的地也不能由前端自造 V0 ref；新增应来自 T6 明确创建/投影的长期 Worksite 或现有的显式 order owner。

## 身份判断：两层都成立才安全

1. **现存具体现场地址**：Core `Workspace.id` 是持久身份；`Workspace.canvasId` 是该现场的空间地址，不是长期身份本身。`Workspace` 注释在 `packages/domain/src/index.ts:171-189` 明确其 `canvasId` 为 T2 C2-1D 的 stable canvas binding。
2. **Rail ref 的历史物种**：Core 当前仍是 `ProjectViewRailRefV0 { kind, viewId }`，合同在 `packages/contracts/src/index.ts:908-918`；Core order route 在 `apps/local-core/src/routes/projects.ts:185, 220-267` 读写它并以 CAS 保存。`kind=scene` 时 `viewId` 可直接对到 Workspace.id；`context/workflow` 可经 Scope 唯一绑定解析为 Workspace，但仅在存在一个有 Surface 映射的目标时可达。它为已存在现场提供精确地址，不能单凭这一点声称 V0 ontology 已迁移为最终 `surface_root | worksite | receiver_conversation`。

原卡 `T2/LCOS_Gen2_T2_C2-1C_Railway_ExactSourceBlueprint_20260907.md` 的证据：

- §§1、3–5：最终物种为 Surface root / 显式 Long-term Worksite / Receiver；旧 `scene|collection|context|workflow` 是 legacy ontology；current `scene` “backed by Workspace state”；route 过滤 Workspace/Scope id；order 继续复用 durable/CAS owner。
- §§7–10：截至 2026-09-07 未恢复 T6 exact Worksite/ref/mapping export；不得让 T2 猜测 `scene=Worksite`、`context=Context root`、`workflow=Workflow root`、`collection=Worksite`；legacy ref 要被解析为 canonical / compatibility / ineligible。
- §§83–85、§124–126：新 Worksite 首次出现在 canonical projection 时不得 write-on-read；只由 T6 创建事务或明确 reorder 写入；Collection/Scope 不自动加入；生命周期归 Core/T6。
- 后续蓝图 `T4/LCOS_Gen2_T2_C2-4A_RailwayReceive_ExactSourceBlueprint_20260907.md` §4.1 给出的 `RailwayDestinationRefV1` 是 **T6 plan**，写明 `surface_root | worksite(worksiteId) | receiver_conversation`，且禁止 label/DOM id/coordinate/nodeId/canvasId 替代稳定 target key。它不是目前合同包里的已导出 `railway.ts` 合同。

随后存在的有效生产增量 `E:\OS开发\LCOS_GEN2\docs\handoffs\GEN2_T2_T5_Railway具体目的地进入_20260915.md` 与 `GEN2_Wave4_Railway_CanonicalReceive_20260920.md` 将可解析的当前 Core `orderedRefs` 通过 Workspace/Scope graph 投影，接到 `workspaceId` 到达、Receive target 和现有 canonical Assembly apply。它们证明的是这条**当前兼容落地**；没有添加 T6 V1 identity/service。故不能忽略它们，也不能将它们扩写成 V1 migration 完成。

## 当前主区与修复区的实际路径

| 动作 | 主区 `E:\OS开发\LCOS_GEN2` | 修复区 `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926` | 判定 |
|---|---|---|---|
| 读取/显示 order | `apps/web-gen2/src/backend/railway.ts` → `CoreRailwayClient.read()`；`huabu/apps/web/src/lcos/shell/LcosRailway.tsx` 读 Core order + ProjectGraph；`railwayProjection.ts` 按 ref 投影 | 同路径已经有调用；投影补充读取 `canvasId` 作预览地址 | 已接现存 ref；空 ref 保持空，不造 root items |
| 具体 Workspace target | `railwayProjection.ts`：`scene` ref 的 `viewId` 精确匹配 Workspace.id；`context/workflow` 用唯一匹配的 scope→Workspace；多匹配 unavailable | 相同 resolver；`projectRailwaySnapshot` 将已匹配 Workspace 的 `canvasId` 附到 VM | 唯一目标可达；`canvasId` 只作预览/到达地址，不写作 canonical id |
| 进入工作现场 | 主区 `LcosGlobalHud.tsx` 调 `ensureWorkspaceCanvas` 与 Huabu `switchCanvas`，再进入 `?workspaceId=` route；`docs/handoffs/GEN2_T2_T5_Railway具体目的地进入_20260915.md` 记录已接 unique `workspaceId` | 修复区 `LcosGlobalHud.tsx:39-55` 复用 `useLcosWorksiteNav.switchWorksite(surface,{canvasId,workspaceId})`，不直接拥有第二个 Canvas switch | 已有可调用生产路径；唯一目标、canvas 可用才可进入；失败留在当前现场并反馈 |
| Receive Drop | 主区 `LcosRailway.tsx` target 注册为 `railway-receive`，传 `{kind:'workspace', id: workspaceId}` 与原始 `destinationRef`；既有 `DropIntentResolver` → `CoreAssemblyClient.apply()` | 修复区 `LcosRailway.tsx:235-251` 已注册同类 target；`dropIntentResolver.ts:187` 传目的地 ref；`LcosHostOverlay.tsx:257` 调现有 Assembly apply | 已接到精确工作区目标的 source-stay semantic receive；不是物理 move，也不是 V1 canonical-ref完成证据。缺失/歧义/不可用目的地应禁用，不能落背景 |
| 新增 Railway item | Core 已有同一个 `/view-rail-order` CAS `PUT`；Rail UI 现有更多菜单是 reorder/remove，未发现从 UI 创建新长期 Worksite 或 add arbitrary ref 的生产 caller | 同样没有 add-long-term-worksite owner | **前端不可安全自创新增**：只能由 T6 显式 Worksite 创建/投影，或沿已存在明确添加命令。禁止“读到 workspace 就写 `{kind:'scene'}`”规避 ontology/migration。 |

## 最小未闭合接口差异

- Core 已有长期 Workspace：`Workspace.id + projectId + scopeId + canvasId`；可供到达/预览/Drop 的现有消费者使用。
- T2 原卡/旧 C2-4A 蓝图期待稳定 Railway destination ref（`worksiteId`）和 T6 resolver eligibility；当前代码仍只导出 `ProjectViewRailRefV0`，且 `view-rail-order` route 没有 canonical V1 resolver/service 或 V0 migration preview/confirm。
- 如果 T6 最终裁定 `worksiteId` 与 `Workspace.id` 是同一 identity，最小补齐点应由 T6 在现有 contracts/Core owner 显式导出并由 UI 消费；如果不同，则需要 Core 给出唯一映射。前端不应靠 `workspaceId===worksiteId` 的类型断言自行决定。
- 因此本次不新增“加入 Railway”写入 UI、不引入新 ref 类型、不改 Core。**现有唯一 Workspace 的显示、进入和 Receive Drop 保持启用**；无匹配/多匹配/未分配 Surface/canvas 缺失继续按已存在原因显示不可用。新长期 Worksite 的出现与入 Rail 交由正式创建/投影 owner。

## 连线分路与验证收尾

连线呈现仍只筛选 ReactFlow 的渲染投影，不改 canonical edge/store；依据与 TapNow bundle 的可复用行为见 [Canvas连线TapNow近场呈现_20260929.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/Canvas连线TapNow近场呈现_20260929.md)。

- `connectionViewEdges.test.ts` 定向 Vitest：2 tests passed；连同 `railwayProjection.test.ts` 一起重跑：2 files / 9 tests passed。
- 修复区 `pnpm --filter @huabu/web typecheck` 当前唯一诊断在并行源码 `src/lcos/nodes/LcosSpeciesBodies.tsx:419`：`readonly CanvasNodeGeometryUpdate[]` 赋给 mutable `CanvasNodeGeometryUpdate[]`（TS4104）。当前 typecheck 没有报告 `connectionViewEdges.test.ts` 类型错误；本项不属于连线 helper/test，因此没有改它。
- 本轮没有浏览器验证，不把纯函数测试当 Railway/Canvas 视觉实测；没有修改源代码、Core、Portal/Collection 或窗口文件。

## 原件与当前源码

- 原卡：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T2\LCOS_Gen2_T2_C2-1C_Railway_ExactSourceBlueprint_20260907.md`。
- 后续跨 T 合同：`E:\OS开发\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\docs\handoffs\LCOS_Gen2_T2_C2-4A_RailwayReceive_ExactSourceBlueprint_20260907.md`（若当前副本不存在，以 `_cabin/03_审计包与返工/LCOS_Gen2_UX施工卡与Figma审计包_20260915_ef4c214/03_HANDOFF/` 同名原件为准）。
- 后续到达：`E:\OS开发\LCOS_GEN2\docs\handoffs\GEN2_T2_T5_Railway具体目的地进入_20260915.md`。
- 后续 Receive：`E:\OS开发\LCOS_GEN2\docs\handoffs\GEN2_Wave4_Railway_CanonicalReceive_20260920.md`。

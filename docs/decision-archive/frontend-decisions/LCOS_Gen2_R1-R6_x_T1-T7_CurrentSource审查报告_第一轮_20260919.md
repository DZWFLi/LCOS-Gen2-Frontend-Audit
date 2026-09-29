# LCOS Gen2 · R1–R6 × T1–T7 Current Source 审查报告（第一轮）

日期：2026-09-19  
分支：`frontend-reconstruction-v2`  
Current HEAD：`faf32919dec81bbd4e5458323b3b784c449843f7`

## 0. 证据纪律

本报告同时使用：
1. 用户上传的《T1–T7 × R1–R6 交叉核查表》
2. 用户上传的《R 系列施工卡核查表》
3. Project Library 原始施工卡/后续覆盖裁决
4. GitHub current exact source

判定只使用：
`VERIFIED_PASS / VERIFIED_PARTIAL / VERIFIED_GAP / VERIFIED_VIOLATION / SUPERSEDED / BLOCKED_BY_OWNER / NOT_YET_VERIFIED`

不再把“测试绿”“组件存在”“接口已定义”写成 CLOSED。

## 1. Executive Summary

### 三独立 Worksite
Current `surfacePort.ts` 明确要求 Main / Context / Workflow 使用不同 `canvasId`；`SurfaceRegistry.assertDistinctCanvas()` 会 fail-close identity collision。`useLcosWorksite.ts` 按 Core workspace 的 `preferredSurface` 建不同 workspace→canvas 映射，`useLcosWorksiteNav.ts` 切换时执行真实 `switchCanvas(canvasId)`。

因此：
- distinct canvas identity = VERIFIED_PASS
- 不是“一个 Canvas 切三种 mode”
- viewport/camera isolation = VERIFIED_PASS（Huabu 使用 `huabu.viewport.<canvasId>`）
- history isolation = VERIFIED_PASS（`CanvasHistoryRegistry` keyed by canvasId）
- selection continuity = VERIFIED_GAP / 未证明
- layout continuity = NOT_YET_VERIFIED

### LOD Owner
Gen2 正式四档 owner 存在：
`apps/web-gen2/src/presentation/nodePresentation.ts`
→ `mark | summary | working | reading`

但 Huabu 原生二档 LOD 仍在 production：
`semanticZoom.ts` / `useNodeLOD.ts`
→ `full | minimal`
`NodeWrapper.tsx` 无条件执行 `useNodeLOD()` 并挂 `SemanticPlaceholder`，同时又向 LCOS body 发布 `LcosNodePresentationProvider`。

当前判定：
`DOUBLE_LOD_OWNER_RISK = VERIFIED_VIOLATION/RISK`
需要继续核 host body 被替换时 native minimal 是否仍实际影响 LCOS body。

### Capability unknown
T7 contract 已正确落地：
`CapabilityValueV1 = true | false | 'unknown'`
Adapter 对无 authoritative probe 的字段默认 `unknown`。
`collaboration-capability-resolver.ts` 把 unknown 投影成产品 affordance `false + 人话原因`，并没有篡改 provider truth。

判定：
- Provider capability unknown discipline = VERIFIED_PASS
- Product fail-closed boolean projection = ACCEPTABLE

## 2. ColorPin

### many-to-many
Current `currentSurfaceMemberships[]` 支持同 target 多颜色。
`VERIFIED_PASS`

### stale project guard
snapshot/assign/remove 有 generation guard。
`VERIFIED_PASS`

### target types
Contract 支持：
`view | entity | surface`

但 current UI producer 只对 `surfaceTargetRef` assign。
entity/view producer 缺失。

`VERIFIED_GAP`

卡要求的：
“canonical Artifact Pin survives multiple Worksite occurrences”
目前未实现。

### owner/topology
Current production ColorPin palette/assign/remove/member/travel 全部在：
`LcosNavigatorIsland.tsx`

原 T2 C2-2C/C2-3B 明确禁止把 ColorPin 塞进 Navigator。

`VERIFIED_VIOLATION`

## 3. Focus / Where

Search 与 Focus 仍分离：
- Cmd/Ctrl+F = Project Search
- F = Focus/Where

`VERIFIED_PASS`

Current 有独立 `focusOccurrence.ts`，不是直接拿 Search locationRefs 当唯一 truth。

但尚未证明：
- occurrence 全集确实来自 ProjectionBinding
- >5 occurrence
- Main + Worksite A + Worksite B 三 occurrence
- archived occurrence
- remote navigation re-resolve
- 11 状态完整

因此：
`Focus full card compliance = NOT_YET_VERIFIED`

## 4. Locator / safeRect

Current Locator target geometry 来自真实 ReactFlow internal node + viewport，这部分正确。

但 safeRect 仍自己维护：
- fixed `HUD_INSETS`
- `document.querySelector('[data-lcos-professional-stage]')`
- `getBoundingClientRect()`

而 T4 已有唯一：
`ProfessionalWindowStage → windowEnvironment.safeRect / occupiedRects`

原卡明确：
`DOM safeRect = FORBIDDEN`

且 `[data-lcos-professional-stage]` 本身是 `fixed inset-0` 全屏 wrapper，并不代表 docked region。

判定：
`VERIFIED_VIOLATION`

应改为：
`LcosCanvasCommands → useLcosShellStore(windowEnvironment)`，统一消费 T4 environment。

## 5. Arrival

Repo 有：
- `locatorState.ts`
- `arrivalState.ts`
- `locatorGeometry.ts`

但 production `LcosCanvasCommands` 只真正消费 `computeLocatorGeometry`。

当前实际链：
`locateRequest → focusNodesOnCanvas(~800ms) → fixed 900ms timeout → consumeLocate`

未真正接入：
`travelling → arriving → settled`

因此：
- camera locate = VERIFIED_PASS
- locator cue = VERIFIED_PARTIAL
- arrival state = VERIFIED_GAP

此前 “R6-8 Locator/Camera/Arrival PASS” 不成立。

## 6. Spatial Navigator

原卡要求：
- `LcosSpatialNavigator.tsx`
- `hostExtension.spatialNavigator`
- ReactFlow MiniMap
- ZoomOut / ZoomValue / ZoomIn / Fit / Lock / Grid

Current source：
- 无 `LcosSpatialNavigator`
- 无真实 spatialNavigator hostExtension consumer
- `chromeMode='lcos'` 反而隐藏 stock Controls/MiniMap
- 只有 `LcosCameraControls`

因此：
`VERIFIED_GAP`

此前自拟 `R6-9 Spatial Navigator` 测试与卡上的 Spatial Navigator 不是同一能力，只能降级为 regression evidence。

## 7. Camera invariant

13 张卡重复要求：
Professional Window open/float/dock/undock/resize/split/close/restore 时 camera transform 完全不变。

Current `ProfessionalWindowStage` publish environment 时未直接调用 `fitView/setViewport/zoomTo`，这是好迹象。

但 current R2 E2E 没完整证明：
before / open / resize / dock / close 五点 camera byte-equal。

因此：
`formal camera invariant evidence = VERIFIED_GAP`

不能写 PASS。

## 8. Professional Window topology 冲突裁决

旧 T4 C1-2 要求 Dockview 8.2.0 exact + Protected Canvas +复杂 topology。
2026-09-15 后续 F2 明确改为：
- ProfessionalWindowStage 唯一 topology + geometry producer
- lcosShellStore 只存 ephemeral topology intent
- 本轮不先上复杂 layout tree
- floating / docked-right / group / resize

因此“没用 Dockview = 违反”这个旧判定应改为：
`SUPERSEDED_BY_F2_20260915`

但 `ungroupWindowRegion` 是否超范围仍需单独判断。

## 9. R5 Runtime

Current 已确认：
- `ContinuationProviderAdapterV1` 存在
- `provider-capability.ts` 存在
- `HuabuAgentletContinuationAdapterV1` 存在
- unknown default 已落实
- send 仍缺真实 prompt owner wiring
- native full-history fork 保持 unknown/unsupported
- attachContext 无 authoritative RPC
- outcome_unknown 分类存在

更新判定：
- T7 contracts/adapter skeleton = VERIFIED_PASS
- provider capability unknown discipline = VERIFIED_PASS
- real send = BLOCKED_BY_OWNER
- native fork = honest unsupported/unknown
- attachContext = honest unsupported

但以下仍未闭：
- R5.0 Source/Capability Matrix
- T6 C1-2 ProjectEvent canonical route
- cursor recovery
- full browser/runtime E2E

所以 R5 full Done 仍不能写 CLOSED。

## 10. R3 Railway

Current 有：
- Core canonical order
- CAS
- 409 refresh
- canonical version
- target registry

但原卡 residual仍未关闭：
- C2-1C 22 Done Gates
- +N canonical total count
- Peek geometry
- Receiver bottom
- More
- Receive state presentation
- RailwayReceiveCommandV1
- outcome_unknown mapping

且 `LcosRailway.conflictLock.test.ts` 若被当成交互 closure，违反原卡禁止 static gate 冒充交互验证。

当前：
`Railway base = VERIFIED_PARTIAL`
`R3 full card compliance = VERIFIED_GAP`

## 11. Temporal

`TemporalRail.tsx` 源码自己明确：
- 当前为诚实空态骨架
- 暂无时间记录
- producer 后续接入

因此：
- Temporal honest skeleton = VERIFIED_PASS
- Temporal real capability = VERIFIED_GAP / BLOCKED_BY_OWNER

“Temporal 无卡”这一说法必须撤回；卡真实存在。

## 12. 当前最危险的 verified 问题

P0 / owner-canonical：
1. ColorPin 放进 Navigator → VERIFIED_VIOLATION
2. ColorPin 只做 surface target，entity/view 缺失 → VERIFIED_GAP
3. Locator safeRect 绕过 T4 environment → VERIFIED_VIOLATION
4. Arrival reducer未接 production → VERIFIED_GAP
5. Spatial Navigator absent → VERIFIED_GAP
6. Huabu binary LOD 与 Gen2 four-level LOD 同时 active → DOUBLE_LOD_OWNER_RISK

P1 / continuity：
7. per-surface selection continuity未证明
8. camera invariant无五点正式证据
9. Focus full ProjectionBinding occurrence matrix未闭
10. Railway receive/receiver/more 未闭
11. Temporal canonical producer gap
12. R5 ProjectEvent/recovery/browser closure未核

## 13. 对两份上传核查表的修正

已被 current source证实正确：
- ColorPin 位于 Navigator → 违反
- ColorPin entity target缺 → 缺
- Spatial Navigator未做 → 缺
- Locator safeRect并行派生 → 违反
- Arrival无真实 consumer → 部分/缺
- Temporal只有骨架 → real capability缺
- 三视图不是单 Canvas mode → 核心 identity符合
- capability unknown contract → 正确落地

需要修正：
- “Professional Window 未用 Dockview = 违反” → 应改 `SUPERSEDED`
- “三独立 Worksite = 未核” → 细分为 canvas/camera/history PASS，selection/layout继续核
- “capability unknown = 未核” → provider snapshot层已 PASS

## 14. 仍需继续核验

1. R1 Semantic Drop full support matrix
2. pointer owner / Shift multi-select / Composer Reference empty-start
3. Professional Window camera 5-point invariant
4. viewportResizePolicy exact landing
5. nine safeRect consumers
6. Railway 22 Done Gates
7. RailwayReceiveCommandV1 / receive service
8. Focus occurrence是否完整来自 ProjectionBinding
9. ProjectSession route identity / Back stack
10. Archive/Restore no old x/y / schema
11. Reader continuity是否应复用 Preview scrollMemory
12. Assembly Round6 P0-A / P1-C
13. ProjectEvent dual route conflict
14. T6 WebSubscriber recovery/cursor rules
15. R5 Source/Capability Matrix + E2E A–O
16. reduced-motion legal final state
17. Rhine motion grammar / Figma mother ledger
18. READ_SOURCE / adoption evidence requirements

## 15. 当前状态建议

暂停使用：
`R1 CLOSED / R2 CLOSED / ... / R6 CLOSED`

改为：
- R1 = AUDIT_REQUIRED
- R2 = AUDIT_REQUIRED
- R3 = PARTIAL
- R4 Reader = PARTIAL_VERIFIED
- R4 Assembly = MOSTLY_VERIFIED + Round6 residual
- R5 = PARTIAL / runtime blockers
- R6 = PARTIAL + verified violations/gaps

这不是回滚代码，而是把“施工状态”和“按卡验收状态”分开。

## 16. 目前最合理的 correction candidates

在剩余原卡核完之前不建议大施工。

已足够确定的修复候选：
1. Locator 改消费 T4 `windowEnvironment`
2. ColorPin 从 Navigator owner 拆回原卡 HUD/Provider topology
3. ColorPin补 entity target路径
4. 统一 LOD owner，明确 Huabu native binary LOD 在 LCOS mode 下的退役/降级关系
5. Spatial Navigator按原卡真实实现
6. Arrival接现有 reducer，不造新状态机

正式下施工令前，继续把剩余 critical 卡核完，避免再次“修完一张卡，又被另一张卡打脸”。

## 17. 最终结论

两份上传核查表不是最终审计结果，但正确暴露了此前最大的方法问题：

R 系列只是施工批次；真正功能要求分散在 T1–T7 原卡与后续覆盖裁决里。

Current source audit 已证明：
- 前面不是全部做歪；
- R4 Assembly大量核心语义确实对；
- 三独立 Worksite核心 identity确实正确；
- capability unknown纪律真正落地；
- 但 R2/R3/R6 仍有多处未闭与明确违卡项；
- ColorPin owner、Locator safeRect、Spatial Navigator、Arrival、双 LOD owner风险，不能再被 CLOSED 标签盖住。

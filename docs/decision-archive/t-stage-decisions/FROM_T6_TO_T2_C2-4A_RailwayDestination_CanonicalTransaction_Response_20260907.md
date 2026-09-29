# FROM T6 TO T2 · C2-4A Railway Receive
# Canonical Destination / Semantic Transaction Response

## BASELINE

```text
LCOS Gen2 construction baseline
= DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a

Huabu mechanical baseline
= microsoft/Huabu@a3c411e1f655191344285141f08c4738fa6015f7
```

本回传依据：

- 请求：`E:/OS开发/LCOS_GEN2/docs/handoffs/TO_T6_C2-4A_RailwayDestination_CanonicalTransaction_Request_20260907.md`；
- T6 current-source map 与 ownership/seam 规划；
- T2 Phase B / S02 Railway 已关闭语义；
- Gen2 main 当前源码；
- Huabu vendored `a3c411e` cross-Space move contract。

状态纪律：

```text
old Rail order persistence + CAS     = CURRENT SOURCE
final Railway ontology/types         = PLAN ONLY
destination resolver                 = PLAN ONLY
canonical Railway receive service    = PLAN ONLY
Huabu physical cross-Space move       = CURRENT SOURCE
T2 presenter/client                   = NOT LANDED
```

本文件冻结 T6 供 T2 消费的 planned contract，不新增数据库、不实施代码、不把 planned signature 冒充 current export。

---

## EXACT FILES

### Current source

| File | Current responsibility | Status |
|---|---|---|
| `packages/contracts/src/index.ts` | `ProjectViewRailKindV0` / `ProjectViewRailRefV0` / `ProjectViewRailOrderV0` | CURRENT SOURCE / LEGACY ONTOLOGY |
| `apps/local-core/src/routes/projects.ts` | GET/PUT `/projects/:projectId/view-rail-order` | CURRENT SOURCE |
| `apps/local-core/src/metadata-repository.ts` | `project_view_rail_order`、GET、CAS save、restart persistence | CURRENT SOURCE |
| `apps/local-core/tests/project-view-rail-order.test.ts` | persistence/CAS/restart/filter baseline | CURRENT SOURCE |
| `packages/contracts/src/receiver.ts` | connected conversation + project receiver binding | CURRENT SOURCE |
| `apps/local-core/src/receiver-runtime-service.ts` | Receiver canonical operations | CURRENT SOURCE |
| `packages/contracts/src/curation-patch.ts` | `MutationChangeItemV1` / `MutationChangeSetV1` | CURRENT SOURCE |
| `apps/local-core/src/mutation-safety-service.ts` | ChangeSet、safe revert/reapply、post-commit event | CURRENT SOURCE substrate |
| `packages/contracts/src/project-events.ts` | `ProjectEventEnvelope` / sequence / origin / receipt | CURRENT SOURCE |
| `huabu/packages/shared/src/types/api/space-move.ts` | physical move request/result/error schema | CURRENT SOURCE |
| `huabu/apps/server/src/modules/canvas/space-move.service.ts` | cross-Space move + compensation | CURRENT SOURCE |
| `huabu/apps/server/src/modules/canvas/space-move-plan.ts` | physical selection expansion/remap plan | CURRENT SOURCE |
| `huabu/apps/server/src/modules/canvas/canvas.route.ts` | POST `/:canvasId/move-selection` | CURRENT SOURCE |
| `huabu/apps/web/src/api/canvas.ts` | `moveCanvasSelection()` client | CURRENT SOURCE |

### Planned exact files

| Action | File | Planned responsibility |
|---|---|---|
| ADD | `packages/contracts/src/railway.ts` | final ontology、destination、eligibility、transaction/result types |
| MODIFY | `packages/contracts/src/index.ts` | export new V1 contract；V0只作 legacy read |
| ADD | `apps/local-core/src/railway-destination-service.ts` | destination resolution / availability |
| ADD | `apps/local-core/src/railway-receive-service.ts` | canonical semantic transaction coordinator |
| MODIFY | `apps/local-core/src/metadata-repository.ts` | reuse existing rail order JSON/CAS；no new table |
| MODIFY | `apps/local-core/src/mutation-safety-service.ts` | Railway membership/order ChangeSet items + revert/reapply |
| MODIFY | `apps/local-core/src/routes/projects.ts` | V1 GET/PUT order and destination/read/receive route wiring |
| ADD | `apps/web-gen2/src/backend/railway.ts` | typed read/order/receive client |
| ADD | `apps/web-gen2/src/presentation/railway.ts` | read-only presenter projection |
| ADD | corresponding Core/Web tests | eligibility/migration/transaction/recovery/presenter |

Planned route naming in this response is a contract proposal, not current source. Exact registration should remain within the existing project route family; no second RailwayStore/router owner。

---

## CANONICAL TYPES

### 1. Stable entity/ref types — PLAN ONLY

Planned file：`packages/contracts/src/railway.ts`

```ts
export type RailwaySurfaceKindV1 = 'main' | 'context' | 'workflow'

export type RailwayCanonicalRefV1 =
  | {
      readonly kind: 'surface_root'
      readonly projectId: string
      readonly surface: RailwaySurfaceKindV1
    }
  | {
      readonly kind: 'worksite'
      readonly projectId: string
      readonly worksiteId: string
    }
  | {
      readonly kind: 'receiver_conversation'
      readonly projectId: string
      readonly connectedConversationId: string
    }

export interface RailwayLegacyRefV1 {
  readonly kind: 'legacy'
  readonly projectId: string
  readonly legacyKind: 'scene' | 'collection' | 'context' | 'workflow' | 'unknown'
  readonly legacyViewId: string
  readonly raw?: Readonly<Record<string, unknown>>
}

export type RailwayStoredRefV1 = RailwayCanonicalRefV1 | RailwayLegacyRefV1

export interface RailwayOrderV1 {
  readonly schemaVersion: 1
  readonly projectId: string
  readonly orderedRefs: readonly RailwayStoredRefV1[]
  readonly version: number
  readonly updatedAt: string
}
```

Rules：

- stable key从 discriminant + canonical ID推导，不另存随机 UI key；
- `surface_root` identity = `projectId + surface`；
- `worksite` identity = `projectId + worksiteId`；
- Receiver identity = `projectId + connectedConversationId`；
- `canvasId`、title、preview、availability是 resolver projection，不是 stored ref identity；
- legacy ref保留原始身份，不能伪装成 canonical ref。

### 2. Destination type — PLAN ONLY

```ts
export type RailwayDestinationRefV1 = RailwayCanonicalRefV1

export type RailwayDestinationUnavailableReasonV1 =
  | 'project_missing'
  | 'entity_missing'
  | 'not_materialized'
  | 'archived'
  | 'source_missing'
  | 'destination_missing'
  | 'receiver_offline'
  | 'receiver_waiting'
  | 'same_destination'
  | 'permission_denied'
  | 'legacy_unresolved'
  | 'physical_transfer_unsupported'

export type RailwayDestinationAvailabilityV1 =
  | { readonly status: 'available' }
  | {
      readonly status: 'unavailable'
      readonly reason: RailwayDestinationUnavailableReasonV1
    }

export interface ResolvedRailwayDestinationV1 {
  readonly schemaVersion: 1
  readonly stableKey: string
  readonly ref: RailwayDestinationRefV1
  readonly projectId: string
  readonly canonicalEntityRef:
    | { readonly entityType: 'project'; readonly entityId: string }
    | { readonly entityType: 'worksite'; readonly entityId: string }
    | { readonly entityType: 'conversation'; readonly entityId: string }
  readonly surface: RailwaySurfaceKindV1
  readonly canvasId: string | null
  readonly home:
    | { readonly kind: 'surface'; readonly surface: RailwaySurfaceKindV1 }
    | { readonly kind: 'worksite'; readonly worksiteId: string }
    | null
  readonly lifecycle: 'active' | 'archived'
  readonly availability: RailwayDestinationAvailabilityV1
  readonly orderable: boolean
  readonly accepts: readonly RailwayReceiveIntentV1[]
}
```

### 3. Railway item read projection — PLAN ONLY

```ts
export interface RailwayItemV1 {
  readonly key: string
  readonly role: 'surface' | 'worksite' | 'receiver' | 'legacy'
  readonly storedRef: RailwayStoredRefV1
  readonly destination: ResolvedRailwayDestinationV1 | null
  readonly title: string
  readonly active: boolean
  readonly orderable: boolean
  readonly migrationState: 'canonical' | 'migratable' | 'legacy_unresolved'
  readonly availability: RailwayDestinationAvailabilityV1
}
```

`RailwayItemV1` 是 Core read projection；T2可再映射成 visual VM，但不得把 VM写回 Core。

---

## RAIL ONTOLOGY

### Canonical item species

1. **Surface Root**
   - Project 的 `main | context | workflow` 一级结构入口；
   - 低于 SurfaceDock 的主切换权重；
   - 不代表三个不同 Project Canvas；
   - 不是 Collection、Scope 或 Workspace clone。
2. **Explicit long-term Worksite**
   - 由用户显式 materialize；
   - stable identity、projectId、name/intent、stable canvasId、durable working-set refs、home/origin、lifecycle；
   - current Workspace源码是迁移 donor，不可整体冒充最终 Worksite。
3. **Receiver / Conversation**
   - identity来自 `ConnectedConversationV1.id`；
   - active receiver来自 `ProjectReceiverBindingV1.activeReceiverId`；
   - conversation child canvas只有已明确 materialize为 nested Worksite时才提供 physical destination；
   - Receiver状态是投影，不复制存储。
4. **Legacy compatibility**
   - 只为读取旧序列化引用；
   - 可显示、解释、迁移或移除；
   - 不可作为新写 ontology。

### Explicitly forbidden automatic Rail items

```text
Collection
Scope
temporary Context block
Search result
transient Work View
Professional Window
temporary preview
Artifact / ArtifactView merely opened
Workflow node or Context node merely visible
Assembly source selection
Huabu node/frame by geometry alone
```

只有 explicit materialization 或已存在 canonical Surface/Worksite/Receiver identity 才能入 Rail。

---

## ELIGIBILITY RESOLVER

### Planned exact signature

Planned owner：`apps/local-core/src/railway-destination-service.ts`

```ts
export interface ResolveRailwayDestinationsInputV1 {
  readonly projectId: string
  readonly includeLegacy?: boolean
  readonly forIntent?: RailwayReceiveIntentV1
  readonly source?: RailwayReceiveSourceV1
}

export interface RailwayDestinationSetV1 {
  readonly schemaVersion: 1
  readonly projectId: string
  readonly destinations: readonly ResolvedRailwayDestinationV1[]
  readonly railOrderVersion: number
  readonly resolvedAt: string
}

export class RailwayDestinationService {
  resolve(input: ResolveRailwayDestinationsInputV1): RailwayDestinationSetV1
  resolveOne(
    projectId: string,
    ref: RailwayStoredRefV1,
    options?: {
      readonly forIntent?: RailwayReceiveIntentV1
      readonly source?: RailwayReceiveSourceV1
    },
  ): ResolvedRailwayDestinationV1 | RailwayLegacyRefV1
}
```

### Input truth sources

- Project repository；
- final Worksite repository/read model（未落地前由 explicit Workspace compatibility adapter读取）；
- ReceiverRuntimeService / ConnectedConversation；
- existing Railway order；
- project → Huabu canvas binding/ProjectSession read model；
- lifecycle/availability；
- caller source canonical ref；
- Huabu capability only for `physical_transfer` eligibility。

### Sorting

Resolver返回 deterministic order：

```text
1. canonical Surface Roots in fixed order: main → context → workflow
2. canonical Worksite / Receiver items following persisted RailwayOrderV1
3. canonical eligible items absent from stored order, by createdAt then stableKey
4. legacy items in stored relative order
5. unavailable items remain in their canonical/stored position, never silently dropped
```

T2可以在视觉层弱化 Surface Root，但不能改变 resolver canonical order semantics。

### Availability decisions

- archived Worksite：returned but unavailable(`archived`)；
- missing entity：legacy/unavailable，不静默过滤；
- file-level Artifact missing不直接让 Worksite destination消失；
- Receiver offline/waiting仍可展示，具体 receive intent决定是否 unavailable；
- same source/destination：unavailable(`same_destination`)；
- no stable destination canvas for physical transfer：`physical_transfer_unsupported`；
- Collection/Scope永不因“有 viewId”自动 eligible。

---

## STABLE DESTINATION IDENTITY MAPPING

| Rail role | projectId | canonical ref | canvasId | home/origin | unavailable |
|---|---|---|---|---|---|
| Surface Root | ref.projectId | project + surface | current Project Canvas binding | self surface | project/canvas missing |
| Worksite | ref.projectId | worksite entity | worksite stable canvasId | surface or parent worksite | missing/not-materialized/archived |
| Receiver | ref.projectId | connected conversation | materialized child canvas or current Project Canvas depending intent | receiver workspaceRef/worksite if canonical | missing/offline/waiting/no physical canvas |
| Legacy | stored projectId | none until resolved | never guessed | none | legacy_unresolved |

Rules：

- canonical identity never uses screen coordinate；
- Huabu nodeId is physical source selection identity only，不是 destination canonical identity；
- `canvasId` is resolved capability/address，不是 Rail stable key；
- archived entity保留 identity/readability但不接受 active receive；
- missing source/destination分别报告，不能合成 generic unavailable；
- home/origin用于 navigation/return，不授予 membership owner。

---

## SEMANTIC TRANSACTION SIGNATURE

### Receive intents — PLAN ONLY

```ts
export type RailwayReceiveIntentV1 =
  | 'add_working_set_membership'
  | 'bind_receiver_context'
  | 'create_reference'
  | 'relocate_visible_projection'
  | 'physical_cross_space_transfer'

export type RailwayReceiveSourceV1 =
  | {
      readonly kind: 'canonical_entities'
      readonly refs: readonly {
        readonly entityType: 'artifact' | 'note' | 'conversation' | 'worksite'
        readonly entityId: string
      }[]
    }
  | {
      readonly kind: 'spatial_selection'
      readonly canvasId: string
      readonly nodeIds: readonly string[]
      readonly expectedCanvasVersion: number
      readonly canonicalRefs: readonly {
        readonly entityType: string
        readonly entityId: string
      }[]
    }

export interface RailwayReceiveCommandV1 {
  readonly schemaVersion: 1
  readonly projectId: string
  readonly operationId: string
  readonly origin: ProjectEventOrigin
  readonly destination: RailwayDestinationRefV1
  readonly intent: RailwayReceiveIntentV1
  readonly source: RailwayReceiveSourceV1
  readonly expectedRailOrderVersion?: number
  readonly expectedDestinationVersion?: number
  readonly createSourcePreview?: boolean
}
```

### Planned service signature

Planned owner：`apps/local-core/src/railway-receive-service.ts`

```ts
export class RailwayReceiveService {
  receive(
    command: RailwayReceiveCommandV1,
    signal?: AbortSignal,
  ): Promise<RailwayReceiveOutcomeV1>
}
```

### Outcome

```ts
export type RailwayReceiveOutcomeV1 =
  | {
      readonly status: 'committed'
      readonly operationId: string
      readonly changeSetId: string
      readonly destination: ResolvedRailwayDestinationV1
      readonly canonicalVersion: number
      readonly spatial:
        | { readonly status: 'not_required' }
        | {
            readonly status: 'completed'
            readonly transferId: string
            readonly sourceVersion: number
            readonly destinationVersion: number
          }
        | { readonly status: 'recovery_required'; readonly reason: string }
    }
  | {
      readonly status: 'waiting_input'
      readonly operationId: string
      readonly reason:
        | 'destination_choice_required'
        | 'physical_transfer_confirmation_required'
        | 'canonical_committed_spatial_unknown'
        | 'conflict_requires_rebase'
      readonly changeSetId?: string
    }
  | {
      readonly status: 'conflict'
      readonly operationId: string
      readonly reason: 'stale_source' | 'stale_destination' | 'stale_rail_order'
      readonly currentVersion?: number
    }
  | {
      readonly status: 'rejected'
      readonly operationId: string
      readonly reason:
        | RailwayDestinationUnavailableReasonV1
        | 'intent_not_supported'
        | 'source_not_canonical'
        | 'cross_project_forbidden'
    }
  | {
      readonly status: 'outcome_unknown'
      readonly operationId: string
      readonly changeSetId?: string
      readonly huabuCode: 'MOVE_OUTCOME_UNKNOWN' | 'MOVE_COMPENSATION_FAILED'
    }
```

### Transaction rules

1. Resolve destination again inside service；
2. reject project/ref mismatch；
3. validate intent against `destination.accepts`；
4. operationId is mandatory and deduped through existing mutation receipt semantics；
5. canonical membership/mapping changes enter existing `MutationChangeSetV1`；
6. no new Railway transaction table；
7. ProjectEvent only after canonical commit；
8. retry with same operationId returns same known canonical result；
9. stale versions return conflict，caller refetches；
10. archived/missing/unavailable fail closed；
11. safe undo/revert uses ChangeSet and refuses if touched state changed；
12. physical transfer is a requested side effect, never silently inferred from pointer direction。

### Planned ChangeSet items

Reuse existing membership items when destination is Worksite：

```text
workspace_membership_add/remove
workspace_entity_membership_add/remove
```

During Worksite migration, names may version to worksite equivalents；do not create duplicate membership truth。

For Receiver/context binding or explicit reference, use the actual existing canonical owner’s ChangeSet item. If no reversible item exists, return `PLAN ONLY / owner gap` instead of recording a generic Railway membership。

### Undo/revert

- semantic membership/mapping：existing MutationSafety inverse/forward；
- Rail reorder：CAS reverse order as a separate operation；
- Huabu physical move：not undone by Core ChangeSet alone；requires Huabu inverse transfer or explicit new operation；
- if physical outcome unknown：automatic Core revert forbidden until Huabu state is reconciled。

---

## SOURCE-STAY VS PHYSICAL-TRANSFER RULE

### Source projection stays in place

These drops only change canonical membership/mapping/reference：

```text
add_working_set_membership
bind_receiver_context
create_reference
remote-target semantic acceptance
```

Result：

```text
Core canonical commit
→ source Huabu node remains at source canvas/position
→ destination may derive/project a new reference/view
→ no DELETE_NODES on source
```

`relocate_visible_projection` is only valid inside the same visible Huabu Space and is owned by Huabu spatial commands；it does not change canonical membership unless a separate explicit semantic command is also requested。

### Physical cross-Space transfer required

Only explicit `physical_cross_space_transfer` may call：

```text
POST /canvas/:sourceCanvasId/move-selection
```

with current Huabu body：

```ts
{
  selectedNodeIds: string[]
  destination:
    | { kind: 'existing'; canvasId: string }
    | { kind: 'new'; title: string }
  createSourcePreview: boolean
  expectedSourceVersion: number
}
```

Preconditions：

- source is a real Huabu selection；
- destination resolves to a different existing/new eligible Space；
- user intent explicitly requests physical transfer；
- source version CAS available；
- nodes are Huabu-movable；
- running/task-owned/pending-change Agent nodes fail closed。

Railway hover/drop geometry never decides physical transfer by itself。

---

## MIGRATION

### Current V0

```ts
type ProjectViewRailKindV0 = 'scene' | 'collection' | 'context' | 'workflow'
interface ProjectViewRailRefV0 { kind: ProjectViewRailKindV0; viewId: string }
```

Current storage：`project_view_rail_order.ordered_refs` JSON + version CAS。

### Read migration

```text
scene
→ worksite only if viewId resolves to an explicit durable Worksite/compat Workspace
→ otherwise legacy(scene)

context
→ surface_root(context) only if it resolves to the unique Project Context root
→ otherwise legacy(context)

workflow
→ surface_root(workflow) only if it resolves to the unique Project Workflow root
→ otherwise legacy(workflow)

collection
→ never auto-convert to Worksite
→ legacy(collection), removable/migratable only by explicit user action

unknown/malformed
→ legacy(unknown) diagnostic item
→ never silently drop
```

### Filtering

- duplicates dedupe by V1 stableKey；
- nonexistent canonical target remains unavailable/legacy item；
- Project mismatch rejected；
- kind/entity mismatch does not pass；
- GET no longer filters solely by “ID exists in workspaceIds or scopeIds”。

### New writes

- accept only `RailwayStoredRefV1` schemaVersion 1；
- V0 kinds rejected on normal V1 write；
- optional dedicated migration command may accept V0 + expectedVersion；
- stop writing `viewId` as universal target identity；
- reuse same row/table/CAS；no new RailwayStore/table。

### Migration atomicity

```text
read V0 order/version
→ resolve all items
→ return preview including unresolved items
→ explicit confirm if lossy/user choice required
→ CAS write V1 JSON
→ ProjectEvent after commit
```

No silent background reinterpretation。

---

## EVENT / RECOVERY MATRIX

### Planned ProjectEvent payload

Extend existing event vocabulary; do not add a second bus：

```ts
interface RailwayChangedPayloadV1 {
  readonly schemaVersion: 1
  readonly operationId: string
  readonly action: 'order_changed' | 'destination_received' | 'migration_completed'
  readonly destination?: RailwayDestinationRefV1
  readonly sourceRefs?: readonly { entityType: string; entityId: string }[]
  readonly changeSetId?: string
  readonly resultingVersion?: number
  readonly spatialEffect?:
    | 'not_required'
    | 'requested'
    | 'completed'
    | 'recovery_required'
    | 'outcome_unknown'
}
```

Preferred event type：version existing ProjectEvent type map with `railway.changed`; if project navigation already has a generic canonical event at implementation time, reuse it. Do not misuse `artifact.changed` for Rail order/membership。

| Situation | Canonical result | Huabu result | Returned state | Owner/recovery |
|---|---|---|---|---|
| semantic source-stay | committed | not required | committed | Core event → T2 refetch |
| physical move success | committed | completed | committed | Core + Huabu publish; T2 refetch/reconcile |
| preflight stale | none | not called | conflict | caller refetch/retry new operation or same safe receipt path |
| canonical commit fails | none | not called | rejected/conflict | Core |
| canonical committed, Huabu rejects with known compensated failure | canonical remains committed unless transaction defined compensating ChangeSet | source restored | recovery_required or waiting_input | T6 coordinates; no fake success |
| canonical committed, Huabu `MOVE_OUTCOME_UNKNOWN` | committed but spatial truth uncertain | unknown | outcome_unknown / waiting_input | freeze automatic retry/revert; inspect both Spaces |
| Huabu move succeeds, Core post-move mapping fails | canonical incomplete | physical moved | waiting_input/recovery_required | T6 reconciles canonical refs from Huabu receipt; no blind reverse |
| SSE/event missed | committed | known/unknown from services | refetch | C1-2 replay or snapshot_required |
| restart | read ChangeSet/current owners | read Huabu Space versions | reconcile | Core + Huabu authoritative reads |

### Critical compensation decision

If canonical commit succeeded but physical move fails：

- known Huabu compensation success：source spatial state restored；T6 may create an explicit compensating ChangeSet only if semantic intent must also be reversed and touched state is unchanged；
- unknown Huabu outcome：do **not** auto-revert canonical state and do **not** retry move blindly；return `outcome_unknown` / `waiting_input`，record operation/changeSet/transfer evidence，read both source/destination Spaces and bindings；
- T2 presenter shows pending/recovery state from the read contract, not optimistic success；
- Huabu owns physical compensation；T6 owns canonical reconciliation decision；T3 owns user-facing commit state machine；T2 only presents destination/arrival state。

Without a durable existing recovery record capable of surviving restart, full physical transaction remains PLAN ONLY and must not be declared production-safe merely because Huabu move itself is implemented。

---

## T3 HANDOFF

T3 should consume these discriminants：

```text
destination.ref.kind
intent
availability
operationId
receive outcome status
spatial.status
```

T3 responsibilities：

- pointer/drag payload normalization；
- typed destination selection；
- armed/commit/cancel presentation state；
- explicit physical-transfer confirmation；
- pass AbortSignal；
- map conflict/waiting_input/outcome_unknown to interaction state；
- no canonical persistence。

T3 must not：

- infer destination from node/screen coordinates；
- equate remote Railway drop with physical move；
- generate a second transaction truth；
- rollback Core optimistically without T6 result；
- use `MoveSelectionModal` as Railway primary UX。

Exact T3 `DropDestination` export remains requested separately in `TO_T3_C2-4A...`；T6 does not invent its UI state type here。

---

## HUABU HANDOFF

Current physical API：

```text
POST /canvas/:canvasId/move-selection
web client: huabu/apps/web/src/api/canvas.ts#moveCanvasSelection
server: huabu/apps/server/src/modules/canvas/canvas.route.ts
service: huabu/apps/server/src/modules/canvas/space-move.service.ts
```

Huabu currently owns：

- source version CAS；
- two-Canvas mutex；
- destination creation/cleanup；
- node/frame expansion and new node IDs；
- internal edge preservation / boundary edge omission；
- artifact cloning/rewrite；
- Agent thread rehome；
- destination-first/source-second write；
- inverse delta compensation；
- `MOVE_OUTCOME_UNKNOWN` taxonomy；
- spatial publish/version receipt。

T6 passes only resolved canvas IDs and physical source node selection. T6 must not copy Huabu move planner into Core or persist geometry。

Huabu response currently provides：

```text
transferId
destination canvas/title/created
sourcePreviewNodeId
sourceVersion
destinationVersion
root source→destination node mapping
counts / omitted boundary edges / renames / moved conversations
```

T6 uses that as spatial effect receipt, not canonical Project membership truth。

---

## TESTS

### Current source tests

| File | Proven coverage |
|---|---|
| `apps/local-core/tests/project-view-rail-order.test.ts` | V0 persistence, CAS, restart, filtering baseline |
| `apps/local-core/tests/project-mutation-coordinator.test.ts` | operation receipt/idempotency substrate |
| `apps/local-core/tests/mutation-safety-b5.test.ts` | ChangeSet/revert/reapply substrate |
| `apps/local-core/tests/project-event-hub.test.ts` | project sequence/replay/gap/runtime recovery |
| `huabu/packages/shared/src/types/api/space-move.test.ts` | move request/response/error schemas |
| `huabu/apps/server/src/modules/canvas/space-move.service.test.ts` | move/compensation/service behavior |
| `huabu/apps/web/src/components/Panels/Canvas/MoveSelectionModal.test.tsx` | current modal consumer only, not Railway UX |

### Required planned tests

`apps/local-core/tests/railway-destination-service.test.ts`：

- four ontology roles；
- explicit Worksite only；
- Collection/Scope/temp Context prohibited；
- stableKey determinism；
- archived/missing/offline/unavailable reasons；
- fixed Surface order + persisted item order；
- same destination；
- physical capability absence。

`apps/local-core/tests/railway-order-migration.test.ts`：

- scene explicit Worksite conversion；
- scene unresolved legacy；
- Collection never auto-converts；
- unique context/workflow root conversion；
- unknown retained；
- dedupe；
- V0 new write rejected；
- V1 CAS/restart；
- invalid item not silently dropped。

`apps/local-core/tests/railway-receive-service.test.ts`：

- source-stay membership commit；
- source projection untouched；
- operation idempotency；
- stale order/source/destination；
- unavailable reject；
- ChangeSet inverse/reapply；
- ProjectEvent after commit；
- known physical failure；
- compensation failure/outcome unknown；
- abort before commit vs after commit；
- restart recovery from authoritative owners。

`apps/web-gen2/test/railway-client.test.ts`：GET/order CAS/receive outcomes/error parsing。

`apps/web-gen2/test/railway-presenter.test.ts`：roles/order/unavailable/legacy/read-only projection/no fake destination。

Browser/integration：

```text
semantic drop leaves source projection
physical transfer changes Spaces only after explicit intent
known failure restores source
unknown outcome enters recovery UI
project restart restores Rail order
SSE replay/snapshot refetches canonical result
```

---

## CURRENT STATUS

| Capability | Status |
|---|---|
| V0 rail types/order route/repository/CAS | CURRENT SOURCE |
| V0 frontend production Railway client | NOT LANDED |
| final V1 ontology/type exports | PLAN ONLY |
| explicit Worksite final canonical contract | PLAN ONLY / upstream dependency |
| Receiver canonical identity | CURRENT SOURCE |
| destination eligibility resolver | PLAN ONLY |
| Railway receive semantic transaction | PLAN ONLY |
| ChangeSet/receipt/event substrate | CURRENT SOURCE |
| Railway-specific ChangeSet/event types | NOT LANDED |
| Huabu physical cross-Space move | CURRENT SOURCE |
| T2 presenter/hook/body | PLAN ONLY / NOT LANDED |
| end-to-end Railway receive | NOT LANDED |

The current V0 route must not be advertised as final Railway ontology merely because persistence and CAS exist。

---

## OPEN GAPS

1. Final Worksite V1 contract/file has not landed；this response uses planned `worksiteId` and requires T6 Worksite migration owner to finalize it。
2. No current `packages/contracts/src/railway.ts` export；all V1 types above are PLAN ONLY。
3. No RailwayDestinationService or RailwayReceiveService exists。
4. V0 row JSON has no schemaVersion；migration preview/confirm path not landed。
5. Existing GET silently filters IDs and does not verify kind/entity match；must be replaced, not reused as eligibility。
6. Railway-specific ChangeSet items and `railway.changed` event are not landed。
7. There is no proven durable cross-system saga record binding Core operationId/changeSetId to Huabu transferId；therefore automatic restart-safe physical compensation is not yet closed。
8. T3 final DropDestination/commit state type is still pending its own handoff。
9. T2 read client/presenter/body are not landed。
10. Project → stable Huabu canvas binding for every destination species must be read from final ProjectSession/Worksite contract, never guessed。
11. Archived lifecycle implementation from T6 C1-3 is plan-only, so archived eligibility cannot yet be production-tested。
12. End-to-end browser/runtime verification has not run。

### T6 decision

```text
MATERIAL SUFFICIENCY FOR THIS RESPONSE: SUFFICIENT
CONTRACT DETAIL: SOURCE-ANCHORED PLAN COMPLETE
FINAL CONTRACT IMPLEMENTATION: NOT LANDED
NEW DATABASE: NOT REQUIRED
PHASE B SEMANTICS: NOT REOPENED
```

# LCOS Gen2 · T4
# C1-3 · Assembly Exact Source Plan
## Warehouse / Capture / Sources / Skills → Source Bay → Typed Target → Canonical Apply

日期：2026-09-06  
源码基线：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`  
阶段：`PHASE C1-3`  
状态：`FORMAL SOURCE-LEVEL PLAN / NO PRODUCTION PATCH`

---

# 0. 本卡只解决什么

本卡把 Assembly 从“产品冻结 + donor 方向”正式落到 exact source seam：

```text
Project Warehouse
Capture Space
Resources / Sources
Skills
↓
Assembly Source Bay
↓
current typed target
↓
POST /projects/:id/assembly/apply
↓
existing canonical mutation channels
↓
truthful per-item result / partial / error
```

本卡不重新定义：

```text
Collection truth
Workflow composition truth
Skill capability-use truth
Context membership
Conversation membership
Worksite
Drop gesture grammar
Camera / geometry
```

这些全部遵循 Phase B 和其它 owner。

---

# 1. Phase B 固定输入

本卡直接执行：

```text
D04
Give / Drop exact semantic owner在 T3/T6；
T4只消费 target/ref/capability。

D20
Skill package唯一。
Composer Skill = per-run/current selection；
Workflow/Glyth durable Skill = typed capability-use relation；
不复制 Skill package。

D21
Assembly = Project-shared Source Bay + Target。
current context/workflow/collection → scope compatibility
只允许 migration。
Assembly 不拥有 membership / relation / Skill binding。

D25
T4可进入正式 source-level construction planning。
```

已经关闭的问题不重新 OPEN。

---

# 2. Assembly 当前 Core 不是空白

当前 source 已经有：

```text
packages/contracts/src/assembly.ts

apps/local-core/src/warehouse-service.ts
apps/local-core/src/assembly-apply-service.ts
apps/local-core/src/capture-space-service.ts
apps/local-core/src/skill-catalog-service.ts

apps/local-core/src/routes/f6-assembly.ts
apps/local-core/src/routes/resources.ts
apps/local-core/src/server.ts   // Capture Space current routes
```

所以正确施工不是：

```text
“设计一个 Assembly backend”
```

而是：

```text
组合既有 read sources
+
补 web-gen2 typed clients
+
补 Huabu professional body
+
接 existing AssemblyApply
+
等待/消费 T6 target-command migration
```

---

# 3. Current Source Bay 四路真实 owner

## 3.1 Project

```text
GET /projects/:id/warehouse
```

Owner：

```text
WarehouseService
```

职责：

```text
Project-level read model
search / filter / pagination / used-here read
```

它不是：

```text
Assembly DB
```

---

## 3.2 Capture

Current exact route 位于：

```text
apps/local-core/src/server.ts
```

而不是单独 `routes/capture-space.ts`。

当前 routes：

```text
POST /runtime/capture-space/enqueue
GET  /runtime/capture-space
PUT  /runtime/capture-space/presentation
GET  /runtime/capture-space/items/:captureId/preview
POST /runtime/capture-space/organize
POST /runtime/capture-space/materialize
```

源码注释已经冻结：

> Capture Space 是系统级暂存画布，不属于任何 Project。

因此 Assembly 的 Capture source：

```text
READ global Capture Space
→ APPLY into current Project/target
```

不能造：

```text
ProjectCaptureStore
Project-specific Capture DB
```

---

## 3.3 Sources / Resources

Current exact read source：

```text
apps/local-core/src/routes/resources.ts
```

Assembly Source Bay 当前最低需要：

```text
GET /projects/:id/resources
```

它返回轻量：

```text
resourceId
artifactId
title
sourceKind
status
analyzerVersion
```

按需 preview 可继续：

```text
GET /projects/:id/resources/:resourceId
GET /projects/:id/resources/:resourceId/descriptor
GET /projects/:id/resources/:resourceId/content
```

Import URL/archive/upload session 等：

```text
属于 Resource import flow
```

不是 Assembly浏览器第一版必须承接的 mutation。

---

## 3.4 Skills

Current exact route：

```text
GET /projects/:id/skills?search=...
GET /projects/:id/skills/:skillId
```

Owner：

```text
SkillCatalogService
```

它复用 canonical layered skill loader：

```text
system
user
merged
```

不造第二套 skill parser。

Assembly C1-3只读：

```text
catalog list/read
```

Skill package mutation：

```text
留给 C1-6 Skill Builder
```

同一个 web client 文件未来扩展，不再造第二 Skill client。

---

# 4. Warehouse exact contract

Current：

```ts
WarehouseEntityKindV1 =
  | 'artifact'
  | 'note'
  | 'conversation'
  | 'resource'
  | 'context'
  | 'workflow'
  | 'scene'
  | 'collection'
```

明确没有：

```text
skill
capture
```

这不是遗漏。

说明 Source Bay 本来就应该是：

```text
visual composition of multiple read models
```

而不是：

```text
one universal Warehouse table
```

---

# 5. Warehouse current query

Contract：

```ts
interface WarehouseQueryV1 {
  search?: string
  kinds?: WarehouseEntityKindV1[]
  provenanceOrigin?: ...
  usedHereTarget?: {
    kind: 'workspace' | 'scope' | 'conversation'
    id: string
  }
  limit?: number
  cursor?: string
}
```

但 current HTTP route parser只真正接受：

```text
usedHereTarget=workspace:<id>
```

不会解析：

```text
scope:<id>
conversation:<id>
```

---

# 6. C1-3 client discipline：不能“按合同猜 HTTP 已实现”

因此 `CoreAssemblyClient.queryWarehouse()` 的 public query type：

```ts
export interface CoreWarehouseQuery {
  search?: string
  kinds?: readonly WarehouseEntityKindV1[]
  provenanceOrigin?: WarehouseQueryV1['provenanceOrigin']
  usedHereTarget?: {
    kind: 'workspace'
    id: string
  }
  limit?: number
  cursor?: string
}
```

只暴露 current HTTP 真正能承诺的：

```text
workspace
```

不提前暴露：

```text
scope / conversation
```

等 T6/route真正落地再扩。

---

# 7. Warehouse response

Current：

```ts
interface WarehouseSnapshotV1 {
  schemaVersion: 1
  projectId: string
  items: readonly WarehouseItemV1[]
  nextCursor?: string
  totalApprox: number
}
```

Assembly body直接消费这个 read projection。

不要把它转换成：

```text
new AssemblyMaterialEntity
```

只做 presentation adapter。

---

# 8. Assembly source refs

Current `AssemblySourceRefV1` 已覆盖：

```text
artifactView
capture
resource
conversation
context
workflow
scene
collection
skill
note
```

Skill：

```ts
{
  kind: 'skill'
  id: string
  source: 'system' | 'user' | 'merged'
  version?: string
}
```

所以 C1-3 不新增：

```text
AssemblySkillRef
AssemblyMaterialRef
AssemblyCaptureRefV2
```

直接复用 contract。

---

# 9. Assembly target refs

Current `AssemblyTargetRefV1`：

```text
project
main
workspace
conversation
context
workflow
scene
```

关键边界：

```text
main
= Project Main Presentation

workspace
= durable worksite/legacy compatible target

scene
= workspace-backed scene target
```

禁止：

```text
main = current Huabu workspace
```

也禁止：

```text
targetRef = canvasId
```

---

# 10. Target owner

Assembly body不拥有 target truth。

它只接收：

```ts
interface AssemblyBodyProps {
  projectId: string
  targetRef: AssemblyTargetRefV1
}
```

`targetRef` 由：

```text
current active work context / caller
```

注入。

---

# 11. 为什么 targetRef 必须是 prop 而不是 Assembly Zustand

因为 Assembly 可能：

```text
在 Main 打开
切 Context
切 Workflow
进入 Conversation deep work
```

目标需要跟随：

```text
current caller / active context
```

如果另存一份 Zustand：

```text
很容易 stale
```

所以：

```text
caller/source of truth
→ props
→ AssemblyBody
```

Assembly只可保留：

```text
当前 UI selection / search / preview
```

这种 presentation state。

---

# 12. Professional region identity

C1-2 已冻结：

```text
regionId = 'lcos:assembly'
bodyKey = 'assembly'
restorePolicy = 'project'
```

Assembly 是：

```text
Project-shared professional region
```

不是每个 Surface 一份：

```text
lcos:assembly:main
lcos:assembly:context
lcos:assembly:workflow
```

否则会制造三套仓库窗口。

---

# 13. `AssemblyApplyRequestV1`

Current request 已有：

```text
projectId
sourceRefs[]
targetRef
placementBySource?
```

因此 T4不需要造：

```text
AssemblyDropGeometryService
AssemblyMembershipRequest
```

---

# 14. placement 的边界

Current contract支持：

```text
placementBySource[sourceRef.id]
→ {x,y}
```

Phase B/T1/T3 已确定：

```text
空间 placement owner
≠ Assembly business truth
```

因此 Assembly body只在：

```text
T3 semantic drop明确提供 placement
```

时转传。

普通：

```text
点击 Apply / Give
```

没有 placement 就不制造 x/y。

---

# 15. Current AssemblyApplyService 是值得 KEEP 的核心

源码已经明确：

> service 不拥有新的 mutation truth。

它做：

```text
sourceRef + targetRef
→ existing canonical service
```

当前 routes包括：

```text
capture materialize
workspace membership
presentation membership
relations
resource→artifact view reuse
```

这是正确架构。

---

# 16. Capture apply

Current：

```text
capture → project
```

流程：

```text
CaptureSpaceService.materializeToProject()
```

新 materialization：

```text
status='applied'
channel='capture-materialize'
```

已经 materialized same Project：

```text
status='skipped'
channel='already-member'
```

是幂等复用。

---

# 17. Capture → Surface

Current：

```text
capture
→ materialize once
→ resolve viewId
→ target surface membership
```

两步链失败后：

```text
重试复用已 materialized artifact/view
```

所以 T4 UI不能因为：

```text
“第一次第二步失败”
```

就自己删除 materialized artifact。

这会破坏 Core幂等策略。

---

# 18. Capture current legacy debt

`CaptureSpaceService.materializeToProject()` 当前内部仍然：

```text
find root Scope
place x/y
import into root scope
```

这是旧 Scope/placement混合实现。

Phase B 已明确：

```text
legacy compatibility
```

T4 C1-3：

```text
不绕过 CaptureSpaceService
不直接修它
```

T6 source plan负责 canonical migration。

---

# 19. Resource apply

Assembly `resource` source当前策略：

```text
read canonical descriptor
→ resolve existing artifact/view
→ route through existing artifact-view apply
```

因此：

```text
Resource source
≠ 复制 Resource
```

也：

```text
Assembly不承担 import URL
```

---

# 20. Skill apply current source

Current：

```text
skill
→ unsupported
```

这是已知 current source gap。

Phase B D20已经关闭产品语义：

```text
Workflow/Glyth durable Skill use
→ typed capability-use relation

Composer
→ per-run selection
```

所以 T4不重新 OPEN。

C1-3策略：

```text
Assembly UI:
展示 Skill Source
允许 drag/admission UI

真正 Apply：
- 如果 T6 command seam已落
  → route canonical capability-use command
- 如果尚未落
  → fail-close / unavailable
```

不得：

```text
POST AssemblyApply然后看到 unsupported 还 toast success
```

---

# 21. Legacy scope target mapping

Current `AssemblyApplyService` 对：

```text
context
workflow
collection
```

仍有：

```text
scope compatibility endpoint
```

Phase B D21：

```text
MIGRATION ONLY
```

T4的 body/client：

```text
只使用 typed target ref
```

绝不在前端判断：

```text
contextId → scopeId
workflowId → scopeId
collectionId → scopeId
```

T6后端命令迁移后：

```text
AssemblyApply内部路由被替换
```

T4 UI无需重写。

这就是薄 adapter 的意义。

---

# 22. Apply result：HTTP 200 ≠ all success

Current route：

```text
POST /projects/:id/assembly/apply
```

只要 service正常返回：

```text
HTTP 200
```

即使某些 item：

```text
status='failed'
```

也会包含在 `AssemblyApplyResultV1`。

只有 service抛异常才：

```text
HTTP 409
```

---

# 23. Per-item result exact states

Current：

```ts
status:
'applied'
| 'skipped'
| 'failed'
```

channel：

```text
workspace-membership
presentation-membership
relation
capture-materialize
already-member
unsupported
error
```

---

# 24. `allApplied`

Current：

```ts
allApplied: boolean
```

但 UI仍然必须检查：

```text
results[]
```

因为需要表达：

```text
partial
skipped
unsupported
failed
```

而不是一个绿色大勾覆盖所有 item。

---

# 25. T4 UI result reducer

ADD pure helper：

```text
apps/web-gen2/src/presentation/assemblyApplyPresentation.ts
```

或如果 C1-3 implementation希望文件更少：

```text
直接放 backend/assembly.ts 内 exported pure helper
```

优先：

```text
presentation独立
```

因为它不是 HTTP。

候选：

```ts
type AssemblyApplyPresentationStatus =
  | 'applied'
  | 'partial'
  | 'skipped'
  | 'failed'
  | 'unsupported'

resolveAssemblyApplyPresentation(result)
```

---

# 26. Presentation reducer规则

```text
all results applied
→ applied

applied + skipped/failed
→ partial

all skipped + channels already-member
→ skipped

any unsupported and no applied
→ unsupported

failed/error and no applied
→ failed
```

不要把：

```text
channel enum
```

默认暴露给用户。

它可：

```text
dev diagnostics / deep details
```

---

# 27. Source Bay exact frontend clients

Current `apps/web-gen2/src/backend/` 只有：

```text
artifacts.ts
client.ts
coreTypes.ts
projects.ts
relations.ts
search.ts
sqliteBindingStore.ts
```

因此 C1-3新增四个薄 client 是合理的。

---

# 28. ADD `apps/web-gen2/src/backend/assembly.ts`

Owner：

```text
T4 Core HTTP boundary
```

Consumer：

```text
AssemblyBody / source adapter
```

API：

```ts
export class CoreAssemblyClient {
  constructor(private readonly http: HttpClient) {}

  queryWarehouse(
    projectId: string,
    query?: CoreWarehouseQuery,
    signal?: AbortSignal
  ): Promise<WarehouseSnapshotV1>

  apply(
    projectId: string,
    request: AssemblyApplyRequestV1,
    signal?: AbortSignal
  ): Promise<AssemblyApplyResultV1>
}
```

---

# 29. `projectId` request consistency

Contract request里已有：

```text
request.projectId
```

HTTP path也有：

```text
/projects/:id
```

Client必须 fail-fast：

```text
request.projectId !== path projectId
→ throw before network
```

避免：

```text
path p1 + body p2
```

这种人类喜爱的双重真相。

---

# 30. Warehouse query encoding

顺序固定，方便 test：

```text
search
kinds
provenance
usedHereTarget
limit
cursor
```

使用：

```text
URLSearchParams
```

不要手写字符串拼接。

---

# 31. ADD `apps/web-gen2/src/backend/capture.ts`

Owner：

```text
T4 Core HTTP boundary
```

Consumer：

```text
Assembly Capture source
未来 Capture UI可复用
```

最小 API：

```ts
export class CoreCaptureClient {
  getCaptureSpace(
    limit?: number,
    signal?: AbortSignal
  ): Promise<CaptureSpaceSnapshotV1>

  getCapturePreview(
    captureId: string,
    signal?: AbortSignal
  ): Promise<CaptureSpacePayloadPreviewV1>
}
```

---

# 32. C1-3 不给 Capture client 暴露什么

先不加：

```text
organize()
savePresentation()
materializeToProject()
```

原因：

```text
Assembly不是 Capture Space editor
Assembly apply必须走统一 AssemblyApply
```

未来独立 Capture work surface需要时：

```text
扩同一个 CoreCaptureClient
```

不要先造全部能力。

---

# 33. Capture snapshot route response type

Current GET：

```text
/runtime/capture-space
```

response value：

```text
schemaVersion:1
items
pendingCount
presentation
```

若 contracts中没有一个恰好命名 snapshot wrapper：

```text
capture.ts
定义最薄 route projection interface
```

但 item/presentation字段继续 import contracts类型。

不要复制全 contract结构。

---

# 34. ADD `apps/web-gen2/src/backend/resources.ts`

Owner：

```text
T4 typed Core read boundary
```

最小：

```ts
export interface ResourceListItem {
  resourceId: string
  artifactId: string
  title: string
  sourceKind: string
  status: string
  analyzerVersion?: string
}

export class CoreResourceClient {
  listResources(
    projectId: string,
    signal?: AbortSignal
  ): Promise<readonly ResourceListItem[]>

  getDescriptor(
    projectId: string,
    resourceId: string,
    signal?: AbortSignal
  ): Promise<ResourceDescriptorV1>
}
```

---

# 35. Resource content preview

是否在 C1-3 加：

```text
getContent()
```

取决于 Assembly final body是否需要 inline content preview。

当前建议：

```text
ADD on-demand getContent only if exact returned contract已在 implementation阶段锁定
```

否则：

```text
列表 + descriptor
```

已经够第一阶段 Source Bay。

不要为了“可能预览”扩 API surface。

---

# 36. ADD `apps/web-gen2/src/backend/skills.ts`

Owner：

```text
T4/T6 shared Core Skill HTTP boundary
```

C1-3先：

```ts
listSkills(
  projectId,
  search?,
  signal?
): Promise<readonly SkillCatalogEntryV1[]>

readSkill(
  projectId,
  skillId,
  signal?
): Promise<SkillCatalogReadV1>
```

---

# 37. Skill read 404行为

Current route如果 Skill不存在：

```text
404
```

Client：

```text
CoreApiError('NOT_FOUND')
```

不返回：

```text
undefined
```

给 UI 猜。

---

# 38. C1-6 如何复用 `skills.ts`

以后 Skill Builder需要：

```text
validate
create
update
version-bump
rename
install
disable/enable
```

全部：

```text
扩同一个 CoreSkillClient
```

不要再造：

```text
SkillCatalogClient
SkillPackageClient
SkillBuilderClient
```

三个 client class 分裂同一 route family。

如果最终职责太大：

```text
同文件内部 method group
```

也比造三份 transport owner好。

---

# 39. `HttpClient` current状态

Current：

```text
JSON request
AbortSignal
JSON/text/blob response
Core envelope normalization
```

C1-3全部 route：

```text
GET JSON
POST JSON
```

所以：

```text
NO MODIFY `backend/client.ts`
```

---

# 40. `coreRequest()` 直接复用

Current：

```text
apps/web-gen2/src/backend/coreTypes.ts
```

已经做：

```text
Core envelope unwrap
HttpError → CoreApiError
abort/network normalization
```

四个新 client必须：

```text
全部通过 coreRequest/coreEnvelope
```

不要各自：

```text
try/catch response.ok
```

---

# 41. `apps/web-gen2/src/index.ts`

MODIFY：

```text
export CoreAssemblyClient
export CoreCaptureClient
export CoreResourceClient
export CoreSkillClient

export related thin route projections/types
```

不 export：

```text
AssemblyBody React stuff
```

web-gen2继续是：

```text
Core/Spatial typed boundary
```

---

# 42. Core client exact tests

MODIFY：

```text
apps/web-gen2/test/core-clients.test.ts
```

沿用 current：

```text
makeHttp()
Captured
jsonResponse()
```

不用新测试 harness。

---

# 43. Assembly client tests

至少：

```text
warehouse encodes search
warehouse encodes kinds
warehouse encodes provenance
warehouse encodes workspace usedHereTarget
warehouse cursor/limit
warehouse does not expose scope/conversation usedHereTarget

apply exact path/body
apply rejects path/body project mismatch
apply returns partial result unchanged
apply 409 → CoreApiError(CONFLICT)
abort → CoreApiError(aborted)
```

---

# 44. Capture client tests

```text
GET /runtime/capture-space
limit encoded

GET item preview
captureId encoded

does not materialize directly
```

最后一条可通过：

```text
public client API没有 materialize method
```

代码审查/类型层保证。

---

# 45. Resource client tests

```text
GET /projects/p1/resources
maps route projection exactly

GET descriptor
encodes project/resource ids

404 descriptor
→ CoreApiError NOT_FOUND
```

---

# 46. Skill client tests

```text
GET skills no search
GET skills ?search=
encode search

GET one skill
404 → CoreApiError
```

---

# 47. Huabu Assembly module exact boundary

Current：

```text
huabu/apps/web/src/lcos/
```

没有 Assembly body。

C1-3 ADD：

```text
huabu/apps/web/src/lcos/assembly/
```

保持少文件。

---

# 48. Exact new UI files

建议：

```text
AssemblyBody.tsx
assemblySourceAdapter.ts
assemblyApplyState.ts
AssemblyBody.test.tsx
assemblySourceAdapter.test.ts
```

不要先造：

```text
AssemblyStore.ts
AssemblyManager.ts
AssemblyRepository.ts
AssemblyController.ts
AssemblyRegistry.ts
```

---

# 49. `AssemblyBody.tsx`

Owner：

```text
T4 Professional Body
```

Props：

```ts
interface AssemblyBodyProps {
  projectId: string
  targetRef: AssemblyTargetRefV1
  clients: {
    assembly: CoreAssemblyClient
    capture: CoreCaptureClient
    resources: CoreResourceClient
    skills: CoreSkillClient
  }
}
```

真实 implementation可以通过：

```text
ProjectSession dependency injection
```

减少 props长度。

但 owner结构如此。

---

# 50. 不创建 Assembly Zustand business store

Assembly body需要的状态：

```text
active source tab
search text
selected source refs
preview target
loading
apply status
pagination cursor
```

全部是：

```text
presentation/session-local state
```

第一阶段用：

```text
React local state/reducer
```

就够。

---

# 51. 为什么暂时不用 Zustand

因为没有：

```text
跨 route canonical persistence
多实例共享 truth
后台 worker
```

强需求。

Professional Window本身：

```text
renderer='always'
```

可以保持 body local state。

即使 remount：

```text
read sources可重建
```

所以不值得把临时筛选器升级成全球国家数据库。

---

# 52. Async read discipline

每个 Source read：

```text
AbortController
+
request generation / current tab guard
```

防：

```text
Project A request late return
→ overwrite Project B
```

和：

```text
Skills search slow response
→ overwrite newer search
```

---

# 53. `assemblySourceAdapter.ts`

职责：

```text
不同 source backend projection
→ common presentation item
```

不做 canonical identity转换。

候选：

```ts
export interface AssemblySourceItemPresentation {
  key: string
  sourceRef: AssemblySourceRefV1
  title: string
  subtitle?: string
  thumbnail?: ...
  sourceGroup: 'project'|'capture'|'sources'|'skills'
  status?: ...
}
```

---

# 54. Presentation item不是新的 domain entity

它只用于：

```text
render
select
drag
preview
```

唯一写入口仍使用：

```text
sourceRef
```

不把：

```text
presentation key
```

送 Core。

---

# 55. Project Warehouse mapping

Warehouse item：

```text
→ sourceRef based on its canonical entity/view kind
```

具体 mapping必须复用 contract已有 sourceRef types。

如果 Warehouse item不能无歧义生成某种 sourceRef：

```text
item read-only / no Apply
```

不能猜。

---

# 56. Capture mapping

```text
CaptureStagingItemV0.id
→ {kind:'capture', id}
```

简单。

---

# 57. Resource mapping

```text
resourceId
→ {kind:'resource', id: resourceId}
```

不使用 artifactId作为 resource source identity。

---

# 58. Skill mapping

```text
SkillCatalogEntryV1
→ {
  kind:'skill',
  id,
  source
}
```

如果当前 catalog list没有 version：

```text
不伪造 version
```

需要 version时：

```text
read exact Skill
```

或未来 T6 contract扩展。

---

# 59. Source tabs are visual composition

UI Source Bay：

```text
Project
Capture
Sources
Skills
```

只是：

```text
navigation/presentation
```

不意味着：

```text
四张 canonical tables
```

---

# 60. Search

## Project

用：

```text
warehouse.search
```

server-side。

## Skills

用：

```text
skills?search=
```

server-side。

## Resources

current list route没有 search query。

第一阶段：

```text
client-side filter loaded lightweight resource list
```

如果数量/性能以后不够：

```text
再用 existing /resources/match 或新的 search route
```

不在 T4偷偷发明新 route。

## Capture

current snapshot也没有 search。

第一阶段：

```text
client-side filter pending snapshot
```

---

# 61. Pagination

Warehouse：

```text
cursor
nextCursor
totalApprox
```

必须真实分页。

Capture：

```text
limit
```

current snapshot无 cursor。

Skills：

```text
current list无分页
```

Resources：

```text
current list无分页
```

T5不能把四个 tab都画成：

```text
统一无限加载 footer
```

工程能力不一样。

视觉可统一滚动形态，但 load行为不同。

---

# 62. Virtualization

Huabu current dependency：

```text
react-virtuoso ^4.18.7
```

因此大型：

```text
Warehouse
Capture
Resource
Skill
```

列表/网格优先复用：

```text
react-virtuoso
```

不新增另一个 virtualization package。

---

# 63. Masonry / waterfall

Lovart 是：

```text
visual donor
```

第一阶段实现策略：

```text
T5最终 body若需要真实 variable-height Masonry
→ 用现有 Virtuoso grid/list + CSS layout评估
```

只有证明：

```text
现有 Virtuoso无法满足稳定 virtualization + DnD
```

才评估专门 Masonry package。

C1-3不提前加依赖。

---

# 64. Source item preview

原则：

```text
preview on demand
```

不要 Source Bay opening 时：

```text
给每个 Resource/Capture/Skill发 detail request
```

否则一个漂亮仓库打开就发 200 个请求，人类又会开始研究“为什么 Electron 风扇转”。

---

# 65. Target header / target presence

Assembly Body始终必须知道：

```text
targetRef
```

T5可做：

```text
轻量 target identity indicator
```

但不能变成：

```text
大表单
```

因为默认 target来自当前现场。

---

# 66. Target update

`AssemblyBodyProps.targetRef` 变化：

```text
立即更新 active target
```

但：

```text
当前选中的 source items可继续
```

Apply发生时：

```text
snapshot current targetRef
```

避免 async期间 target切换导致：

```text
request UI说A
实际写B
```

---

# 67. Apply transaction snapshot

用户触发 Apply：

```ts
const request = {
  projectId,
  sourceRefs: selectedSourceRefs,
  targetRef: currentTargetRef,
  placementBySource
}
```

这份 request在 mutation期间 immutable。

---

# 68. Apply期间 target又变化

UI：

```text
mutation继续作用于提交时 target
```

结果反馈：

```text
明确关联 original target
```

之后 current header可显示新 target。

不自动重新 Apply。

---

# 69. Selection after Apply

建议：

```text
successful applied/skipped-already-member
→ 可保持 selection briefly

failed/unsupported
→ 保持 selection以便用户修正/重试
```

最终 T5可决定视觉清除节奏。

不能：

```text
全 success/failed一律瞬间清 selection
```

导致 partial失败项丢上下文。

---

# 70. Partial apply

例如：

```text
3 items
2 applied
1 failed
```

必须：

```text
PARTIAL
```

显示：

```text
2 successful
1 failed
```

不能：

```text
throw away result
rollback successful Core changes
```

因为 current service是逐项 canonical apply。

---

# 71. Recovery policy

Assembly不是事务协调器。

所以：

```text
partial
→ do not frontend rollback
```

正确：

```text
re-read target/source as needed
keep failed items
allow retry failed subset
```

---

# 72. Retry

Retry只提交：

```text
failed/unsupported? appropriate subset
```

但：

```text
unsupported
```

除非 capability变化，否则不要盲 retry。

Already-member：

```text
不重试
```

---

# 73. Apply status model

`assemblyApplyState.ts` 只保存：

```text
idle
applying(request snapshot)
settled(result)
error(CoreApiError)
```

不是：

```text
membership truth
```

---

# 74. HTTP 409

Current route service throw：

```text
409 CONFLICT
```

UI：

```text
mutation error state
```

然后：

```text
re-read current target/source
```

不把 local optimistic state当真。

---

# 75. 503 / unavailable

某 source service未配置：

```text
Warehouse
Capture
Skill
```

route会：

```text
503 UNAVAILABLE
```

Source Bay应该：

```text
该 source section unavailable
```

而不是：

```text
整个 Assembly崩溃
```

四个 source reader要分开 fail。

---

# 76. Source availability isolation

例如：

```text
Capture 503
```

仍然可以浏览：

```text
Project
Sources
Skills
```

因此 AssemblyBody data state应该：

```text
per source
```

不是一个：

```text
global loading/error boolean
```

---

# 77. `AssemblyBody` state shape

建议：

```ts
interface SourceLoadState<T> {
  status: 'idle'|'loading'|'ready'|'error'
  data?: T
  error?: CoreApiError
}
```

四路独立。

---

# 78. Project change

ProjectSession重建后：

```text
Assembly body project-scoped region恢复
```

但如果从 Project A切B：

```text
A请求Abort
A selection/preview清空
B target/source reload
```

不能带：

```text
A selected source refs
```

到 B。

---

# 79. Surface switch

同 Project：

```text
Assembly region stays
source data can stay
targetRef updates
```

不需要：

```text
reload Warehouse on every Surface switch
```

因为 Warehouse是 Project-level。

---

# 80. Conversation target

打开 Conversation deep work时：

```text
targetRef.kind='conversation'
```

Assembly仍是：

```text
same lcos:assembly region
```

不创建：

```text
ConversationAssembly
```

---

# 81. Assembly professional renderer integration

C1-2：

```text
renderRegion(descriptor)
```

C1-3增加：

```text
case 'assembly':
  return <AssemblyBody ... />
```

准确落点应在：

```text
active Project shell / professional region renderer
```

不是 Dockview core。

---

# 82. `ProfessionalWindowController.open()`

打开 Assembly：

```ts
requestProfessionalWindow({
  regionId: 'lcos:assembly',
  bodyKey: 'assembly',
  restorePolicy: 'project'
})
```

target：

```text
不编码进 regionId
```

因为一个 Project只有一个共享 Assembly窗口。

---

# 83. Open from Main / Context / Workflow

Caller：

```text
T2/T3/current UI entry
```

先提供 current targetRef。

然后：

```text
open/focus same Assembly region
```

Assembly body通过 live props拿 target。

---

# 84. Close

关闭：

```text
only presentation region
```

不：

```text
clear Warehouse
delete Capture
unbind Skill
remove membership
```

---

# 85. Restore

重新 open：

```text
reuses same Project source truth
```

Window layout可恢复。

Assembly UI筛选状态：

```text
可 session-local
```

不要求跨浏览器 durable。

---

# 86. Drag from Assembly

T4只提供：

```text
AssemblySourceRefV1 payload
```

给 T3 semantic drag。

不自己监听全局 pointer并判断 target。

---

# 87. Suggested drag payload seam

T3最终 owner可以消费：

```ts
{
  source: 'assembly',
  sourceRef: AssemblySourceRefV1,
  projectId
}
```

最终命名由 T3 seam。

T4只保证：

```text
sourceRef canonical
```

---

# 88. Drag admission

Source item是否 draggable：

```text
sourceRef valid
+
target action supported / current capability
```

如果后端 capability seam尚未暴露：

```text
允许 drag到已知 canonical target
→ apply result fail-close
```

但对已知：

```text
skill→unsupported current source
```

在 T6 seam落地前：

```text
visual disabled / unavailable
```

避免明知失败还演一遍仪式。

---

# 89. T5 visible states

## Source groups

```text
PROJECT
CAPTURE
SOURCES
SKILLS
```

---

## Source item

```text
REST
HOVER
SELECTED
MULTI_SELECTED
DRAGGING
PREVIEW_LOADING
PREVIEW_READY
READ_ONLY
UNAVAILABLE
```

---

## Target

```text
TARGET_READY
TARGET_ACCEPT
TARGET_REJECT
TARGET_CHANGED
```

---

## Apply

```text
APPLYING
APPLIED
SKIPPED_ALREADY_MEMBER
PARTIAL
FAILED
UNSUPPORTED
```

---

# 90. T5不要直接暴露 channel enum

不要默认显示：

```text
presentation-membership
workspace-membership
capture-materialize
relation
```

这属于：

```text
engineering diagnostics
```

用户看到的是：

```text
已加入
已经在这里
部分成功
无法用于当前目标
失败
```

---

# 91. Lovart donor mapping

T5可重点借：

```text
asset-browser density
Masonry/waterfall feeling
thumbnail priority
visual browsing
source section hierarchy
hover disclosure
selection treatment
```

不能借：

```text
Lovart proprietary code/CSS/assets
Lovart domain taxonomy
```

---

# 92. Low-chrome rule

Assembly不是：

```text
资源后台管理系统
```

所以第一层不要常驻：

```text
Import
Delete
Move
Rename
Permissions
Metadata
API status
```

一排企业后台按钮。

对象本体：

```text
直接看
直接选
直接拖
```

管理操作：

```text
hover / context / More
```

---

# 93. Search UI

四路 Source Bay可共享一个：

```text
轻量 Search presentation
```

但 backend capability不同。

UI不暴露：

```text
“本地过滤 / 服务端过滤”
```

这种底层实现模式。

---

# 94. Empty states

每路必须分开：

```text
EMPTY
UNAVAILABLE
FILTERED_EMPTY
LOADING
ERROR
```

不能全部：

```text
“No items”
```

否则用户根本不知道是没有东西还是 Core挂了。

---

# 95. Preview body

Assembly source preview建议：

```text
同 professional region内部 lightweight detail
```

或：

```text
相邻 Preview professional region
```

最终视觉由 T5。

但不新开：

```text
modal per item
```

作为默认机制。

---

# 96. Exact-file matrix

| Exact file | Action | Owner | Consumer | C1-3 |
|---|---|---|---|---|
| `packages/contracts/src/assembly.ts` | KEEP | T6/Core contract | clients/Core | source/target/result truth |
| `apps/local-core/src/warehouse-service.ts` | KEEP | T6/Core | Warehouse route | Project read model |
| `apps/local-core/src/assembly-apply-service.ts` | KEEP + T6 MIGRATION | T6/Core | apply route | no T4 mutation rewrite |
| `apps/local-core/src/capture-space-service.ts` | KEEP + T6 legacy migration | Core | Capture/apply | system Capture owner |
| `apps/local-core/src/skill-catalog-service.ts` | KEEP | Core | Skills route | layered catalog |
| `apps/local-core/src/routes/f6-assembly.ts` | KEEP current / T6 migration | Core | web clients | warehouse/apply/skills |
| `apps/local-core/src/routes/resources.ts` | KEEP | Core | Resource client | Source reads |
| `apps/local-core/src/server.ts` | KEEP current Capture routes | Core | Capture client | no T4 route rewrite |
| `apps/web-gen2/src/backend/client.ts` | KEEP | web-gen2 | all clients | JSON capability sufficient |
| `apps/web-gen2/src/backend/coreTypes.ts` | KEEP | web-gen2 | all clients | envelope/error normalization |
| `apps/web-gen2/src/backend/assembly.ts` | ADD | T4 boundary | Assembly body | Warehouse/apply typed client |
| `apps/web-gen2/src/backend/capture.ts` | ADD | T4 boundary | Assembly/Capture UI | snapshot/preview read |
| `apps/web-gen2/src/backend/resources.ts` | ADD | T4 boundary | Assembly | list/descriptor |
| `apps/web-gen2/src/backend/skills.ts` | ADD | T4/T6 boundary | Assembly/Skill Builder | list/read first |
| `apps/web-gen2/src/presentation/assemblyApplyPresentation.ts` | ADD | T4 presentation | Assembly UI | result reducer |
| `apps/web-gen2/src/index.ts` | MODIFY | package boundary | Huabu | export new clients/types |
| `apps/web-gen2/test/core-clients.test.ts` | MODIFY | CI | clients | exact route tests |
| `apps/web-gen2/test/assemblyApplyPresentation.test.ts` | ADD | T4 | CI | partial/status reducer |
| `huabu/apps/web/src/lcos/assembly/AssemblyBody.tsx` | ADD | T4 | ProfessionalWindowStage | body |
| `huabu/apps/web/src/lcos/assembly/assemblySourceAdapter.ts` | ADD | T4 | body/T3 | source projection→ref |
| `huabu/apps/web/src/lcos/assembly/assemblyApplyState.ts` | ADD | T4 | body | request-local state |
| `huabu/apps/web/src/lcos/assembly/AssemblyBody.test.tsx` | ADD | T4 | CI | source isolation/apply |
| `huabu/apps/web/src/lcos/assembly/assemblySourceAdapter.test.ts` | ADD | T4 | CI | identity mapping |
| `huabu/apps/web/src/lcos/professional/...renderRegion owner...` | MODIFY | T4 | Stage | register `assembly` body |

---

# 97. Explicitly DO NOT TOUCH

T4 C1-3不改：

```text
metadata schema
Collection canonical storage
Context canonical storage
Workflow composition schema
Skill capability-use schema
Run engine
ProjectionBinding
Huabu canvas geometry
SurfaceRegistry
T2 route
T3 gesture state machine
```

---

# 98. Retire list

随着 T6 migration落地：

```text
RETIRE AS PRODUCT ONTOLOGY:
context/workflow/collection → scope endpoint assumptions

RETIRE UI IDEA:
Assembly-owned membership
Assembly-owned Skill binding
Project-specific Capture clone
unified Assembly database
```

---

# 99. Tests · source adapters

`assemblySourceAdapter.test.ts`：

```text
Warehouse artifact/view maps to exact canonical sourceRef
Capture id → capture sourceRef
Resource id → resource sourceRef
Skill id/source → skill sourceRef
missing required canonical id → non-draggable/read-only
never use artifactId as resourceId
never synthesize Skill version
```

---

# 100. Tests · result reducer

`assemblyApplyPresentation.test.ts`：

```text
all applied → APPLIED
applied + failed → PARTIAL
applied + skipped → PARTIAL or applied-with-skip presentation per final reducer
all already-member → SKIPPED_ALREADY_MEMBER
unsupported only → UNSUPPORTED
failed only → FAILED
HTTP success envelope not assumed all applied
```

---

# 101. Tests · AssemblyBody

Mock four clients independently。

必须：

```text
Project source error does not kill Skills
Capture 503 does not kill Warehouse
switch source tab aborts irrelevant preview
project change aborts all old requests
target change does not silently mutate in-flight apply target
partial keeps failed selection
close/reopen can reload from canonical sources
```

---

# 102. Browser Acceptance · BA-C1-3-01

从：

```text
Main
```

打开：

```text
Assembly
```

断言：

```text
regionId = lcos:assembly
target=Main
Project source loads
Capture loads
Resources loads
Skills loads
```

---

# 103. BA-C1-3-02 · Surface continuity

```text
Assembly open in Main
→ switch Context
→ switch Workflow
```

断言：

```text
same Assembly region
source Project data not unnecessarily duplicated
target updates correctly
Window topology preserved
```

---

# 104. BA-C1-3-03 · Conversation target

```text
open Conversation deep work
open/focus Assembly
```

断言：

```text
same lcos:assembly
targetRef = conversation
```

不创建：

```text
ConversationAssemblyStore
```

---

# 105. BA-C1-3-04 · Warehouse pagination

项目有 >1 page Warehouse。

```text
load first
scroll/load more
```

断言：

```text
nextCursor used exactly
no duplicate items
filter change resets cursor
```

---

# 106. BA-C1-3-05 · Capture

Global Capture Space有 item。

Assembly Capture tab：

```text
shows pending item
preview
apply to Project
```

断言：

```text
Capture disappears/updates based Core canonical staging
artifact/view exists
retry does not duplicate
```

---

# 107. BA-C1-3-06 · Capture partial chain

模拟：

```text
materialize succeeds
surface membership fails
```

retry：

```text
reuses same materialized artifact/view
```

UI：

```text
no duplicate card
no manual rollback artifact
```

---

# 108. BA-C1-3-07 · Resource

Resource list：

```text
open Sources
preview descriptor
drag/apply
```

断言：

```text
sourceRef.kind=resource
canonical existing artifact/view reused
```

---

# 109. BA-C1-3-08 · Skill before T6 command landing

Skills可浏览/preview。

对尚不支持 target：

```text
admission unavailable
```

断言：

```text
no fake apply success
no copied Skill
```

---

# 110. BA-C1-3-09 · Partial result

三 items：

```text
applied
already-member
failed
```

HTTP：

```text
200
```

UI必须：

```text
PARTIAL
```

显示失败项。

---

# 111. BA-C1-3-10 · Service isolation

模拟：

```text
Capture service 503
```

断言：

```text
Capture section unavailable
Project/Sources/Skills仍可用
```

---

# 112. BA-C1-3-11 · Project switch

Project A Assembly有 selection。

切 Project B：

```text
A request abort
selection clear
preview clear
B data load
```

没有：

```text
A refs泄露
```

---

# 113. BA-C1-3-12 · Window mechanics regression

Assembly：

```text
Dock
Float
Resize
Close
Restore
```

断言：

```text
body local search/selection按 renderer policy保持
Camera unchanged
```

C1-2 Window behavior不得因 Assembly body破坏。

---

# 114. Recovery / rollback

## Client失败

新 clients全部薄层。

rollback：

```text
remove export / body consumption
```

Core无修改。

---

## Source Bay UI失败

可以暂退成：

```text
simple virtualized list
```

保持同样：

```text
source refs
clients
AssemblyApply
```

视觉 donor可替换。

---

## Apply failure

不 frontend rollback canonical changes。

正确：

```text
honor item result
re-read
retry subset
```

---

## T6 target migration未落

保持：

```text
legacy Core path behind adapter
```

前端不写 scope ontology。

目标 command上线后：

```text
Core adapter换内部路由
T4 UI无需业务重构
```

---

# 115. Blast radius

允许影响：

```text
apps/web-gen2/src/backend/assembly.ts
capture.ts
resources.ts
skills.ts
presentation/assemblyApplyPresentation.ts
index exports
client tests

huabu/apps/web/src/lcos/assembly/*
professional body render switch
Assembly browser presentation
```

不得影响：

```text
Core schema
T6 canonical target definitions
Huabu Camera
Canvas geometry
Selection truth
Workflow/Context data
Skill package persistence
Run
Archive
```

---

# 116. C1-3 implementation order

正式 coding 小步：

```text
C1-3-A
CoreAssemblyClient + tests

C1-3-B
CoreCaptureClient + tests

C1-3-C
CoreResourceClient + tests

C1-3-D
CoreSkillClient list/read + tests

C1-3-E
AssemblyApply presentation reducer + tests

C1-3-F
assemblySourceAdapter + tests

C1-3-G
AssemblyBody basic Source Bay
Project/Capture/Sources/Skills independent loads

C1-3-H
ProfessionalWindowStage registration

C1-3-I
target prop/live context integration

C1-3-J
apply / partial / recovery

C1-3-K
T3 semantic drag payload integration

C1-3-L
browser acceptance
```

如果 A–F不过：

```text
不要先做漂亮 Source Bay
```

不然又会出现 UI 已经长满了，底下 sourceRef 还在猜 ID 的喜剧。

---

# 117. Done Gate

```text
[ ] no Assembly DB/store truth
[ ] Warehouse read uses existing route
[ ] Capture read uses global Capture Space
[ ] Resources use existing Resource routes
[ ] Skills use existing Skill Catalog
[ ] HttpClient unchanged
[ ] new clients use coreRequest/CoreApiError
[ ] warehouse client only exposes currently-supported usedHere workspace filter
[ ] apply path/body projectId mismatch fail-fast
[ ] HTTP 200 partial is rendered as partial
[ ] per-source errors isolated
[ ] Capture retry idempotency preserved
[ ] Resource source uses resourceId
[ ] Skill version not fabricated
[ ] Skill unsupported state fails closed until T6 seam
[ ] no frontend scope inference
[ ] targetRef is injected/live, not Assembly canonical store
[ ] Surface switch keeps one Assembly window
[ ] Conversation uses same Assembly region with conversation target
[ ] no camera mutation
[ ] Lovart only visual donor
[ ] react-virtuoso reused before adding virtualization dependency
[ ] browser acceptance passes
[ ] Coordinator escalation none
```

---

# 118. Technical Conflict Gate

本轮 current source真实差异：

```text
1. Warehouse contract usedHereTarget > HTTP route implementation
2. Capture materialize still internally root-Scope/x-y legacy
3. AssemblyApply context/workflow/collection still scope compatibility
4. Skill apply current unsupported
```

这些全部已经被 Phase B识别并关闭产品语义。

T4可通过：

```text
client narrowing
typed target adapter
fail-close
T6 migration seam
```

处理。

没有发现：

```text
Assembly必须拥有第二 truth
或
现有 Core无法被薄适配
```

所以：

```text
COORDINATOR ESCALATION = NONE
```

---

# 119. Final Exact Owner Matrix

```text
Project source read
→ WarehouseService

Capture truth
→ CaptureSpace / CaptureStaging

Resource truth
→ Resource services

Skill truth
→ SkillPackage / SkillCatalog

Assembly source presentation
→ T4 AssemblyBody

Assembly target
→ caller/current active context
→ typed AssemblyTargetRefV1

Assembly write router
→ AssemblyApplyService

real target mutation
→ existing canonical services / T6 commands

semantic drag
→ T3

placement
→ T1/T3 seam

Professional Window
→ T4 C1-2

visual body
→ T5
```

---

# 120. T4 → T5 C1-3 Visual Delta

T5现在可正式锁 Assembly 以下工程状态：

```text
Source groups:
PROJECT / CAPTURE / SOURCES / SKILLS

Item:
REST
HOVER
SELECTED
MULTI_SELECTED
DRAGGING
PREVIEW_LOADING
PREVIEW_READY
READ_ONLY
UNAVAILABLE

Target:
TARGET_READY
TARGET_ACCEPT
TARGET_REJECT
TARGET_CHANGED

Apply:
APPLYING
APPLIED
SKIPPED_ALREADY_MEMBER
PARTIAL
FAILED
UNSUPPORTED
```

必须注意：

```text
四个 Source 数据源不等价
Warehouse有 cursor
Capture只有 limit
Skills当前无分页
Resources当前无分页
```

视觉可以统一浏览感，但不要画出不存在的统一 backend capability。

---

# 121. Next

下一小步：

```text
C1-4
Context Exact Source Plan
```

将正式锁：

```text
Context Atlas derived input
deterministic time map source
thing/topic/event derived map seam
temporary detail
ContextSnapshot/Checkpoint read
Evolution 2D adapter
Relationship/Provenance read
legacy branch retirement
explicit Worksite transition boundary
donor lifecycle
tests
browser acceptance
T5 Context visual-state delta
```

---

# 122. 一句话施工结论

> **Assembly 不需要造一个“超级仓库后端”。Core 已经有 Warehouse、Capture Space、Resources、Skill Catalog 和统一 AssemblyApply。T4 只需要把四路 read source 用薄 typed client 接成一个专业 Source Bay，再把 canonical sourceRef 送进当前 typed target；结果必须逐项诚实呈现，partial 就是 partial，unsupported 就是 unsupported。这样 Lovart 可以负责它看起来有多好用，而真实数据仍然各回各家。**

# LCOS Gen2 · T3 · C1-S3B
# Exact File Construction Cards
## Compact Composer Draft / Reference Pick / Voice / Receiver / Run / Failure Recovery

> 日期：2026-09-06  
> 状态：`C1-S3B COMPLETE`  
> 基线：`DZWFLi/LCOS_Gen2 @ c2ff890a867922a1256572199458438572eb0a8c`
>
> 前置：
>
> - `C1-S0 · Phase-B Interaction Contract Lock`
> - `C1-S1 · Current Source Exact Map`
> - `C1-S2 · Source Engineering Seam Skeleton`
> - `C1-S3A · Host Interaction / Context Menu / Glyth`
>
> 本批次只写 Composer data plane：
>
> ```text
> T3-C03-04 Compact Composer Draft
> T3-C03-05 Reference Pick + Run Reference Serialization
> T3-C03-06 Voice Transport + Text Merge
> T3-C03-07 Receiver + Run Typed Clients
> T3-C03-08 Run Submission + Failure / Stop / Recovery
> ```
>
> 不写最终 JSX / CSS。
> 不暴露 Provider UI。
> 不新造 Run API。
> 不新造 Voice backend。
> 不重新讨论 Phase B 已关闭的产品问题。

---

# 0. 本批 current-source 复核后的关键结论

这一批重新核源码后，有五个非常重要的工程事实。

## FACT-01 · `HttpClient` 当前真的是 JSON-only request body

`apps/web-gen2/src/backend/client.ts` 当前：

```text
body !== undefined
→ Content-Type: application/json
→ JSON.stringify(body)
```

所以 Voice 的：

```text
multipart/form-data
```

不能直接通过现有 client。

但这是一个很薄的 transport gap，不需要独立第二 HttpClient。

---

## FACT-02 · Voice Core contract 已完整存在

Current Core：

```text
POST /runtime/voice/transcriptions
multipart/form-data
```

允许：

```text
one audio file
durationMs?
language?
prompt?
timestamps?
providerId?
```

共享 contract 已有：

```ts
VoiceTranscriptionResponseV1
```

返回：

```text
text
language?
segments?
model?
providerId
```

所以前端只补 transport + typed client。

---

## FACT-03 · Run Core 已经能吃 Composer 的三类关键输入

Current `POST /projects/:id/runs` 已接受：

```text
receiverRef
orderedReferences
resultSlotId
```

同时接受：

```text
instruction
outputIntent
targetArtifactId / targetRevisionId
contextArtifactIds
workspaceId
savedContextId
requestedProvider
sessionId
resultPolicy
```

`RuntimeApplicationService.create()` 已经：

```text
receiverRef
→ resolve ConnectedConversation

orderedReferences
→ persisted as frozen Composer input snapshot

resultSlotId
→ existing Run materialization path
```

所以 T3 不建立 duplicate execution API。

---

## FACT-04 · Receiver truth 已经完整存在

Current contracts：

```ts
ConnectedConversationV1
ProjectReceiverBindingV1
```

Current routes：

```text
GET  /projects/:id/connected-conversations
GET  /projects/:id/receiver-binding
POST /projects/:id/receiver-binding
```

`ConnectedConversationV1` 本身已经含：

```text
id
provider
conversationRef
conversationSessionId?
label
isRunning
waitingReason
...
```

因此 Composer Receiver 可以保持：

> 用户只看到 Conversation identity。

Provider 只作为内部 dispatch metadata 使用。

---

## FACT-05 · 一个真实但可薄适配的 Receiver/Provider coherence gap

Current `RuntimeApplicationService.create()`：

```ts
const requestedProvider = input.requestedProvider ?? 'workbuddy'
```

也就是说：

```text
selected Receiver = Codex conversation
但前端只传 receiverRef
且不传 requestedProvider

→ Run provider 会默认 workbuddy
```

而 `receiverRef` 的 Conversation provider 并不会在 Core 当前实现里自动覆盖这个默认 provider。

这不是产品 OPEN，也不需要 Coordinator。

因为现有 `ConnectedConversationV1` 已经有：

```text
provider: codex | workbuddy
```

所以薄适配即可：

```text
用户选择 Receiver Conversation
→ UI 仍不显示 Provider
→ runSubmission 内部同时发送
   receiverRef.connectedConversationId
   requestedProvider = selectedConversation.provider
```

这只是让 current transport 和冻结的 Receiver identity 对齐。

---

# 1. T3-C03-04 · Compact Composer Draft

## 1.1 Goal

建立**唯一的 target-local、session-level、非 canonical Composer Draft owner**。

满足：

```text
local Composer
Work View Composer
```

如果指向同一 target：

```text
共享同一 draft
```

不能各自有一份文本。

---

# 1.2 Current source

Current `apps/web-gen2`：

```text
NO LcosComposerShell.tsx
NO ComposerDraft store
NO target-local Composer state
```

Current usable pieces：

```text
interaction/referenceController.ts
→ ordered explicit References

Huabu ChatInput.tsx
→ controlled text / IME / autosize / send-stop mechanics
```

因此：

```text
input mechanics 可借
business state 必须由 T3 建一个薄 owner
```

---

# 1.3 Exact new files

## ADD

```text
apps/web-gen2/src/interaction/composerDraft.ts
```

只定义：

```text
types
pure transitions
draft invariants
```

建议：

```ts
export type ComposerRunPhase =
  | 'idle'
  | 'submitting'
  | 'dispatching'
  | 'running'
  | 'stopping'
  | 'failed';

export interface ComposerTargetSnapshot {
  readonly key: string;
  readonly spatialIds: readonly string[];
  readonly entityRefs: readonly EntityRefLike[];
}

export interface ComposerDraftState<TRef extends EntityRefLike = EntityRefLike> {
  readonly composerId: string;
  readonly target: ComposerTargetSnapshot;
  readonly text: string;
  readonly references: ReferenceControllerState<TRef>;
  readonly receiverOverrideId?: string;
  readonly runPhase: ComposerRunPhase;
  readonly activeRunId?: string;
  readonly lastError?: {
    readonly code: string;
    readonly message: string;
    readonly retryable?: boolean;
  };
}
```

注意：

```text
target snapshot
≠ Reference
```

---

## ADD

```text
apps/web-gen2/src/interaction/composerDraftRegistry.ts
```

这个 Registry 是**小型 transient owner**，不是 mega store。

职责只有：

```text
get/create draft by composerId
update draft
delete draft
list open drafts if needed
```

建议：

```ts
class ComposerDraftRegistry {
  get(composerId)
  open(target)
  update(composerId, updater)
  closeProjection(composerId)   // 不删除 draft
  clear(composerId)             // 明确用户行为
}
```

### Important

```text
close local projection
≠ clear draft

promote into Work View
≠ create second draft

Work View close
≠ lose draft
```

---

# 1.4 `composerId` key rule

不能用：

```text
React component instance id
randomUUID each open
```

否则 local ↔ Work View 无法共享。

建议 helper：

```ts
composerIdForTarget(target)
```

规则：

### Single canonical target

```text
entityType + entityId
```

### Multi-selection target

```text
sorted stable canonical refs
→ stable selection signature
```

只做 session-level identity。

它不是 Core canonical object id。

---

# 1.5 Exact consumer

未来 React/T5 body：

```text
reads/writes ComposerDraftRegistry
```

Huabu `ChatInput` mechanics：

```text
value = draft.text
onChange = update draft
```

Reference chips：

```text
draft.references
```

Receiver chip：

```text
draft.receiverOverrideId / resolved receiver
```

---

# 1.6 Exact invariants

必须 pure-test：

```text
opening Composer starts References empty
closing projection does not clear draft
same composerId reopens same draft
multi-select target does not auto populate References
changing Reference does not mutate Selection target
failure does not clear text/refs/receiver
```

---

# 1.7 T5 contract

T5 得到：

```text
text
target summary
ref chips
receiver
run phase
error
```

T5 不拥有 Draft persistence。

---

# 1.8 Rollback / blast radius

无 schema。

无 Core migration。

Blast radius：

```text
T3 interaction state only
```

`LOW`.

---

# 2. T3-C03-05 · Reference Pick + Run Reference Serialization

这张必须特别小心，因为 current source 里有**两种不同 ref 形状**：

```text
ReferenceController
→ generic { entityType, entityId }

Run API
→ OrderedRunReferenceV2
   { ref: union-specific id field, order, mode? }
```

不能把两者糊成同一 type。

---

# 2.1 Current exact source

## KEEP

```text
apps/web-gen2/src/interaction/referenceController.ts
```

已正确：

```text
ordered
dedup
Selection ≠ Reference
Composer open does not copy Selection
```

## Identity source

```text
apps/web-gen2/src/spatial/projectionBinding.ts
```

`ProjectionBindingRegistry.findNodeRef(...)` 可以：

```text
Huabu spatial node id
→ canonical-ish bound entityType/entityId
```

支持当前 binding entity types：

```text
artifact
conversation
skill
run
relation
note
scope
view
workspace
```

---

# 2.2 Exact new file · Pick session

## ADD

```text
apps/web-gen2/src/interaction/referencePickSession.ts
```

状态：

```ts
type ReferencePickSession =
  | { active: false }
  | {
      active: true;
      composerId: string;
    };
```

它**不保存 refs**。

Refs 继续只有：

```text
ReferenceControllerState
```

---

# 2.3 Pick path

Primary：

```text
Composer Reference button
→ start ReferencePickSession

click eligible canvas node
→ ProjectionBindingRegistry.findNodeRef(...)
→ canonical candidate
→ toggleReference(...)
→ Selection unchanged
```

Accelerator：

```text
Ctrl/Cmd click
→ same candidate resolution
→ same toggleReference
```

Shift：

```text
still wins as multi-select
```

Esc：

```text
Reference Pick OFF
Composer stays
Selection stays
Refs already picked stay
```

---

# 2.4 Run serialization cannot live in ReferenceController

Current Core transport：

```ts
OrderedRunReferenceV2
```

允许：

```text
artifact
view
scope
workspace
conversation
component
```

但 current ProjectionBinding type 还包括：

```text
skill
run
relation
note
```

同时最新 Phase B 已经把：

```text
Scope
```

收成 transient work boundary，不允许 T3 把旧 durable Scope transport capability重新解释成新产品 truth。

因此：

> **ReferenceController 只负责“用户选了哪些 canonical refs”；Run transport 另有 resolver。**

---

# 2.5 Exact new adapter

## ADD

```text
apps/web-gen2/src/interaction/runReferenceResolver.ts
```

接口：

```ts
export interface RunReferenceResolver {
  resolve(
    ref: EntityRefLike,
    order: number,
  ): Promise<OrderedRunReferenceV2 | null>;
}
```

它必须 fail-close。

---

# 2.6 New-UI emission policy

当前新 Gen2 UI：

### Can emit directly if identity sufficient

```text
artifact
→ { type:'artifact', artifactId }

view
→ { type:'view', viewId }

workspace/worksite-compat identity
→ only when upstream T2/T6 says current canonical Worksite
   still uses migrated Workspace identity
```

### Conversation

不能假设：

```text
ProjectionBinding.entityId
==
conversationSessionId
```

必须通过 Conversation identity bridge resolver。

只有拿到真实：

```text
conversationSessionId
```

才 emit：

```ts
{ type:'conversation', conversationSessionId }
```

### Legacy Scope

Core route仍接受：

```text
{ type:'scope', scopeId }
```

但：

> 这是 historical compatibility，不是 T3 新 UI 的 durable Scope feature。

新 T3 不从 transient Scope 自动产这个 transport ref。

### Skill / Run / Relation / Note

当前 `OrderedRunReferenceV2` 不直接支持这些 transport type。

T3：

```text
fail-close / unavailable as direct Reference
```

除非其它已冻结 Composer slot 有专门输入，例如 Skill slot。

**不得伪装成 artifact / component。**

这不重开产品语义，只诚实遵守 current contract。

---

# 2.7 Order preservation

`orderedReferences(state)`：

```text
index 0 → order 0
index 1 → order 1
...
```

resolver 不得：

```text
Set 去重后重排
按 entityType 排
按 canvas position 排
```

用户选择顺序就是 Run input semantics。

---

# 2.8 Tests

## KEEP / PATCH

`referenceController` existing tests。

## ADD

```text
apps/web-gen2/test/referencePickSession.test.ts
apps/web-gen2/test/runReferenceResolver.test.ts
```

必须测：

```text
pick does not change Selection
Esc only exits Pick
ordered refs preserve order
conversation without session identity fail-close
unsupported direct ref does not masquerade
legacy transient Scope not auto emitted
```

---

# 3. T3-C03-06 · Voice Transport + Text Merge

## 3.1 Goal

把：

```text
Mic
→ Record
→ POST existing Core transcription
→ editable transcript
```

接通。

绝不：

```text
auto Run
打开独立 Voice Workbench
暴露 provider controls
```

---

# 3.2 Exact current files

## Core

```text
apps/local-core/src/routes/voice-transcription.ts
packages/contracts/src/voice-transcription.ts
```

Endpoint：

```text
POST /runtime/voice/transcriptions
multipart/form-data
```

## Web transport gap

```text
apps/web-gen2/src/backend/client.ts
```

current：

```text
body → JSON.stringify
Content-Type application/json
```

---

# 3.3 Exact HttpClient thin patch

## MODIFY

```text
apps/web-gen2/src/backend/client.ts
```

不要建 `VoiceHttpClient` 第二 transport stack。

给 `RequestOptions` 加：

```ts
rawBody?: BodyInit;
```

并使：

```text
body
rawBody
```

互斥。

建议 internal：

```ts
private resolveHeaders(opts) {
  JSON body
  → Content-Type application/json

  rawBody
  → NO automatic Content-Type
}

private requestCore(...) {
  body =
    rawBody !== undefined
      ? rawBody
      : body !== undefined
        ? JSON.stringify(body)
        : undefined
}
```

如果：

```text
body + rawBody
```

同时出现：

```text
throw programmer error
```

不要猜。

---

# 3.4 Why `rawBody`, not generic content-type mode

因为这条 seam 以后还可正确承载：

```text
FormData
Blob
ArrayBuffer-compatible BodyInit
```

但它仍只是 transport。

不要发展成：

```text
upload manager
attachment state
progress manager
```

---

# 3.5 Exact Voice client

## ADD

```text
apps/web-gen2/src/backend/voice.ts
```

使用共享：

```ts
VoiceTranscriptionResponseV1
```

建议：

```ts
export interface VoiceTranscriptionInput {
  audio: Blob;
  filename?: string;
  durationMs?: number;
  language?: string;
  prompt?: string;
  timestamps?: boolean;
}

export class CoreVoiceClient {
  constructor(private readonly http: HttpClient) {}

  transcribe(
    input: VoiceTranscriptionInput,
    signal?: AbortSignal,
  ): Promise<VoiceTranscriptionResponseV1>
}
```

构造 FormData：

```text
file
durationMs?
language?
prompt?
timestamps?
```

### DO NOT expose

```text
providerId
```

为普通 Composer UI field。

Core route虽然支持 providerId，但产品冻结不是 provider chooser。

只有未来内部诊断/explicit system policy 需要时再注入，不进普通 Voice UI。

---

# 3.6 Core envelope

Voice route返回：

```text
{ ok:true, value: VoiceTranscriptionResponseV1 }
```

所以：

```text
CoreVoiceClient
→ coreRequest(... rawBody: formData ...)
```

继续复用：

```text
CoreApiError
retryable
ABORTED
UNAVAILABLE
```

---

# 3.7 Exact pure text merge

## ADD

```text
apps/web-gen2/src/interaction/voiceTextMerge.ts
```

输入：

```ts
{
  text: string;
  transcript: string;
  selectionStart?: number;
  selectionEnd?: number;
  hasActiveCaret: boolean;
}
```

输出：

```ts
{
  text: string;
  caret: number;
}
```

冻结：

```text
selectionStart != selectionEnd
→ replace selection

active caret
→ insert at caret

no active caret/selection
→ append
```

必须保留 transcript 原文，不自动 send。

---

# 3.8 Voice transient phase

Voice phase不进入 Core：

```text
idle
recording
transcribing
error
```

可放在 Composer projection/controller transient state。

它不是 Composer text canonical owner。

Stop recording：

```text
transcribe
→ merge text
→ voice phase idle
```

Cancel recording：

```text
discard audio
→ draft untouched
```

Abort transcription：

```text
draft untouched
→ recoverable error
```

---

# 3.9 Tests

## PATCH

`apps/web-gen2/test/core-clients.test.ts`

现有 helper 假定：

```text
body 是 JSON
```

Voice test不能硬塞进去造成 helper 偷 parse FormData。

新增独立 fetch stub：

```text
assert init.body instanceof FormData
assert no manual multipart Content-Type
assert Authorization preserved
```

## ADD

```text
apps/web-gen2/test/voiceTextMerge.test.ts
```

必须测：

```text
replace selected text
insert at caret
append without active caret
empty transcript no damage
unicode caret positions follow JS string indexing contract
```

---

# 3.10 Browser acceptance

```text
select some Composer text
→ mic record
→ stop
→ transcript replaces selected text

caret in middle
→ transcript inserts there

blur textarea before voice
→ transcript appends

transcription fails
→ old draft unchanged
→ References unchanged
→ no Run created
```

---

# 4. T3-C03-07 · Receiver + Run Typed Clients

## 4.1 Goal

只补：

```text
typed HTTP client
```

不把 Run / Receiver塞进 `Gen2Host` mega facade。

Current source `createLcosHostRuntime.ts` 已经明确要求：

> 按功能 dock 拆 client，Host 不扩成 199 methods monolith。

---

# 4.2 Receiver exact client

## ADD

```text
apps/web-gen2/src/backend/receiver.ts
```

直接 import shared contract：

```ts
ConnectedConversationV1
ProjectReceiverBindingV1
```

最小 API：

```ts
export class CoreReceiverClient {
  listConnectedConversations(projectId, signal?)
  getReceiverBinding(projectId, signal?)
  setReceiverBinding(projectId, connectedConversationId, signal?)
}
```

普通 Composer 当前**不需要**：

```text
create connected conversation
disconnect conversation
handoff prepare/consume
```

除非对应 UI consumer 已存在。

不要因为 route 有，就全部包一遍。

---

# 4.3 Receiver projection helper

## ADD

```text
apps/web-gen2/src/interaction/receiverResolution.ts
```

纯函数，不网络。

输入：

```text
connected conversations
project active receiver binding
composer receiver override?
initiating Glyth conversation id?
```

输出：

```ts
type ReceiverResolution =
  | {
      kind:'resolved';
      conversation: ConnectedConversationV1;
      source:'glyth'|'override'|'project-active';
    }
  | {
      kind:'needs-choice';
      candidates: readonly ConnectedConversationV1[];
    }
  | {
      kind:'invalid';
      reason:string;
    };
```

冻结优先：

```text
explicit per-run override
→ first

Glyth-initiated target context
→ its own Conversation

ordinary object
→ Project Active Receiver

none
→ explicit chooser
```

这里不猜 provider。

---

# 4.4 Receiver link fail-close

`ConnectedConversationV1`：

```text
conversationSessionId?: string
```

当前 Run source注释已经明确：

```text
unlinked Glyth should fail-close
```

所以 Composer Send 前：

```text
selected receiver has no resolvable conversation identity
→ do not silently pick another receiver
→ do not fabricate session
```

具体 current client至少能确认：

```text
ConnectedConversation exists
```

若对应业务路径要求 `conversationSessionId`，resolver必须诚实失败。

---

# 4.5 Run exact client

## ADD

```text
apps/web-gen2/src/backend/runs.ts
```

直接复用 shared：

```ts
RunReview
OrderedRunReferenceV2
RunReceiverRefV1
```

最小 T3 API：

```ts
createRun(projectId, input, signal?)
dispatchRun(runId, signal?)
recoverRun(runId, signal?)
cancelRun(runId, signal?)
getRunReview(runId, signal?)
getRunEvents(runId, after?, signal?)
```

不要包：

```text
proposal
handoff zip
validate-plan
text-artifacts
artifact accept/reject
```

那些不属于 Compact Composer minimum data plane。

---

# 4.6 Web client input must mirror real route, not invent new DTO

建议：

```ts
export interface CreateComposerRunInput {
  instruction: string;
  outputIntent: 'create'|'revise'|'analyze';

  targetArtifactId?: string;
  targetRevisionId?: string;
  contextArtifactIds?: readonly string[];
  workspaceId?: string;
  savedContextId?: string;

  receiverRef?: RunReceiverRefV1;
  orderedReferences?: readonly OrderedRunReferenceV2[];
  resultSlotId?: string;

  resultPolicy?: RunResultPolicy;
  requestedProvider?: 'workbuddy'|'codex'|'auto';
}
```

不需要 ordinary T3 UI 暴露：

```text
requestedProvider
```

它只允许内部 serializer 填。

---

# 4.7 Exact Receiver → Provider coherence rule

如果 Receiver resolved：

```ts
conversation.provider === 'codex'
```

Run request内部：

```ts
receiverRef = {
  connectedConversationId: conversation.id
}

requestedProvider = conversation.provider
```

如果：

```text
Project Active Receiver = workbuddy conversation
```

同理。

用户 UI：

```text
只显示 Conversation/Glyth identity
```

不显示 provider selector。

这条必须 unit test。

---

# 4.8 Do not send `sessionId` from ordinary Composer

Current Core明确：

```text
receiverRef
→ Core resolves identity bridge

sessionId 与 receiverRef 同时存在时
→ explicit sessionId priority
```

所以普通 T3 Composer不要：

```text
自己从 node/ref 猜 sessionId
```

直接只发：

```text
receiverRef
```

让 Core owner处理。

---

# 4.9 Tests

在：

```text
apps/web-gen2/test/core-clients.test.ts
```

新增：

```text
receiver list exact path
receiver binding exact path
set receiver binding exact body

run create exact path/body
run dispatch exact path
run recover exact path
run cancel exact path
run review exact path
```

以及：

```text
receiver/provider coherence
per-run receiver does NOT call setReceiverBinding
```

---

# 5. T3-C03-08 · Run Submission + Failure / Stop / Recovery

这是 Composer data plane 最后一张关键卡。

---

# 5.1 Goal

让 Send 真正变成：

```text
validate draft
→ resolve Receiver
→ serialize References
→ resolve target execution fields
→ create Run
→ dispatch Run
→ track state
```

同时保证：

```text
失败不丢 draft
Stop 不丢 draft
dispatch 失败不重复 create Run
```

---

# 5.2 Exact new file

## ADD

```text
apps/web-gen2/src/interaction/runSubmission.ts
```

它是 pure planning + small orchestrator seam。

不能成为：

```text
Run store
network cache
Provider manager
Target taxonomy registry
```

---

# 5.3 Target execution fields must be injected

Run route要求：

```text
outputIntent
targetArtifactId?
targetRevisionId?
resultPolicy?
resultSlotId?
```

这些并不全部属于 T3。

因此定义：

```ts
export interface ComposerExecutionPlan {
  readonly outputIntent: 'create'|'revise'|'analyze';
  readonly targetArtifactId?: string;
  readonly targetRevisionId?: string;
  readonly contextArtifactIds?: readonly string[];
  readonly workspaceId?: string;
  readonly savedContextId?: string;
  readonly resultPolicy?: RunResultPolicy;
  readonly resultSlotId?: string;
}

export interface ComposerExecutionPlanResolver {
  resolve(
    target: ComposerTargetSnapshot,
  ): Promise<ComposerExecutionPlan>;
}
```

这个 resolver由真正 target owner注入。

T3不维护：

```text
Artifact / Workflow / Assembly / Skill / MultiSelection
巨大 if/else 表
```

---

# 5.4 Exact submission planning

纯函数：

```ts
buildComposerRunRequest({
  draft,
  executionPlan,
  receiver,
  orderedRunReferences,
})
```

输出：

```text
CreateComposerRunInput
```

要求：

```text
instruction = draft.text
receiverRef = selected connected conversation
requestedProvider = selected conversation.provider
orderedReferences = ordered serialized refs
```

不得：

```text
Selection 自动塞 contextArtifactIds
Reference 自动变 Relation
Receiver choice 改 Project Active Receiver
```

---

# 5.5 Exact async orchestration

建议：

```ts
submitComposerRun(...)
```

流程：

### P0 · preflight

```text
trim instruction
empty
→ local invalid
→ no network

resolve receiver
needs-choice
→ stop
→ open explicit chooser

resolve refs
any unsupported/unbound
→ fail-close
→ no Run

resolve target execution plan
invalid
→ fail-close
```

---

### P1 · create

先：

```text
draft.runPhase='submitting'
```

调用：

```text
POST /projects/:id/runs
```

如果 create 失败：

```text
runPhase='failed'
activeRunId absent
draft text KEEP
refs KEEP
receiver KEEP
```

用户 Retry：

```text
重新 create
```

---

### P2 · create succeeded

一旦 Core 返回：

```text
RunReview
run.id
```

立即记录：

```text
activeRunId = review.run.id
```

**这一刻以后严禁因 dispatch failure 重建 Run。**

---

### P3 · dispatch

```text
runPhase='dispatching'
POST /runs/:id/dispatch
```

成功：

```text
runPhase='running'
```

---

### P4 · dispatch failed

```text
runPhase='failed'
activeRunId KEEP
draft KEEP
```

此时 Retry 不能：

```text
POST createRun again
```

应：

```text
GET RunReview
→ 按 current Run capability/status
→ existing dispatch/recover path
```

避免 duplicate Run。

---

# 5.6 Why create + dispatch must be two explicit phases

Current `RuntimeApplicationService.create()`：

```text
creates Run
creates RuntimeDispatch(status='planned')
emits run.queued
returns RunReview
```

它**没有**在 create 内直接调用 provider dispatch。

所以 Send 不能只：

```text
POST /projects/:id/runs
```

然后假装任务已经开始执行。

必须：

```text
create
→ dispatch
```

这是 current source 事实。

---

# 5.7 Stop

用户 Stop：

```text
if activeRunId
→ POST /runs/:id/cancel
```

UI：

```text
runPhase='stopping'
```

返回：

```text
idle or failed/cancelled presentation
```

但：

```text
draft text KEEP
References KEEP
receiver override KEEP
```

Stop 不等于 Clear Draft。

---

# 5.8 Recovery

有 `activeRunId` 的错误：

```text
never re-create first
```

优先：

```text
getRunReview(activeRunId)
```

然后根据现有 Core状态/capabilities走：

```text
recover
dispatch if still valid and never dispatched
or show non-retryable failure
```

T3 不通过字符串猜状态。

---

# 5.9 Submitted snapshot

`submitComposerRun()` 在网络调用前生成：

```ts
SubmittedComposerSnapshot
```

只读：

```text
text
target
serialized refs
receiver id
execution plan
```

目的：

```text
network期间用户可能继续编辑 draft
```

正在运行的 Run 必须绑定：

```text
send 时的冻结 snapshot
```

不能读后续修改后的 textarea。

这条非常重要。

---

# 5.10 Success clearing policy

C1-S3B **不擅自冻“Send 成功后 textarea 是否立刻清空”**。

源码层只保证：

```text
submission reads immutable snapshot
errors never mutate current draft
```

最终：

```text
success 后清空 / 保留 / 进入 next-turn draft
```

由已冻结 UX projection / T5最终方案回填。

这样不会为了“看起来像 Chat”提前制造产品行为。

---

# 5.11 Tests

## ADD

```text
apps/web-gen2/test/runSubmission.test.ts
apps/web-gen2/test/receiverResolution.test.ts
```

必须测：

```text
empty instruction no network
receiver override wins
Glyth receiver uses its own conversation
ordinary target falls back Project Active Receiver
no receiver → needs explicit choice
per-run receiver does not change active binding

Codex receiver
→ requestedProvider codex

WorkBuddy receiver
→ requestedProvider workbuddy

create failure
→ draft intact
→ no runId

create success + dispatch failure
→ runId retained
→ retry does not create second Run

Stop
→ cancel existing run
→ draft intact

Reference order preserved into request

Submission snapshot stays immutable
when user edits textarea during request
```

---

# 5.12 Real browser acceptance

### BA-15 Composer draft persistence

```text
open object Composer
type text
close projection
reopen same target
→ same draft
```

### BA-16 local ↔ Work View

```text
local draft exists
promote same target to Work View
→ one draft
→ no duplicate text state
```

### BA-17 Reference

```text
pick B as ref while target A selected
→ A remains target
→ B enters ordered chip
```

### BA-18 Voice

```text
record / stop
→ transcript merges at real caret/selection
→ no auto Run
```

### BA-19 Receiver

```text
choose different Conversation for this Run
→ send
→ Project Active Receiver unchanged
```

### BA-20 No Receiver

```text
ordinary object
no Project Active Receiver
no initiating Glyth
→ explicit Receiver chooser
→ no guessed Run
```

### BA-21 Run create/dispatch

```text
Send
→ create
→ dispatch
→ running state
Canvas remains usable
```

### BA-22 dispatch error

```text
Run created
dispatch fails
→ draft remains
→ retry does not create second Run
```

### BA-23 Stop

```text
running
→ Stop
→ existing run cancel
→ draft/ref/receiver state retained
```

---

# 6. Exact file list for C1-S3B

## MODIFY

```text
apps/web-gen2/src/backend/client.ts
apps/web-gen2/src/index.ts
apps/web-gen2/test/core-clients.test.ts
```

## KEEP / CONSUME

```text
apps/web-gen2/src/interaction/referenceController.ts
apps/web-gen2/src/spatial/projectionBinding.ts

packages/contracts/src/receiver.ts
packages/contracts/src/run-assembly.ts
packages/contracts/src/voice-transcription.ts

apps/local-core/src/routes/runs.ts
apps/local-core/src/routes/receiver.ts
apps/local-core/src/routes/voice-transcription.ts
apps/local-core/src/runtime-application-service.ts
```

## ADD

```text
apps/web-gen2/src/backend/runs.ts
apps/web-gen2/src/backend/receiver.ts
apps/web-gen2/src/backend/voice.ts

apps/web-gen2/src/interaction/composerDraft.ts
apps/web-gen2/src/interaction/composerDraftRegistry.ts
apps/web-gen2/src/interaction/referencePickSession.ts
apps/web-gen2/src/interaction/runReferenceResolver.ts
apps/web-gen2/src/interaction/voiceTextMerge.ts
apps/web-gen2/src/interaction/receiverResolution.ts
apps/web-gen2/src/interaction/runSubmission.ts

apps/web-gen2/test/composerDraft.test.ts
apps/web-gen2/test/referencePickSession.test.ts
apps/web-gen2/test/runReferenceResolver.test.ts
apps/web-gen2/test/voiceTextMerge.test.ts
apps/web-gen2/test/receiverResolution.test.ts
apps/web-gen2/test/runSubmission.test.ts
```

---

# 7. Export patch

## MODIFY

```text
apps/web-gen2/src/index.ts
```

只 export：

```text
public typed clients
pure interaction types/functions
```

不要 export：

```text
internal mutable Map implementation details
debug-only state
raw Core route internals
```

`ComposerDraftRegistry` 是否 public export：

```text
YES only if React host must instantiate it directly
```

否则未来 host composition wrapper内部创建。

---

# 8. Construction order

建议 Codex 真施工顺序：

```text
STEP 1
HttpClient rawBody support
+ tests

STEP 2
CoreVoiceClient
CoreReceiverClient
CoreRunClient
+ client tests

STEP 3
voiceTextMerge
+ pure tests

STEP 4
composerDraft
composerDraftRegistry
+ pure tests

STEP 5
referencePickSession
runReferenceResolver
+ tests

STEP 6
receiverResolution
+ tests

STEP 7
runSubmission
+ create/dispatch/recovery tests

STEP 8
index exports

STEP 9
typecheck
web-gen2 full tests

STEP 10
browser BA-15 → BA-23
```

---

# 9. Migration / Legacy handling

## No database migration

这一批：

```text
没有新 canonical schema
没有新 Core table
没有新 persistent UI store
```

---

## Legacy transport compatibility

Current Core仍接受：

```text
OrderedRunReferenceV2.scope
workspace
```

T3 新 UI：

```text
不因为 transport 仍接受 legacy ref
就重新创造 legacy 产品语义
```

也就是说：

```text
READ old records honestly
EMIT only current resolvable refs
```

---

## Provider hidden, not deleted

Current Core仍需要：

```text
requestedProvider
```

T3不是删除它。

而是：

```text
user chooses Conversation
→ internally derive provider from that Conversation
```

所以：

```text
product UI providerless
engineering transport provider-aware
```

两层不矛盾。

---

# 10. Failure matrix

| Failure | Core mutation? | Draft | RunId | Retry |
|---|---:|---|---|---|
| Empty prompt | No | keep | none | edit |
| Ref unresolved | No | keep | none | fix/remove ref |
| Receiver missing | No | keep | none | choose receiver |
| Voice upload fails | No Run | keep | none | retry voice / type |
| Run create fails | No successful Run | keep | none | create again |
| Run create succeeds, dispatch fails | Run exists | keep | **keep** | recover/dispatch existing |
| Run execution fails | Run exists | keep / submitted snapshot available | keep | Core retry/recover |
| Stop/cancel | Run exists | keep | keep | new explicit action |
| Network abort | depends phase | keep | preserve if already created | phase-aware |

这张表是后续恢复验收核心。

---

# 11. Blast radius

## HttpClient rawBody

`LOW-MEDIUM`

原因：

```text
shared transport path
```

所以必须：

```text
existing JSON tests全绿
FormData new test全绿
```

---

## New typed clients

`LOW`

独立增量。

---

## Composer Draft Registry

`LOW-MEDIUM`

会成为 local / Work View 共享 draft owner，但无 canonical data。

---

## Run Submission

`MEDIUM`

因为涉及真实 Run create/dispatch/cancel。

但：

```text
全部使用现有 Core routes
不改 schema
不改 RuntimeApplicationService
```

---

# 12. Architecture Conflict Gate Result

本轮发现的最值得注意问题：

```text
Receiver provider 与 Run default provider 可能不一致
```

Current source：

```text
Run no requestedProvider
→ defaults workbuddy
```

但：

```text
ConnectedConversation already exposes provider
```

因此可通过：

```text
runSubmission thin serialization
```

无损解决。

所以：

```text
ARCHITECTURE CONFLICT = 0
COORDINATOR ESCALATION = NO
```

---

# 13. No-go list

本批禁止：

```text
new Voice backend
new Run API
new Receiver store as canonical truth
Provider dropdown in ordinary Composer
Selection auto→Reference
Reference Controller directly serializes all Core entity types by guessing
sessionId guessed from node id
dispatch failure → create second Run
Stop → clear draft
Work View → clone Composer draft
HttpClient → grow into upload/cache/session manager
```

---

# 14. C1-S3B Done Checklist

- [x] Composer Draft owner exact file
- [x] same-target local/WorkView shared draft rule
- [x] Reference Pick exact transient owner
- [x] ProjectionBinding remains identity gate
- [x] Run Reference transport resolver separated from Reference state
- [x] legacy Scope transport not promoted back to product truth
- [x] Voice Core route verified
- [x] FormData transport thin seam defined
- [x] Voice text merge exact rule
- [x] Receiver shared contracts verified
- [x] Run current route inputs verified
- [x] create + dispatch two-phase source fact captured
- [x] per-run Receiver vs Project Active Receiver preserved
- [x] Receiver→provider internal coherence patch defined
- [x] no ordinary Provider UI
- [x] failure keeps draft
- [x] dispatch failure keeps existing runId
- [x] Stop preserves draft
- [x] immutable submitted snapshot defined
- [x] tests defined
- [x] browser acceptance defined
- [x] rollback/migration/blast radius defined
- [x] Architecture Conflict = 0

---

# 15. Next

下一小步：

# `C1-S3C · Semantic Drag Plane`

正式拆：

```text
T3-C03-09 semanticDropMachine Phase-C migration
T3-C03-10 Left Semantic Give observation seam
T3-C03-11 Right Carry recognizer + proxy
T3-C03-12 SemanticTargetAdapter / target receipt
T3-C03-13 Relation Handle cleanup
```

这是 T3 最大的 pointer / spatial blast-radius 批次。

所以仍然保持小步，不和 Work View safeRect 混在一起做。

# LCOS Gen2 剩余施工 Patch 审计

> 基线：`frontend-reconstruction-v2@b5784bb894bf1e328a06385ceebf6e568e665c44`
> Patch：`LCOS_Gen2_剩余施工Patch_20260915.patch`
> 结论：**不要整包 push。应拆分；其中一组必须尽快补进远端，一组可继续施工，一组必须拦住重做。**

## 1. P0：当前远端已经缺了一块必须补的 frontend 依赖

最新远端的：

`huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx`

已经：

```ts
import {
  resolveGlythPresentation,
  type GlythPresentationPose,
} from '@local-creative-os/web-gen2';
```

但当前远端：

- `apps/web-gen2/src/presentation/glythPresentation.ts` 不存在；
- `apps/web-gen2/src/index.ts` 也没有导出 `resolveGlythPresentation`。

而本 patch 正好新增这两部分。

因此这不是“未来 helper”，而是最新 push 遗漏的直接依赖。应优先拆出来补进远端，并跑：

```text
web-gen2 typecheck/test
huabu typecheck/test
production build
```

至少应包含：

- `apps/web-gen2/src/presentation/glythPresentation.ts`
- `apps/web-gen2/test/glyth-presentation.test.ts`
- `apps/web-gen2/src/index.ts` 中对应 export

是否把 `nodeHostPresentation.ts` 同一批带入，取决于下面的 projection/Figma geometry 组是否一起提交。

---

## 2. P0：Agentlet transport 当前实现方向接反，禁止 push

Patch 中 `HuabuAgentletGatewayTransportV1` 做了：

```text
Local Core
→ WebSocket ?role=agentlet
→ agentlet/hello
→ 再主动发送 server/list / server/spawn / server/stop / server/sendResource
```

但 Huabu vendored Agentlet 的真实协议与 daemon 实现是：

```text
Agentlet daemon
→ 连接 Gateway，role=agentlet
→ daemon 主动发送 agentlet/hello

Gateway / Host
→ daemon 发送 server/spawn / server/stop / server/list / server/sendResource
```

也就是说当前 patch 把“daemon 端连接身份”和“host 端控制命令”揉成了同一个客户端。

当前测试之所以能绿，是 mock server 按这套反向假设编的，因此不能证明真实 Gateway 兼容。

### 另外还有一个明显语义问题

patch：

```ts
destination: `${params.sessionId}:${params.resourceRef ?? 'prompt'}`
```

而真实 Agentlet `server/sendResource` 的 `destination` 是 daemon 要写入的文件路径，并支持 `${ENV_VAR}` 路径解析。

所以 `sessionId:prompt` 并不是协议要求的资源目标；Windows 下甚至可能直接成为非法/错误路径语义。

### 这个子集先全部拦住

暂时不要 push：

- `apps/local-core/src/huabu-agentlet-gateway-transport.ts`
- `apps/local-core/tests/huabu-agentlet-gateway-transport.test.ts`
- `compose.ts` 中依赖这套错误连接模型的 Agentlet wiring

### 我还缺的一份材料

如果 Huabu Gateway 的**服务端实现不在当前 LCOS_Gen2 仓库**，请给我：

```text
接收 /api/bridge 或 /api/acp/agent WebSocket 的 Gateway server 源码
尤其是：
- role=agentlet 的 connection handler
- agentlet/hello 注册逻辑
- host 如何发送 server/spawn/list/stop/sendResource
- session/control channel 的真实 API
- 对应 upstream repo + commit（如果有）
```

有这份，我可以把 Local Core 应该接在哪一侧直接定死，不再猜协议。

---

## 3. P0：`pnpm-workspace.yaml` 是误生成文件，删除

Patch 新建：

```yaml
allowBuilds:
  esbuild: set this to true or false
```

这个明显还是交互式工具生成的占位文本。

而当前 Gen2 根仓库本身采用：

- npm workspaces
- `package-lock.json`
- root `npm run ... --workspace`

所以：

```text
pnpm-workspace.yaml → 不要提交，直接丢掉
```

反过来，下面两个改动是合理的：

- `package.json` 增加 `playwright-core`
- `package-lock.json` 同步

因为现有 `scripts/e2e/_harness.mjs` 已经真实：

```js
import { chromium } from 'playwright-core';
```

之前只是根 package 没明确声明依赖。

---

## 4. P1：Projection “部分失败继续”方向可以，但 Runner 还缺完成语义

Patch 对投影做了合理改进：

```text
A 成功
B 失败
→ 不撤销 A
→ 下一次 reconcile 只重试 B
```

并且 `figma-projection-geometry.test.ts` 已覆盖“第二次重试不重复创建 A”。

这个方向保留。

问题在更上一层 `ReconciliationRunner`：

```ts
try {
  artifactBindings = await projectArtifacts(...)
} catch {
  console.warn(...)
}
```

以及 relation / orphan cleanup 都改成：

```text
失败 → console.warn → 整个 reconcile 正常返回
```

具体失败场景：

```text
某一个 artifact 持续因 node type / RFS 冲突无法投影
→ 其它对象成功
→ Runner resolve
→ 调用方看起来 reconciliation 成功
→ 失败对象只在 console.warn 中存在
→ 如果没有下一次 lifecycle trigger，它会长期缺席
```

因此在推这一组前至少需要补一项证据，二选一即可：

1. 证明 HostLifecycleReconciler 对 partial failure **一定会重新调度**，并加 runner-level 测试；
2. 或让现有 reconciliation result 能反映 degraded/failed item 数量，调用方据此再调度。

不需要新造一套状态系统，关键是不能“页面少了一块但系统返回成功”。

---

## 5. P1：Continuation CAS 改造总体是对的，但 `core_bind` 还有一个真实并发裂缝

这批 continuation 改动里值得保留的包括：

- `operationId` 跨 project 冲突检查；
- identical submit 幂等 vs idempotency conflict；
- provider 一致性检查；
- side-effect 前 claim；
- revision CAS；
- cancel claim；
- external evidence 校验；
- unknown 不再错误收敛成“外部不存在”。

但 `#recoverBind()` 当前顺序仍可能出现：

```text
claim core_bind
→ assertCurrentRevision
→ rebindConnectedConversationRef()   // 已修改 canonical Core binding
→ advanceStep(... expectedRevision)  // CAS journal
```

若 assert 后、rebind 前后有另一个合法 journal 写入：

```text
ConnectedConversation 已经被 rebind
但 journal 的 core_bind completion CAS 失败
```

最终 Core canonical conversationRef 与 continuation journal 不一致。

这里是一个**具体的跨两张持久化记录的一致性失败场景**，普通单测/CAS 只保护 journal 本身不够。

建议把：

```text
connected_conversation rebind
+
core_bind journal confirmed
```

放进同一个 SQLite transaction/CAS helper。

这不是为了“多加安全层”，而是当前两次独立写确实存在中间态泄露窗口。

---

## 6. UX / Figma projection 组：大部分可以保留，但要作为独立提交

建议单独一组审核/提交：

- `presentation/visualFamily.ts`
- `presentation/nodeHostPresentation.ts`
- `spatial/projectToSpaceProjection.ts`
- `spatial/reconciliationRunner.ts`
- `host/projectionFacade.ts`
- 对应 tests
- `real-dev-project.ts` 的 e2e fixture
- `nodeCommandModel.ts` 的 Core-bound text / compose / delete rule

这组里目前看到的方向基本成立：

### 可保留

- MIME 优先于 artifact kind 做 presentation family；
- MIME 去掉 `; charset=...`；
- selected ArtifactView / revision 不再依赖 API 数组顺序；
- workspace scope-aware view selection；
- Figma preset 只作用于**新投影**，已有 Huabu geometry 不覆盖；
- audio 因 Huabu agent CREATE_NODES 不支持 audio，先用 neutral note host，但 presentation family 仍保持 audio；
- Core-bound text 才由 Arc 接管；unbound text 继续 native；
- Core-bound node 禁止本地 delete，避免 reconcile 后幽灵复生；
- real-dev 不再自动把 Main / Context / Workflow root workspace 写进 Railway。

### 不能过度写完成

`nodeHostPresentation.ts` 中：

```ts
resolveLcosNodeHostPresentation()
```

当前 patch 里没有新的 production caller。

如果它只是为后续 Huabu NodeWrapper 视觉宿主准备，可以保留为 helper，但 ledger/handoff 不能把“host surface 已接管”写成完成。

`glythPresentation.ts` 的 `resolveGlythPresentation()` 则不同：最新远端已经有真实 caller，所以它是必须补的依赖。

---

## 7. Docs 的处理

文档纠偏本身大多是在把此前过度乐观的状态改诚实，例如：

- Railway 不再写“三现场真实切换”；
- ChatPanel → ConversationWorkView 改为 PARTIAL；
- Reader 改 ADAPTED 而非完成；
- Professional Stage 明确 dock/group 仍 GAP。

这些修改方向正确。

但建议在源码拆分完成后再提交 docs，使 Git 历史保持：

```text
code/fix
→ tests
→ docs status
```

而不是 docs 先声称某状态，再靠后续 commit 补源码。

---

## 8. 建议拆成 4 组

### A. 立即补远端完整性

优先：

```text
glythPresentation.ts
index.ts export
glyth-presentation.test.ts
```

然后 typecheck/build。

这是修当前 `b5784bb` 已存在的 unresolved import。

### B. UX / Figma / projection

单独提交：

```text
visualFamily
nodeHostPresentation
projectToSpaceProjection
reconciliationRunner
projectionFacade
nodeCommandModel
real-dev fixture
相关 tests
playwright-core package declaration
```

但先补 Runner partial-failure 的 lifecycle/retry 证据。

### C. Continuation concurrency

保留 CAS / claim 方向，先修：

```text
core_bind canonical rebind + journal completion 原子化
```

再单独提交。

### D. Agentlet Gateway

**当前不提交。**

拿到真实 Gateway host-side 源码后重新接。

---

## 9. 当前最终裁决

| Patch 区域 | 裁决 |
|---|---|
| Glyth presentation helper + export | **P0 必须尽快 push，当前远端已经引用它** |
| UX Runtime docs 修正 | 可留，源码后提交 |
| Figma geometry / MIME / selected revision | 基本可留 |
| Core-bound Text / Compose / Delete rule | 基本可留 |
| Projection partial retry | 机制可留，Runner 需再补一层证据 |
| Continuation CAS / claim | 方向正确，core_bind 原子性需修 |
| Agentlet Gateway transport | **BLOCK，协议角色接反** |
| Agentlet transport mock tests | **BLOCK，mock 固化了错误方向** |
| `pnpm-workspace.yaml` | **删除，不提交** |
| `package.json` + lock 的 playwright-core | 保留 |

## 10. 目前需要你补给我的东西

只缺一类真正影响判断的资料：

> **Huabu Gateway host/server-side 源码或对应 upstream repo + exact commit**，即接收 Agentlet WebSocket、持有 daemon connection、向 daemon 发 `server/*` 指令的那一侧。

其它 UX / Figma / projection 部分，当前 GitHub + patch 已经够我继续审，不需要再补材料。

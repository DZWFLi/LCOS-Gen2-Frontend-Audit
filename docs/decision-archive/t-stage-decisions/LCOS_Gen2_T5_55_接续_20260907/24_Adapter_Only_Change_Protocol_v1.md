# Adapter-only Change Protocol v1

## 目的

把 LCOS 语义接到 Huabu 成熟 host，同时禁止重写 donor mechanics。本文是变更提案草案，不是实现授权。

## 1. 变更原因

当前 LCOS 根 `apps/web` 是 Prototype，Huabu 成熟 Node/Preview/Canvas 栈尚未接入。为了达到 Gen2 morphology 与功能完整度，需要选择 Huabu-as-host 或受限移植路径；不应在 Prototype 上 中复刻 Huabu。

## 2. 变更前流程

```text
Prototype CanvasNode fixture/local UI state
→ ProjectCanvas / CanvasNodeVisual
→ generic visual bodies
→ partial Local Core projection
```

问题：前端模型与 domain 并存；真实物种 body、Preview、LOD、PDF、Milkdown、Web reader、Frame engine 未进入 current root host。

## 3. 变更后目标流程

```text
Local Core canonical query
→ LCOS read adapter
→ Huabu node/view model
→ Huabu Canvas + NodeWrapper + species bodies + Preview Workspace

Huabu UI intent
→ LCOS command adapter
→ contracts/local-core command
→ canonical persistence
→ refreshed projection
```

Huabu 负责 mechanics；LCOS 负责 truth。adapter 不拥有第二份 Project Graph。

## 4. 用户操作变化

- 主操作语言保持冻结：选择、resize、Preview、Command、Run、Return；
- 内容节点变为真实 species body，而非 generic Prototype card；
- Preview/Work View 使用 Huabu 成熟宿主；
- missing/stale/pending/review 由 LCOS canonical state 投影到现有 visual seams；
- 不擅自改变 `C`、Cmd/Ctrl+Enter、双击、Enter、Esc、Inspector 等冻结交互。

## 5. 数据流变化

只新增两类薄边界：

```text
Read adapter:
Artifact + ArtifactView + Revision + Run state
→ Huabu CanvasNodeData / geometry / decoration

Command adapter:
Huabu move/resize/open/drop/edit intents
→ LCOS Repository/Runtime/Version commands
```

不允许 Huabu localStorage/node sidecar 绕过 LCOS Local Core 写 canonical truth。

## 6. Adapter 最小集合

| Adapter | 输入 | 输出 | 不拥有 |
|---|---|---|---|
| ArtifactNodeProjection | Artifact/Revision/View | Huabu node type/data/style | file/revision lifecycle |
| AvailabilityProjection | available/missing/stale | existing banner/decoration | watcher/hash truth |
| GeometryCommandAdapter | drag/resize batch | move/resize ArtifactView command | viewport/selection store |
| PreviewEntityAdapter | node/view/revision | existing Preview open target | second entity |
| NoteContentAdapter | Markdown/Revision | Note data/edit patches | second Markdown truth |
| PdfFragmentAdapter | page/rect event | Note/Fragment command | PDF renderer |
| WebSourceAdapter | URL/snapshot/reader metadata | Web node/preview inputs | fetch/sandbox runtime |
| RunVisualProjection | Run/Return/Revision status | decoration/zone props | Run state machine |
| FrameScopeAdapter | Scope/membership | Frame parent/layout inputs | layout engine |

名称均为职责描述，不要求照此创建九个文件；能合并就合并，避免 adapter 平台化。

## 7. 影响模块

若选择 Huabu-as-host，预计影响：

- `apps/web` App Shell、Canvas composition、UI store boundary；
- `packages/domain` 的 kind/fragment/view display mapping；
- `packages/contracts` query/command DTO；
- `apps/local-core` projection/query/command endpoints；
- Huabu source integration strategy 与依赖/lockfile；
- browser tests、runtime smoke 与 packaging。

这是重大变更，必须分 Sprint，不允许以“换皮”名义一次性落入。

## 8. Schema / contract 决策

实现前必须冻结：

1. ArtifactKind 是否增加 web/video/audio；
2. page fragment 是否扩展 normalized rect；
3. View displayMode 与 Huabu LOD/presented face 的映射；
4. Web snapshot/reader 的 persistence level；
5. PDF cover/highlight 的 owner；
6. Frame membership 到 Scope/containerView 的映射；
7. unframe 是否只删 visual membership，绝不自动删 canonical Relation。

## 9. 开发成本与拆分

建议先做三个获批的小阶段：

```text
A0 source integration decision + build-only spike
A1 read-only projection: Image/PDF, no writes
A2 command adapter: geometry + Preview; disposable project only
```

A0 只验证依赖、构建与 host 可装载；A1 验证同一 Artifact/View 身份；A2 才接 geometry command。Note/Web/Video/Frame 后续按证据递增，不大爆炸式迁移。

## 10. 风险

- Huabu 上游变动与长期 fork；
- current Prototype 与 Huabu 双 host 长期并存；
- node data 偷渡 canonical state；
- Local Core 与 Huabu sidecar/file APIs 双写；
- selection/viewport/geometry 双 owner；
- bundle、PDF/Milkdown hydration 与桌面打包回归；
- 未跟踪历史打包副本被误当 source。

## 11. 验收条件

### A0

- Huabu exact commit/subtree/source strategy 可复现；
- lint/typecheck/unit/build/smoke 不回退；
- 无第二 canvas runtime 同时拥有用户操作；
- dependency/license/provenance ledger 完整。

### A1

- disposable Image/PDF 从 LCOS query 投影成 Huabu node；
- node id=view id、artifact id/revision id 不丢；
- missing/stale 显示正确；
- Preview 打开仍为同一 entity；
- read-only，不写用户文件。

### A2

- resize/move 只通过 LCOS command adapter；
- debounce/batch 与 graphVersion/409 stale 生效；
- restart 恢复 geometry；
- 无 localStorage canonical graph；
- 回归 acceptance cards。

## 12. 回滚

- A0 在隔离 branch/worktree 中验证，不替换 current default host；
- A1/A2 使用 feature flag + disposable project；
- adapter 输出可关闭并退回 current read path；
- 不迁移用户文件、不删除 Prototype，直到新 host 通过完整 Golden Path；
- 不允许 destructive schema migration；若新增字段，先 additive migration。

## 13. 当前裁决

```text
PROTOCOL READY FOR REVIEW
IMPLEMENTATION NOT AUTHORIZED
RECOMMENDED PATH: HUABU-AS-HOST + THIN LCOS ADAPTERS
REJECTED PATH: RECREATE HUABU FEATURES IN CURRENT PROTOTYPE
```


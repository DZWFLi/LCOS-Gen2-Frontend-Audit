# First-wave Reuse Feasibility Review v1

## 结论

```text
Huabu component capability fit: HIGH
LCOS semantic fit via thin adapters: PLAUSIBLE
Current root apps/web integration readiness: LOW
Safe interpretation: adopt/port mature Huabu host, do not recreate it
Immediate implementation: HOLD pending architecture change approval
```

六个第一批物种都能由 Huabu 成熟栈承载，不需要从零制作节点、Preview、编辑器或布局系统。但当前 LCOS 根目录的 `apps/web` 并非 Huabu host，不能把“复用”误写成已经接通。

## 1. Current workspace evidence

当前根目录 `apps/web/package.json` 依赖只有 LCOS contracts/ui、React、Lucide 等，未包含：

```text
@xyflow/react
Milkdown / Crepe
react-pdf / pdfjs
Huabu canvas engine
```

当前 UI 仍以：

```text
apps/web/src/App.tsx
apps/web/src/model.ts
apps/web/src/features/canvas/ProjectCanvas.tsx
apps/web/src/features/canvas/CanvasNodeVisual.tsx
```

为主要 Prototype 路径。`CanvasNode` 仍把 kind、geometry、artifact/revision 展示字段混在前端模型中。

## 2. 已存在但不能冒充 current source 的材料

以下 projection files 只在未跟踪的历史打包副本中找到：

```text
LCOS_FULLSTACK_0.1_GUI_CACHE_WINDOWS_RC_20260818/
  apps/web/src/runtime/projectionAdapters.ts
  apps/web/src/features/entities/projectEntityProjection.ts
  apps/web/src/state/projectionLayoutState.ts
```

它们可作 `LIFT/REFERENCE`，不能当成当前根 `apps/web` 已接通能力，也不能直接从未跟踪打包目录复制覆盖。

其中：

- `projectionAdapters.ts` 主要解析 Revision、Workspace state、Process、Session summary；
- `projectEntityProjection.ts` 处理 presentation entity refs 到 canvas identities；
- `projectionLayoutState.ts` 只保存 disposable renderer preferences，并明确不写 canonical membership/geometry。

## 3. Domain readiness

当前 `packages/domain/src/index.ts` 已具备可作为 adapter 输入的正式类型：

- Artifact / ArtifactView / ArtifactRevision；
- `available / missing / stale`；
- primary / explicit additional reference；
- Note 的 artifact / artifact_view / page anchor；
- Run `queued / running / waiting_input / review / completed / failed / cancelled`；
- ArtifactReturn placement；
- Revision `draft / current / superseded`。

关键不匹配：

1. `ArtifactKind` 当前只有 markdown/image/presentation/pdf/other，缺 web/video/audio 的明确 kind；
2. `ArtifactView.displayMode` 仍是 card/thumbnail/compact，尚未与 Huabu species LOD/presented face 建立适配；
3. NoteAnchor 只有 page，没有 normalized rect；
4. Frame membership 与 LCOS Scope/containerView 映射尚未冻结；
5. current Prototype `CanvasNode` 与正式 domain 类型仍并存。

这些是 adapter/schema decision，不是重新做节点的理由。

## 4. 六物种 feasibility

| Species | Huabu reuse | LCOS adapter | Feasibility | Rewrite? |
|---|---|---|---|---|
| Image | ImageNode/ImagePreview/NodeWrapper | Artifact availability/revision/view geometry | HIGH | NO |
| PDF | PDFNode/PDFPreview/highlight/search | page/rect fragment + Revision | HIGH | NO |
| Web | WebNode/WebPreview/live/reader sandbox | sourceKind/provenance/stale | HIGH | NO |
| Note | Milkdown NoteNode/NotePreview/height engine | canonical Markdown/Revision | HIGH | NO |
| Video | VideoNode/VideoPreview | Artifact kind/cache/view state | HIGH | NO |
| Frame | FrameNode/frame engine | Scope/membership/Relation semantics | MEDIUM-HIGH | NO |

Frame 较低不是 mechanics 不成熟，而是 LCOS canonical Scope/Relation 边界尚未决定。

## 5. 可复用层级

### DIRECT USE

- Huabu NodeWrapper、selection、resizer、toolbar、connection mechanics；
- Image/Video body 与 Preview；
- PDF rendering/search/highlight/page lifecycle；
- Note Milkdown、height ownership、drop/undo；
- Web static/live/reader 与 sandbox；
- Frame fit/layout/resize/membership mechanics；
- Preview Workspace、hydration scheduler、scroll memory。

### WRAP / ADAPT

- LCOS Artifact/Revision/Availability → Huabu node data；
- ArtifactView geometry/reference kind → Huabu node identity/style；
- Run/Return/Review → Huabu non-destructive visual states；
- Scope/container membership → Frame mechanics；
- Preview actions → LCOS entity/revision commands。

### LIFT ONLY AFTER SOURCE REVIEW

- 历史包 projection parsers；
- Gen1 document/Glyth semantic policies；
- Spatial morphology/motion recipes；
- Grok/Bloub visual state implementation。

### DO NOT PORT

- 旧 LCOS/Gen1 第二套 Canvas runtime；
- Prototype `CanvasNode` 作为长期 domain truth；
- 历史包 localStorage canonical graph behavior；
- generic node card skin；
- duplicate Preview/editor/selection systems。

## 6. Host integration options

### A. Huabu-as-host（推荐候选）

```text
Huabu web/canvas host
← LCOS domain/query adapters
← LCOS visual contracts
```

优点：最大化直接复用，符合“不造轮子”。代价：属于 App Shell/Canvas host 迁移，需要明确 Sprint 和回滚边界。

### B. Selective component port

把 Huabu 节点/Preview/engine 逐项搬进 LCOS current web。表面渐进，实际会连带 store、API、shared engine、styles 和 runtime，容易形成长期 fork，成本与风险可能高于 A。

### C. Recreate behavior in current Prototype

拒绝。它会重做 xyflow mechanics、Preview、PDF、Milkdown、Web sandbox 和 Frame engine，直接违反 reuse-first。

## 7. Feasibility verdict

推荐进入 A 的架构评审，不批准 C。B 仅在证明无法采用 Huabu host 后作为受限备选。

在架构选择获批之前，可以继续完成 adapter contracts、source mapping 和 browser proof plan；不能修改 current App Shell 或宣称第一批已集成。


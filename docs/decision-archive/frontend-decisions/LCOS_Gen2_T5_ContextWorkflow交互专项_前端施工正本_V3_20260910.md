# LCOS Gen2 · T5 Context / Workflow / Navigation Interaction 专项
## 前端施工正本 V3 · 三视频 + Rhine Source Donor + Figma Baseline

日期：2026-09-10  
状态：`READY FOR T5 / FRONTEND-FIRST / BACKEND-PORT-LATER`  
优先级：不阻塞 T1–T6 主体施工；T5 可并行完成 GUI / Motion / interaction shell。

---

# 0. 施工目标

本专项不新增 LCOS 产品语义。

目标是把已经冻结的：

- 三独立 Worksite；
- Global HUD；
- Global Navigator；
- Assembly；
- Context Atlas；
- Context child canvas；
- Temporal Rail；
- Workflow Cards / Card Pool；
- Motion runtime；

落成统一、成熟、可复用的前端交互体系。

---

# 1. 非回归约束

## G1 · 三个 Worksite

Main / Context / Workflow 是三个独立 runtime worksite。

禁止前端实现成：

```text
one canvas + view mode = main/context/workflow
```

## G2 · 强 Representation 不拥有 truth

Context Atlas / Workflow Cards / Temporal Episode 只作：

- projection
- index
- navigation
- collection-level representation

禁止成为第二 canonical store。

## G3 · Assembly 不变第二数据库

Assembly 读取 Project truth / indexes，只负责 find / search / drag / assemble。

## G4 · Global Navigator 与 Temporal Rail 分层

Global Navigator：

> 跨 Project / Worksite 地址系统。

Temporal Rail：

> 当前 Context child canvas 的局部时间导航。

---

# 2. Figma baseline 先接管组件骨架

T5 当前已有开源 Figma baseline。

第一阶段先统一：

- Node container；
- Button；
- icon button；
- chips；
- status；
- typography；
- spacing；
- radius；
- border；
- feedback；
- panel；
- popover；
- dialog；
- HUD chrome。

禁止在本专项里继续手搓另一套临时 UI token。

---

# 3. Global HUD

## 3.1 Anatomy

```text
Global HUD
├─ Navigator
├─ Main
├─ Context
├─ Workflow
└─ Assembly
```

## 3.2 State

正常：

```text
persistent
```

呼出：

- Global Navigator；
- Context Atlas；
- Workflow Cards；

时：

```text
opacity down
slight retreat
not removed
```

关闭后回到原 Worksite。

## 3.3 Acceptance

- 切 Main / Context / Workflow 时 Camera / layout state 分别恢复；
- 不创建新的 Project；
- 不重置其他 Worksite runtime state。

---

# 4. Global Navigator

## 4.1 Read model

```ts
NavigationMark {
  markId
  targetIdentity
  worksite
  canvasId?
  worldAnchor?
  targetKind
  label
  color?
  glyth?
  createdBy
}
```

这是建议 front-end port shape，不是当前后端实现声明。

## 4.2 UI

- Pinned / Marked；
- All；
- Main；
- Context；
- Workflow；
- Search。

## 4.3 Actions

### Locate

```text
resolve target
→ switch worksite if needed
→ focus / locate
```

### Find in Assembly

```text
keep current worksite/camera
→ open Assembly
→ query exact target
```

---

# 5. Assembly

## 5.1 UI

```text
Pinned
Recent
All
Context
Workflow
Artifact
Skill
...
```

Search：

- exact / lexical；
- RAG semantic search。

## 5.2 Drag

拖出项目里的已有对象：

```text
same canonical identity
→ new/reused projection
```

禁止：

```text
copy content
```

除非目标操作本来就是 copy。

## 5.3 Last-Mile compatibility

继续兼容：

- Preview Whole Artifact → Canvas；
- Fragment click / drag；
- multi-file loose cluster；
- Blank Canvas Text；
- folder import；
- Link rich body；
- Assembly generic content admission。

---

# 6. Context Atlas

## 6.1 Renderer

建议：

```text
WebGL / Three.js (preferred for strong representation)
+
DOM overlay for labels / Glyth / action surfaces
```

但如果 Huabu 当前 renderer 更适合 Canvas/WebGL primitive，可沿用现有技术。

不要因为 demo 是 HTML Canvas 就复制 demo 技术决策。

## 6.2 Layout

默认两套：

### Time

沿少量 Avenue / shelf 按项目时间增长。

### Nature

Agent 对同一批 Context collections 生成性质分组 projection。

## 6.3 Body

每个 Context Collection body：

- 内容 /材质 skin；
- 名称；
- 极少状态；
- height / volume cue；
- optional Pin / Glyth。

不要做成传统 dashboard card。

## 6.4 Height

高度只表达一项经过裁定的 aggregate cue。

建议优先：

> Context 体量 / activity density 的 presentation signal。

禁止一根高度同时编码 importance / version / people / activity / confidence 五个含义。

## 6.5 Interaction

### Hover

- local field；
- neighboring body response；
- label；
- no durable selection.

### Focus

- selected body lift；
- neighbor retreat；
- Camera reframe；
- world identity remains；
- Glyth / Pin billboard。

### Open

```text
Context body
→ enter target child context canvas
```

### Collection mutation

- merge；
- split；
- extract；
- move；
- delete collection shell。

先提 proposal / preview，再执行真实 mutation。

---

# 7. Context child canvas

真实 Canvas。

## 7.1 Presentation

Agent 可提供：

```text
time organization
concept organization
```

或其他 future layouts。

但都只改变：

```text
presentation layout
```

不改变 canonical Context contents / relations。

## 7.2 用户自由度

Context child canvas 仍允许正常：

- select；
- drag；
- Composer；
- relationship；
- semantic drop；
- node editing。

不因 Agent arrangement 变成只读图。

---

# 8. Temporal Rail

这是本轮最需要精确施工的 component。

---

## 8.1 Position

默认：

```text
right side
```

原因：

- left Railway 已占用；
- 横向波动应向 Canvas 展开；
- 与参考录屏逻辑镜像一致。

---

## 8.2 Fixed density

错误：

```text
N events evenly distributed over 100% viewport height
```

正确：

```text
fixed tick pitch
dense strip
viewport height change does not stretch historical density
```

推荐初始：

```text
tickPitch = 10–12 px
```

T5 按 baseline 调。

---

## 8.3 Temporal hierarchy

默认不是一 tick 一 node。

```text
FAR  Episode
MID  Sub-episode
NEAR Event
```

第一阶段可以只做 FAR + MID。

---

## 8.4 Deterministic index

输入：

```text
timestamped project events
```

建立事实时间序列。

---

## 8.5 Agent episode projection

Agent 输出：

```ts
TemporalEpisodeCandidate {
  episodeId
  start
  end
  title
  summary
  targetIds[]
  semanticCohesion
  importanceHint
}
```

Candidate / derived only。

---

## 8.6 Static length

先算 continuous score。

再量化五档：

```text
L0 = 7–8 px
L1 = 10–12 px
L2 = 14–18 px
L3 = 20–26 px
L4 = 28–38 px
```

统一 scoring owner。

不要让 Agent 直接决定 pixel length。

---

## 8.7 Interaction length

Hover 独立叠加：

```text
displayWidth
= staticTierWidth
+ fisheye(distance)
```

推荐：

```text
Gaussian / bell falloff
```

Hovered：

- black；
- longest；
- 4px high。

Neighbors：

- gradually longer；
- remain gray。

Mouse leave：

- black disappears；
- widths settle back。

---

## 8.8 Current temporal window

不使用永久黑 cursor。

当前查看区段：

```text
subtle mid-gray band
```

Wheel：

```text
move temporal window
→ update contextual targets
```

---

## 8.9 Hover vs click

### Hover

```text
preview
highlight targets
no durable camera move required
```

### Click

```text
commit temporal target
Selection
Camera fit / Focus
```

### Wheel

```text
advance / rewind temporal window
→ committed browsing
```

---

## 8.10 Mapping targets

一个 Episode 可以 target：

- one node；
- many nodes；
- relation group；
- semantic cluster；
- canvas region。

Rail 只发 target identities / region request。

不移动真实 nodes 来迎合时间轴。

---

# 9. Workflow Cards

## 9.1 Card anatomy

必须减法：

```text
cover / material / user image
name
tag
optional tiny state
```

禁止：

- summary wall；
- source count wall；
- 3 previews；
- workflow topology。

## 9.2 User cover

用户允许：

```text
upload image
choose material
choose tag / label
```

这些属于 presentation preference。

## 9.3 Interaction

Single click：

```text
light preview
```

Double click / Enter：

```text
resolve Workflow target
→ region focus OR subcanvas enter
```

具体取决于 Workflow 的真实存储 / worksite topology。

---

# 10. Workflow Card Pool

触发：

- pool button；
- search；
- large count threshold；
- command。

提供：

- grid；
- search；
- filter；
- recent；
- pinned / frequent（future）。

卡牌轮转只服务少量常用项。

---

# 11. Motion Runtime

优先 donor RhineLabUI 的思想。

## 11.1 Motion state

```ts
{ value, velocity, target }
```

中途 retarget 不 reset velocity。

## 11.2 Spatial field

Context Atlas / Workflow candidate：

```text
event origin
→ sample distance
→ response field
```

禁止邻居逐个硬写 delay。

## 11.3 Current-state reverse

所有：

- overlay；
- card pool；
- focus；
- detail；
- viewer；

中途反向从当前可见状态继续。

## 11.4 Camera

推荐：

```text
control pose
→ rendered camera smoothing
```

支持：

- shortest angle；
- log distance zoom；
- interrupt reset；
- restore previous framing。

## 11.5 Ownership handoff

Representation change 不出现：

- duplicate body frame；
- blank frame；
- snap reset。

---

# 12. 三视频 Motion adoption table

| Reference | Adopt | Do not copy |
|---|---|---|
| Memory Shelf | ordered shelves, camera focus, in-situ identity, restore | travel content, literal shelf skin |
| Temporal Rail recording | dense ticks, hover fisheye, transient black, scroll window | left-side placement |
| Vertical motion | body morph, extend, gather, split, settle | red/white visual skin |
| RhineLabUI source | field, damp, camera, state preservation, verification | archive domain / five-column semantics |

---

# 13. Frontend component candidates

仅作为 T5 construction component names：

```text
GlobalWorksiteHUD
GlobalNavigator
NavigationMarkRow
AssemblyShelf
AssemblySearch
ContextAtlasLayer
ContextAtlasBody
WorldBillboardPin
ContextLayoutToggle
TemporalRail
TemporalEpisodePreview
WorkflowCardHand
WorkflowCard
WorkflowCardPool
MotionScalar
SpatialFieldSampler
RenderedCameraController
InterruptibleSurface
```

不要由这些名字反推 domain model。

---

# 14. Fixture-first ports

前端现在可用 fixture。

```ts
loadNavigationMarks()
loadContextCollections()
loadTemporalEpisodes(contextId)
loadWorkflowCards()
searchAssembly(query)
```

Mutation 当前若无真实 backend：

- unavailable；
- demo；
- proposal-only。

禁止 fake canonical success。

---

# 15. Motion acceptance harness

至少验证：

1. 30/60/120Hz retarget continuity；
2. Hover Rail 无永久黑 cursor；
3. Temporal Rail fixed pitch 不随 viewport 拉散；
4. hover target black + neighbor tapered;
5. Rail leave 恢复；
6. wheel 改 temporal window；
7. Episode 可 target 多 nodes；
8. target Focus 不移动 canonical geometry；
9. Context Atlas ripple 连续；
10. Atlas focus Camera reframe；
11. overlay 中途 reverse；
12. Worksite switch 状态恢复；
13. Global Navigator locate 正确；
14. Find-in-Assembly 不切 Worksite；
15. Workflow card image / material presentation 可保存；
16. Card Pool 搜索 20+ workflow 不需要线性轮转；
17. reduced motion 有合法终态。

---

# 16. 施工顺序

## P0 · Component baseline

先接 Figma baseline tokens / primitives。

## P1 · App Shell truth

确认三 Worksite runtime host + Global HUD。

## P2 · Navigator / Assembly

完成跨 Worksite global mark 和 Pinned warehouse。

## P3 · Temporal Rail

先独立组件完成，再接 Context child canvas。

## P4 · Context child canvas

接 Time / Concept Agent layouts。

## P5 · Context Atlas

Three.js / spatial representation + wave + focus + pin。

## P6 · Workflow Cards

Light hand + image/material + Card Pool。

## P7 · Motion infra

把 demo-level motion 收成 reusable runtime primitives。

## P8 · Acceptance / polish

录屏逐项对照 + Rhine source verification logic。

---

# 17. 不阻塞主体

```text
Lane A
T1–T6 主体施工继续

Lane B
T5 完成本专项 frontend / motion
```

不等待：

- T7 backend；
- Skill Intelligence backend；
- Browser / Desktop adapters。

---

# 18. Done

T5 完成本专项时，用户应该能自然做到：

```text
Main / Context / Workflow
→ 三个真实工作现场来回切

Context
→ 右侧时间 Rail 快速找到细节
→ 呼出 Atlas 快速找到大集合

Workflow
→ 呼出极简卡牌
→ 卡多时进 Card Pool
→ 进入真实 Workflow

任何 Worksite
→ Global Navigator 定位
→ 或 Assembly 直接拿标记对象
```

用户不需要理解系统的内部架构才知道下一步怎么做。

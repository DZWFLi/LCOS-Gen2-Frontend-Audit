# T5 作业 MD · Context / Workflow / Navigator Interaction
## 2026-09-10 可直接交给施工 Agent

> 本作业只改前端 GUI / interaction / motion。不要重新讨论产品语义，不要改变 T1–T6 backend owner，不要造第二份 Context / Workflow truth。

---

## 任务目标

基于当前 Figma component baseline，把 LCOS 以下已冻结交互做成生产级前端：

1. 三独立 Worksite + Persistent Global HUD；
2. Global Navigator；
3. Assembly Pinned / RAG warehouse；
4. Context Atlas summon layer；
5. Context child canvas Time / Concept Agent layout；
6. 右侧 Dense Temporal Rail；
7. Workflow lightweight cards + Card Pool；
8. 三视频 + Rhine source donor 的 Motion grammar。

参考主文档：

- `LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md`
- `LCOS_三视频交互合同_RhineDonor统一裁决_20260910.md`

交互 prototype：

- `LCOS_GlobalHUD_Navigator_ContextWorkflow_Prototype_V2_ThreeVideoIntegrated_20260910.html`
- `LCOS_Context_TemporalRail_RightSide_V3_Dense_20260910.html`

---

# A. Hard Freeze

必须保持：

```text
Project Truth
├ Main Worksite      独立 runtime
├ Context Worksite   独立 runtime
└ Workflow Worksite  独立 runtime
```

禁止把三者做成一个 Canvas 的 mode。

Context Atlas / Workflow Cards / Temporal Rail 是 presentation/index，不拥有 canonical truth。

---

# B. Figma baseline first

优先复用当前已指定的 Figma component library：

- buttons
- chips
- node containers
- status
- typography
- icon groups
- panels
- popovers
- spacing
- borders
- shadows

不要继续沿用 prototype 自己的临时 CSS 作为最终视觉。

Prototype 只负责 interaction semantics。

---

# C. Global HUD

常驻：

```text
Navigator | Main | Context | Workflow | Assembly
```

切换三个 Worksite 后：

- 恢复该 Worksite 上次 camera；
- 恢复 selection；
- 恢复 layout / history context；
- 不 reset 其他 Worksite。

呼出 local/global strong representation 时 HUD 临时弱化。

---

# D. Global Navigator

数据来源：

```text
Pin / Color Pin / Glyth / Mark
```

动作：

```text
Locate
→ real Worksite + Camera Focus

Find in Assembly
→ current Worksite stays
→ Assembly Pinned exact target
```

必须能跨 Main / Context / Workflow。

---

# E. Assembly

实现：

```text
Pinned
Recent
All
Context
Workflow
Artifact
Skill
```

搜索：

- exact / lexical
- semantic/RAG port

拖入当前 Canvas：

- existing identity → projection
- no silent copy

必须兼容当前 Last-Mile：
- whole Artifact drag
- Fragment placement
- multi-file cluster
- generic Assembly content
- folder input
- Link rich body

---

# F. Context child canvas

保留真实自由 Canvas。

增加：

```text
Time Layout
Concept Layout
```

这是 Agent-provided presentation layout。

用户仍可正常编辑节点。

---

# G. Temporal Rail · 最优先

位置：

```text
RIGHT SIDE
```

不要占左 Railway。

视觉：

```text
dense short gray ticks
fixed pitch 10–12px
```

禁止：

```text
events evenly stretched to viewport height
permanent black current cursor
one tick = one node
```

默认单位：

```text
Episode
```

Episode 可 target many nodes / relation cluster / region。

### Static Width

continuous score → 5 tiers。

初始 token：

```text
8 / 11 / 16 / 23 / 34 px
```

T5 可按 baseline 微调。

### Hover

```text
hover tick → black + longest
neighbor ticks → Gaussian taper
leave → restore
```

### Wheel

```text
move temporal window
mid-gray local band
```

### Click

```text
commit Episode
→ Selection
→ Camera fit related targets
```

Hover 可只 preview，不强制 Camera move。

### Generation

```text
timestamp facts
→ deterministic temporal index
→ Agent episode projection
```

Agent 决定 semantic grouping / title / targetIds / importance hint。

统一 scorer 决定视觉长度。

---

# H. Context Atlas

呼出方式：

Context Worksite 内 local light / shortcut。

外观：

- regular 2.5D array
- time / nature layouts
- avenue / shelf
- height variation
- content/material skin
- search
- pin/glyth

Hover：

- spatial field wave

Focus：

- selected lift
- neighboring retreat
- Camera reframe
- billboard Pin

Double click / Enter：

- enter matching Context child canvas

集合级动作：

- merge
- split
- extract
- move
- delete grouping only

---

# I. Workflow Cards

Card = complete Workflow。

卡面只保留：

```text
cover / material / user image
name
tag
```

用户允许上传 card image。

Click：

```text
small preview
```

Double click / Enter：

```text
locate Workflow region
OR
enter Workflow subcanvas
```

按真实 topology 决定，不硬限制。

---

# J. Workflow Card Pool

20+ Workflow 时必须可：

- open pool
- search
- scan grid
- choose
- double-click enter

不要逼用户滚二十次 hand。

---

# K. Motion donor adoption

## Memory Shelf video

拿：

- shelf / avenue order
- overview → focus → restore
- same body in-situ
- camera approach

## Temporal Rail recording

拿：

- dense rail
- transient black hover
- local fisheye
- scroll temporal band

## Vertical motion video

拿：

- seed → body
- extend
- gather
- split
- merge
- surrounding space response

## Rhine source

拿：

- `{value, velocity}`
- field
- damp
- current-state reverse
- camera interpolation
- outgoing visual state
- motion verification

---

# L. 验收

不满足任何一项不要宣布 Done：

- [ ] Main / Context / Workflow 是独立 runtime state
- [ ] Global HUD 可恢复各 Worksite state
- [ ] Global Navigator Locate 可跨 Worksite
- [ ] Navigator Find-in-Assembly 不移动当前 Camera
- [ ] Context Temporal Rail 在右侧
- [ ] Rail 全屏不拉散
- [ ] Rail 没有永久黑 cursor
- [ ] Hover 黑条只临时存在
- [ ] Hover 邻居有自然 taper
- [ ] Episode 可 map 多个 nodes
- [ ] Wheel 改 temporal window
- [ ] Click Camera Focus 对应真实 targets
- [ ] Atlas regular / searchable
- [ ] Atlas wave 是 field response，不是 stagger tweens
- [ ] Atlas focus 同位，不 teleport
- [ ] Workflow 卡片足够简单
- [ ] Workflow 支持 user image cover
- [ ] 20+ Workflow 可 Card Pool search
- [ ] Assembly Pinned 可直接拿 Global Marked objects
- [ ] 所有 overlay 中途反向从 current visual state 继续
- [ ] reduced-motion 有正确终态

---

# M. 不要做

- 不做新的低代码 Workflow graph；
- 不做第二 Context store；
- 不把 Temporal Rail 做成 event list；
- 不把 Atlas 做成自由 3D 地图编辑器；
- 不让用户手调 3D body 像 Blender；
- 不把 Assembly 做成必须跳转的大页面；
- 不把 Figma baseline 当参考后又重新手搓另一套设计系统；
- 不让新视觉专项阻塞 Gen2 主体施工。

---

# N. 交付

T5 最终至少提交：

1. production frontend code；
2. interaction fixture / demo；
3. Temporal Rail component tests；
4. motion acceptance tests；
5. screenshots / short recordings：
   - Worksite switch
   - Navigator Locate / Find-in-Assembly
   - Context Temporal Rail hover / wheel / click
   - Context Atlas focus / restore
   - Workflow Hand / Card Pool
6. 碰撞 / 回归说明。


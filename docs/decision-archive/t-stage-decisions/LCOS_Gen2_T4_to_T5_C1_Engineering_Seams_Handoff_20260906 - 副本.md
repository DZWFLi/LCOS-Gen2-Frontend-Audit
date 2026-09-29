# LCOS Gen2 · T4 → T5
# Phase C1 Engineering Seams Handoff
## 现在即可开始最终高保真视觉收敛

日期：2026-09-06  
来源线程：T4  
接收线程：T5  
当前源码基线：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`

状态：

```text
T4 C1-0 DONE
T4 C1-1 DONE
T4 C1-2 DONE

T5 MAY START FINAL VISUAL CONVERGENCE NOW
```

---

# 0. 给 T5 的一句话

你现在不用等 T4 把 Assembly / Context / Workflow / Skill / Run / Archive 的全部 exact-source 施工正本写完。

T4 已经先把最影响视觉结构的工程骨架锁住了：

```text
ProjectSession
Professional Window Environment
Professional Window Topology
Protected Canvas
Preview Workspace outer-host migration
Window state / occupancy / lifecycle
```

因此 T5 现在可以正式开始：

```text
Professional Window chrome
Float / Dock / Split / Immersive 视觉
Protected Canvas 与窗口的层级关系
HUD / safe rect 避让
Context / Workflow / Assembly / Skill / Run 的窗口级统一视觉框架
glyph / icon / density / motion language
```

后续 T4 C1-3～C1-7 会继续补：

```text
Assembly body states
Context body states
Workflow body states
Skill / Run states
Archive states
```

这些会回填 T5，但不会推翻本稿已经冻结的窗口/空间骨架。

---

# 1. T5 必须直接继承的产品边界

## 1.1 Canvas 不是窗口

```text
Canvas
= Spatial Body / 长期空间本体

Professional Window
= 浮在/靠在 Canvas 周围的专业工作区域
```

因此视觉上必须区分：

```text
Protected Canvas
≠ Professional Window
```

禁止把 Canvas 画成：

```text
普通 Tab
可关闭 Panel
可 Float Window
IDE 中央编辑器 Tab
```

---

## 1.2 Work View 不是 Child Worksite

```text
Professional Window / Work View
= 深度查看/编辑工具

Child Worksite
= 另一张真正长期独立的空间桌子
```

所以：

```text
窗口 chrome
```

不能被用来表达：

```text
Worksite navigation
```

---

## 1.3 Preview internal tab 不是 Window tab

PreviewWorkspace 内部已有自己的：

```text
tabs
2 groups
split
scroll memory
```

外层 Professional Window 也可能有：

```text
window tab / group
```

视觉必须能看出：

```text
外层 = 工具窗口关系
内层 = Preview 内容组织
```

不要两个层级长得完全一样。

---

# 2. T4 已锁的 Professional Window 真状态

T5 可以直接围绕这些状态设计：

```text
REST_DOCKED
ACTIVE_DOCKED
INACTIVE_TAB

FLOATING
FLOATING_ACTIVE

WINDOW_DRAGGING
WINDOW_RESIZING

SPLIT_HORIZONTAL
SPLIT_VERTICAL

MAXIMIZED / IMMERSIVE

CLOSING
CLOSED
RESTORING

ERROR
```

这些不是效果图想象，是当前工程方案真实会提供的状态。

---

# 3. Protected Canvas 真状态

T5 可依赖：

```text
CANVAS_STABLE
SURFACE_SWITCHING
SURFACE_READY
SAFE_RECT_CONSTRAINED
```

不存在：

```text
CANVAS_TAB
CANVAS_CLOSE
CANVAS_FLOAT
```

---

# 4. Professional Window 与 Camera 的关系

已冻结：

```text
Dock
Undock
Float
Resize
Split
Close
Restore
```

都只是：

```text
screen-space layout change
```

不会自动：

```text
pan Camera
zoom Camera
fitView
recenter Canvas
move nodes
```

所以 T5 不要再设计：

> “窗口打开时，画布优雅地自动偏到左边一点”

这种视觉。

除非用户明确触发：

```text
Focus / Locate / Arrival framing
```

Camera 才由 T1/T2 owner移动。

---

# 5. Safe Rect / HUD 真实工程 seam

T4 会输出统一：

```text
ProfessionalWindowEnvironment
```

包含：

```text
occupiedRects
safeRect
safeInsets
activeRegions
```

T5 可以围绕它设计：

```text
HUD避让
Pin避让
Locator避让
Composer / Action Arc避让
Minimap位置变化
边缘交互带变化
```

---

## 5.1 Docked Window

真正贴 stage 外边缘：

```text
→ shrink safeRect
```

---

## 5.2 Floating Window

```text
→ collision obstacle
```

但：

```text
不整体缩小 safeRect
```

因此 Float 窗口下面仍是原 Canvas viewport，只是 HUD/Arc 等局部避让。

---

# 6. Surface switch

Main / Context / Workflow：

```text
同一 ProjectSession
```

切换时：

```text
Canvas内部 target canvasId变化
Professional Window topology可保持
```

所以 T5 可以设计：

```text
Main → Context → Workflow
```

时窗口持续存在。

不要设计：

```text
Surface切换
→ 全部窗口 fade out
→ 重新打开
```

除非某个窗口 target 本身无效。

---

# 7. Project switch

Project A → Project B：

```text
ProjectSession重建
Professional Window project-scoped layout切换
```

因此：

```text
同一项目跨Surface连续
不同项目不串窗口状态
```

---

# 8. Dockview 是 engineering primitive，不是视觉 donor

T4 已决定：

```text
dockview-react@8.2.0
= ADOPT engineering primitive
```

只借：

```text
Float
Dock
Undock
Resize
Move
Split
Tabs/Groups mechanics
renderer='always'
layout serialization
```

T5 不要照 Dockview 默认视觉做。

明确不要复制：

```text
VS Code / IDE chrome
默认蓝色 drop overlay
默认 tab height
默认 close button
默认 sash
默认 headers
```

---

# 9. T5 可以重做的窗口视觉

以下全部归 T5：

```text
header height
chrome density
radius
material
shadow
blur
border
active/inactive
drag affordance
close glyph
dock/float glyph
split affordance
resize affordance
immersive transition
tab treatment
floating body material
attention / hover
motion timing
```

前提：

```text
不改变真实状态机
```

---

# 10. 当前 PreviewWorkspace 必须保留的功能感

Preview body已经有成熟：

```text
tabs
两个 internal groups
internal horizontal split
tab drag
keyboard resize
scroll memory
node/chat preview
focus
```

T5可以重新做：

```text
外观
密度
tab造型
separator造型
hover
motion
```

但不要视觉上假设：

```text
Preview内部可以无限 N split
```

current body仍是：

```text
max two groups
```

---

# 11. Professional Window 与 Preview 的层级

目标：

```text
Professional Window
└─ PreviewWorkspace
   ├─ Preview group A
   └─ Preview group B
```

因此：

```text
Window header
```

和：

```text
Preview content tabs
```

要有明显 hierarchy 差异。

建议 T5 优先做到：

```text
外层窗口 chrome 极轻
内层内容 tab 更贴近内容本体
```

而不是两层都用重型 tab bar。

---

# 12. 多窗口并存是硬条件

T5最终视觉必须支持例如：

```text
Conversation Child Canvas
+ Conversation Preview
+ Assembly
```

同时出现。

也可能：

```text
Canvas
+ Assembly right
+ Run Review bottom
+ floating Preview
```

所以不要设计只适合：

```text
一个大右侧栏
```

的视觉系统。

---

# 13. T5 当前可先锁的窗口布局视觉

现在可以先做：

```text
Canvas作为中心稳定本体

right dock
bottom dock
right+bottom coexist

tabbed professional group
floating panel

floating → immersive
immersive → previous placement

window close/reopen
window active/inactive
```

具体默认百分比：

```text
暂时不要写死
```

最终由视觉方案回填 T4。

---

# 14. T5 应设计的 DnD 视觉差异

当前工程 owner 已经分开：

```text
Window chrome drag
→ Window movement

Preview internal tab drag
→ Preview content rearrangement

Artifact left drag
→ semantic drop

Right-drag
→ Give / transport

Relation handle drag
→ Relation
```

所以 T5 必须让它们：

```text
视觉反馈不同
```

不能统一成：

> “拖动时所有东西都变蓝框 + 吸附”

---

# 15. Window Drag

只从：

```text
Window header/tab chrome
```

启动。

T5要提供轻量但可辨识的：

```text
grab / drag affordance
dock preview
split target
float release
```

不要把整个 body都做成 draggable。

---

# 16. Artifact / Semantic Drag

发生在：

```text
Window body / Canvas objects
```

必须保持：

```text
T3 semantic feedback
```

Dockview window drop overlay不能抢它。

T5不要让：

```text
semantic target highlight
```

和：

```text
window dock target
```

长得一模一样。

---

# 17. Right-drag Give

明确：

```text
source object spatial placement不动
```

所以视觉应强调：

```text
信息/能力被送过去
```

而不是：

```text
对象实体被拖走
```

---

# 18. Context 现在可以先做什么

T4 当前工程骨架已经允许 T5 开始：

```text
Context Atlas
→ temporary detail
→ professional instrument
```

已冻结：

```text
Atlas
= Context Home / derived map

temporary detail
≠ Worksite

Evolution
Relationship
Provenance
= professional instruments
```

---

## 18.1 T5 可以先锁

```text
Atlas region
REST
HOVER
SELECTED
FOCUSED

temporary detail entry/exit

professional instrument window transition
```

---

## 18.2 暂时不要锁死

在 T4 C1-4 前：

```text
Evolution final body
Relationship final body
Provenance final body
```

可做 donor visual candidates，但别把最终 information architecture 写死。

---

# 19. Workflow 现在可以先做什么

已冻结：

```text
Workflow
≠ DAG
≠ BPMN
≠ Run log

主层表达：
material
action round
result
review
current Glyth
```

T5可以开始：

```text
一轮真实工作的视觉 grammar
Result-first presentation
Review body direction
hover reveal
```

---

## 19.1 暂时不要锁死

T4 C1-5 前不要锁：

```text
exact field count
exact card schema
exact log body
```

---

# 20. Assembly 现在可以先做什么

已经冻结 Source Bay：

```text
Project
Capture
Sources
Skills
```

Assembly：

```text
Project-shared
```

可从：

```text
Main
Context
Workflow
Conversation
```

打开。

---

## 20.1 T5 可先锁

```text
Source Bay browsing morphology
target presence
material thumbnails
drag-ready state
applied/partial/error feedback
Masonry / dense material browsing
```

Lovart：

```text
strong visual donor
```

---

## 20.2 暂时不要锁死

T4 C1-3前不要画：

```text
scope taxonomy
membership editor
Skill binding editor
```

因为这些不是 Assembly owner。

---

# 21. Skill Builder 现在可以先做什么

Skill：

```text
canonical Skill package
```

Skill Builder：

```text
Professional Window / Instrument
```

不是：

```text
Run
Worksite
```

可先做：

```text
Outline
Mind-map
version state
composition
proposal/update
```

---

# 22. Run Review 现在可以先做什么

真实状态：

```text
RUNNING
WAITING_INPUT
RESULT_READY
REVIEW_REQUIRED
ACCEPTED
REJECTED
RETRYING_AS_NEW_RUN
FAILED
```

T5可以开始：

```text
Review hierarchy
Result prominence
waiting input
retry
Artifact Return
```

但不要把：

```text
provider/tool-call/log
```

放成 Workflow主画面。

---

# 23. Archive 现在可以先做什么

已冻结：

```text
Archive
= cold/read-only canonical lifecycle
```

T4最终 body方向：

```text
date grouped
Masonry
single select
multi select
Restore
Restore All
```

Lovart：

```text
strong visual donor
```

T5可以开始 Archive browsing visual。

---

# 24. T5 现在最值得先产出的 6 个视觉成果

建议先产：

```text
V1
Professional Window Visual System
Dock / Float / Active / Inactive / Resize / Immersive

V2
Protected Canvas + multi-window composition board

V3
Window chrome / tab / glyph / hover / drag / dock-target system

V4
SafeRect / HUD avoidance behavior board

V5
Context temporary-detail → professional-instrument transition

V6
Workflow / Assembly / Skill / Run / Archive
统一 professional body shell
```

---

# 25. T5 当前不要做的事情

不要：

```text
重画产品 taxonomy
重新定义 Work View
重新定义 Scope
重新定义 Worksite
重新定义 Workflow canonical composition
重新定义 Skill binding
重新定义 Archive lifecycle
```

这些已经由 Phase B /其它线程关闭。

T5只做：

```text
最终高保真 presentation
```

---

# 26. T5 必须读的 T4 C1 原稿

按顺序：

```text
1. LCOS_Gen2_T4_C1-0_Engineering_Seam_Skeleton_20260906.md
2. LCOS_Gen2_T4_C1-1_ProjectSession_ProfessionalWindowEnvironment_ExactSourcePlan_20260906.md
3. LCOS_Gen2_T4_C1-2_ProfessionalWindowTopology_Dockview_ProtectedCanvas_ExactSourcePlan_20260906.md
```

如果只想快速开工：

```text
先读本交接
再重点看 C1-2
```

---

# 27. T4 后续会继续补给 T5

接下来：

```text
C1-3 Assembly
C1-4 Context
C1-5 Workflow
C1-6 Skill / Run
C1-7 Archive / recovery
```

每一轮 T4 都会追加一份：

```text
T4 → T5 visual state delta
```

T5不需要暂停。

可以并行推进。

---

# 28. 给 T5 的启动指令

可直接作为 T5 当前阶段的工作指令：

```text
你现在进入 LCOS Gen2 T5 Phase C。

先完整阅读：
1. T4_to_T5_C1_Engineering_Seams_Handoff_20260906.md
2. T4 C1-0 Engineering Seam Skeleton
3. T4 C1-1 ProjectSession + ProfessionalWindowEnvironment
4. T4 C1-2 Professional Window Topology + Dockview + Protected Canvas

不要重新讨论产品语义。

当前先围绕已经工程冻结的 Professional Window / Protected Canvas / safeRect / multi-region / Preview outer-host，正式做高保真视觉收敛。

优先产：
- Professional Window chrome
- Dock/Float/Split/Immersive视觉体系
- Protected Canvas层级
- 多窗口组合
- safeRect/HUD避让
- 窗口drag与semantic drag视觉区分
- Context temporary-detail转场
- Workflow/Assembly/Skill/Run/Archive统一professional body shell

Dockview仅为engineering primitive，禁止照抄其IDE默认视觉。

T4后续 C1-3～C1-7 会继续回填业务body的exact state，不需要等待。
```

---

# 29. 当前 T4 → T5 Gate

```text
[PASS] Professional Window真实状态已提供
[PASS] Protected Canvas invariant已提供
[PASS] Camera rule已提供
[PASS] safeRect/occupancy已提供
[PASS] multi-window真实结构已提供
[PASS] Preview internal/outer hierarchy已提供
[PASS] DnD owner差异已提供
[PASS] Surface/Project lifecycle已提供
[PASS] Dockview engineering boundary已提供
[PASS] T5现在可以开始最终视觉收敛
```

---

# 30. 最终一句话

> **T5 现在可以开始锁“这些专业工作到底长什么样”；T4 已经先把“它们工程上能怎么存在、怎么移动、怎么并存、怎么占屏幕、哪些东西绝对不能被画成同一种东西”交出来了。**

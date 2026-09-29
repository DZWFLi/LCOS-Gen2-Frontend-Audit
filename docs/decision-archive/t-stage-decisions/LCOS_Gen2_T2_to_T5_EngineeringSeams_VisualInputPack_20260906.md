# LCOS Gen2 · T2 → T5
# Engineering Seams · Visual Input Pack

日期：2026-09-06  
状态：`T2 C1 ENGINEERING INPUT FOR T5`

> 这份不是后端施工稿。
>
> T5 只需要知道：
>
> - 什么东西真实存在；
> - 它有哪些真实状态；
> - 工程能提供什么 geometry / hit-area / LOD / safe region；
> - 哪些 donor 已有 exact measurements；
> - 哪些旧 body 必须退休；
> - 哪些最终外观仍完全交给 T5。
>
> 不要求 T5 阅读 T2 的几十个 Core route。

---

# 1. 一张图理解 T2 最终 Chrome

```text
                     Top Navigation HUD
                 Search / Focus / Pin
                     (同一物理 slot)

Railway                                          Professional Window
│                                                Dock / Float / ...
│
│                  Spatial Canvas
│
│
│
Receiver          Spatial Navigator

                 Main Context Workflow
                    SurfaceDock
```

职责：

```text
Railway
= 去哪里

SurfaceDock
= Main / Context / Workflow 一级快速切换

Navigation HUD
= 找什么 / 它在哪 / 长期 Pin

Spatial Navigator
= 怎么看当前空间

Canvas editing tools
= 次级/contextual，不再霸占底部中心
```

---

# 2. Railway

## 2.1 真实 item species

只有：

```text
Surface Root
Long-term Worksite
Receiver / Conversation
Legacy compatibility item
```

不自动出现：

```text
Collection
Scope
temporary Context block
```

---

## 2.2 Railway visual hierarchy

### Surface Root

- structural；
- visual weight lower than bottom SurfaceDock；
- glyph-first；
- 不再画第二组三个很重的 Main/Context/Workflow 主按钮。

### Worksite

- 最重要的 Rail body；
- 可提供真实成员 geometry mini preview；
- geometry不可用时提供真实 type/count fallback；
- 不画装饰性假缩略图。

### Receiver

- 固定靠近底部；
- Glyth/conversation identity first；
- 轻量 status；
- 不做 provider/model/token dashboard。

---

# 3. Railway states T5 can design

真实状态：

```text
REST
HOVER / PEEK
ACTIVE
REORDER
RECEIVE
RECEIVE-ELIGIBLE
RECEIVE-HOT
INELIGIBLE
OVERFLOW
UNAVAILABLE
LEGACY
MANAGE / MORE
```

Receive mode：

```text
用户拖对象
→ Rail temporarily becomes destination map
```

不是永久 sidebar expansion。

如果 Surface root下面有多个 Worksite：

```text
hover/dwell
→ compact Peek
→ concrete destinations
```

不弹 modal chooser。

---

# 4. Railway real preview capability

Engineering 可给：

```text
member x/y/width/height
member kind
member count
overflow count
```

可以画：

```text
真实空间 mini-layout
+N
type/count fallback
```

不能假装所有 Worksite都有缩略图。

---

# 5. Railway donor

## Gen1 LCOS

直接保留的成熟交互：

- true mini preview；
- `+N`；
- Hover larger preview；
- reorder gap/ghost/neighbour shift；
- direct semantic destination。

## Lovart / tldraw

- low Chrome；
- 48px hit area vs smaller visible core；
- hover/reveal restraint。

## TapNow

- compact control density；
- active/hover restraint；
- direct navigation feel。

## LibTV

- compact flyout density；
- roughly 214px-class identity/peek panel；
- restrained border/blur/radius参考。

最终 body不是任何一家一比一照搬。

---

# 6. SurfaceDock

固定产品结构：

```text
Main
Context
Workflow
```

位置：

```text
bottom-center
```

视觉权重：

```text
primary Surface switch
> Railway Surface roots
```

不要再把：

```text
Select/Pan/Lasso/Frame/Text/Sketch
```

放在同一个一级底栏抢位置。

---

# 7. Canvas editing tools

能力仍存在：

```text
Select
Pan
Lasso
Frame
Note
Text
Sketch
Question
Upload
Link
Space Preview
```

成熟快捷键/手势也继续存在。

T2 工程只把它们从：

```text
permanent bottom-center toolbar
```

降级为：

```text
secondary / contextual launcher
```

T5 决定 compact launcher/Popover 最终长相。

---

# 8. Search / Focus / Pin shared HUD

同一个 physical slot。

优先：

```text
Search > Focus > Pin > none
```

但三者语义不能画成一个“Mode Switcher”。

---

# 9. Search states

可提供：

```text
closed
open idle
typing
loading
results
active result
no result
error
commit
Search → Focus
```

结果真实字段：

```text
title
snippet
match reason
source anchor
location count
location refs
used-here
availability
```

不要暴露：

```text
FTS
vector
database
OCR
semantic mode switch
```

---

# 10. Focus / Where states

Focus 不带搜索框。

工程可以提供 occurrence cases：

```text
0
1 current
1 remote
2
3
4
7
12
20+
cross-Surface
current Worksite
remote Worksite
archived
unavailable
```

T5 重点需要解决：

```text
2–4 locations compact representation
7/12/20 overflow/fan/cluster
current occurrence identity
cross-Surface identity
```

---

# 11. Search ↔ Focus glyph

推荐：

**Morphicons MIT**

适合：

```text
Search glyph
↔ known-target/Where glyph
```

可 controlled progress，
支持 reduced-motion。

如果 path不适合 morph：

**Amicro IconSwap MIT** 做 fallback。

---

# 12. Color Pin

真实 palette donor：

```text
#F0606B
#F4A14B
#EDC63D
#4FC978
#4EA8FF
#A55CF0
```

这些是视觉默认候选，不是 Core enum。

---

# 13. Pin exact measured donor

TapNow：

## node local

```text
single core 18px
multi core 14px
overlap -10px
transition 200ms ease-out
```

inactive under active filter：

```text
saturate(.35) brightness(.55)
```

active target：

```text
3px group color rim
~22px glow
```

## chooser

```text
outer hit 24px
inner core 18px
top popover
center align
8px offset
```

## action motion

```text
pressed .90
hover/focus/open offset -1px
pin icon ~-5deg
```

membership confirmation：

```text
.88
→ 1.06 @58%
→ 1
320ms
cubic-bezier(.2,.85,.2,1)
```

需要 reduced motion。

---

# 14. Locator

不是一颗永远钉在屏幕边缘的箭头。

真实连续 state：

```text
LOCAL
NEAR_EDGE
EDGE
TRAVELLING
ARRIVING
HIDDEN / UNAVAILABLE
```

Engineering 提供：

```text
safeRect
target screen rect
direction
distance
continuous progress 0..1
edge anchor
```

所以 T5 可以真正做：

```text
local cue
→ shape/position continuity
→ directional edge cue
```

不用猜目标方向。

---

# 15. Locator interaction

固定：

```text
click
→ direct camera travel
```

没有：

```text
popup
confirm
destination card
toast
```

进入后：

```text
Arrival on target
```

---

# 16. Arrival

Arrival 要落在：

```text
target body / target field / rim
```

不是：

```text
右上角 Toast
```

历史可参考：

```text
Gen1 beacon ~900ms
```

final视觉建议 600–900ms 级，
但精确 body/easing交 T5。

Reduced motion：

```text
outline/color settle
```

不要 scale pulse。

---

# 17. Camera feel

Engineering：

- actual target bounds；
- multiple target union；
- safeRect-aware；
- min/max bounded；
- oversized content fit；
- offscreen unmeasured nodes可可靠拿 bounds。

TapNow donor feel：

```text
~500ms bounded locate
```

T5 可以定 exact easing/motion，
但不能改成：

```text
fixed zoom
hard cut
Work View open时自动 camera move
```

---

# 18. Spatial Navigator

用户刚明确纠偏：

> Zoom/Fit 等直接集成 Minimap。

所以它是一套：

```text
Minimap
Zoom -
Zoom value / reset 100%
Zoom +
Fit
```

Lock / Grid Snap 可以作为低频 adjacent controls，
最终权重由 T5。

---

# 19. Spatial Navigator real mechanics

Huabu当前已经能：

```text
ReactFlow MiniMap
pannable
zoomable
camera
per-canvas viewport persistence
100% reset 200ms
Lock
```

所以 T5只设计 body，
不必设计第二套空间系统。

---

# 20. Spatial Navigator donor

## TapNow expanded state

```text
200×150
bg rgba(24,24,27,.92)
viewport border 1.5px white
outside mask
click blank → camera
drag viewport → continuous pan
spring ~120 / 18 / 1
launcher crossfade ~200ms
```

## Lovart/tldraw

负责：

```text
collapsed resting shell
low Chrome
hit area vs visible core
```

## Gen1

曾经已经把：

```text
Minimap + Zoom + reset + Fit + Grid Snap + Arrival beacon
```

做成一组。

---

# 21. Work View / safeRect

T5必须按这个规则画：

```text
Work View open/resize
→ Camera不动
→ nodes不动
→ HUD避让
→ Locator safe edge变化
→ Spatial Navigator reposition
```

只有：

```text
user explicit Focus/Locate
```

Camera才重新 fit 到剩余可用区域。

---

# 22. Occupancy states

工程会给：

```text
viewportRect
occupiedRects
safeRect
activeRegions
```

因此 T5不要基于：

```text
“右侧栏大概 420px”
```

设计死位置。

至少验证：

```text
Dock right
resize
Floating overlap
narrow viewport
close/restore
```

---

# 23. Receiver

Rail底部当前 Receiver真实 states：

```text
none
ready
working
waiting
unknown/unavailable
linked Glyth
unlinked ConnectedConversation
active
```

不要自己根据 lastActiveAt 猜 offline。

不要常驻显示：

```text
Codex
WorkBuddy
model
tokens
lease
failure count
task detail
```

Rest body应该是：

```text
identity + presence
```

---

# 24. More / low-frequency management

成熟 implementation：

Huabu `DropdownMenu / Popover`。

More里可以有：

```text
Rename
Archive
Disconnect
legacy migration
```

取决于 item capability。

直接操作继续是：

```text
click navigate
hover Peek
drag reorder/drop
```

不要每个 Rail item长期挂三个小按钮。

---

# 25. Text rule

最终冻结：

```text
非必要不显示字
```

建议：

## Rest

```text
glyph / preview / color / state
```

## Hover / Focus

```text
tooltip / short identity
```

## Explicit Peek / More / Search

```text
正常可读文字
```

这不是“所有地方都不能有字”。

---

# 26. T5 final authority

T5 最终可以决定：

```text
Rail width
Rail resting body
Rail Peek dimensions
SurfaceDock geometry
HUD material
icons/glyphs
Locator shape
Arrival visual
Spatial Navigator collapsed body
Spatial Navigator expanded shell
Receiver body
More menu visual override
hover treatment
motion easing
motion duration
spacing
typography
LOD
dark/light material
```

---

# 27. T5 cannot change

```text
SurfaceDock primary vs Railway structural hierarchy
Search/Focus/Pin semantics
Worksite explicit materialization
Work View open = no camera move
safeRect consumption
Pin many-to-many
Rail item ontology
direct Railway destination drop
Receiver canonical truth
Archive no auto Restore
Minimap uses Huabu spatial mechanics
Canvas tools secondary
```

---

# 28. T5 recommended review states

不要只交一张静态 Hero。

至少出：

## Railway

```text
REST 2 Worksites
REST 8
REST 20
PEEK
REORDER
RECEIVE
RECEIVE HOT
Receiver working
```

## Navigation HUD

```text
Search
Focus 1
Focus 3
Focus 12
Pin
Search→Focus
```

## Locator

```text
local
near edge
edge
travel
arrival
```

## Spatial Navigator

```text
collapsed
expanded
viewport dragging
Docked Work View
narrow viewport
```

## SurfaceDock

```text
Main active
Context active
Workflow active
Work View Docked
```

---

# 29. Final design handback format

T5 回五路线程时，
对 T2 请至少给：

```text
COMPONENT
STATE
BODY GEOMETRY
HIT AREA
MATERIAL/TOKENS
ICON/GLYPH
LABEL RULE
MOTION
REDUCED MOTION
LOD
SAFE RECT PLACEMENT
DONOR REFERENCE
```

不能只写：

```text
“更像 Lovart”
“更 macOS”
“更轻”
```

那种东西无法进源码施工。

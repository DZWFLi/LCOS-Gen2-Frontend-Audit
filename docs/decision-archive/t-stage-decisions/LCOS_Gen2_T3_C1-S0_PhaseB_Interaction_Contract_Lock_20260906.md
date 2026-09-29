# LCOS Gen2 · T3 · C1-S0
# Phase-B Interaction Contract Lock
## 源码级施工前最终交互合同锁定

> 日期：2026-09-06  
> 状态：`C1-S0 COMPLETE`  
> 上位 Authority：`LCOS_Gen2_PhaseB_四路合并_最终跨线程裁决稿_20260906`
>
> 目的：
>
> - 不再进行产品语义讨论；
> - 把 T3 旧稿中被 Phase B 覆盖的措辞正式退休；
> - 给 C1-S1 Current Source Exact Map 一个稳定、不可漂移的目标；
> - 只有 current source 存在无法薄适配的真实技术冲突时，才允许回报 Coordinator。

---

# 1. T3 当前唯一职责

T3 负责：

```text
Object-local Interaction Grammar
Action Arc
Right-click / More
Compact Composer
Reference / Reference Pick
Voice
Receiver / Run presentation
Semantic Drop / Semantic Carry gesture
Relation explicit gesture
Glyth local interaction
Local overlay / Work View coexistence
```

T3 不负责重新定义：

```text
Collection truth
Colony truth
Scope truth
Worksite identity
Child Canvas identity/navigation
Workflow composition
Context Atlas truth
Assembly canonical mutation
Archive lifecycle
最终 visual morphology
```

---

# 2. Phase B 后 T3 的最终交互合同

## 2.1 Left drag → Blank

```text
Move
```

当前 projection 留在新位置。

空间机械由 T1 / Huabu。

---

## 2.2 Left drag → Visible Host

Visible Host 例如：

```text
expanded Collection
Gallery
Grid
Stack
Masonry
当前 Surface 的真实空间 host
```

最终合同：

```text
target natural semantic commit
+
current projection stays at target
+
host may reflow through Huabu
```

T3 不再允许：

```text
统一“吸进去 → source 回原位”
```

这种旧泛化。

---

## 2.3 Left drag → Remote Target / Portal

例如：

```text
Glyth
Railway remote destination
Child Worksite portal
另一个未打开 Worksite
```

最终合同：

```text
target semantic / mapping / target projection updated
+
source current projection remains in source scene
```

T3 presentation 可做：

```text
ghost transfer
receipt
target reaction
```

但：

```text
不得 clone canonical object
```

---

## 2.4 Right-drag

旧措辞：

```text
“temporary borrow”
“借过去用”
```

正式退休为产品/工程定义。

最终合同：

> **source spatial placement 不动；target 按自己的唯一 natural semantic commit。**

因此：

```text
Right-drag → Collection
= Add durable Collection membership
= source current projection remains
```

生命周期由 target semantic 决定。

Right-drag 不代表 temporary relation。

---

## 2.5 Relation Handle

永远：

```text
Project Relation only
```

不得顺手：

```text
Add Collection membership
Add Conversation Context Mapping
Add Workflow composition
Move projection
Create Worksite
```

Relation gesture 和 body-natural semantic 永远分开。

---

# 3. Selection / Reference / Relation / Mapping 四分

## Selection

```text
当前操作谁
```

---

## Reference

```text
本轮 Run 额外参考谁
```

Selection 不自动变 Reference。

---

## Relation

```text
Project durable semantic relation
```

---

## Conversation Context Mapping

```text
Conversation 长期知道 / 使用谁
```

这四个 owner 不得合并。

---

# 4. Multi-selection

最终：

```text
multi-select
→ Selection only
→ lightweight multi toolbar
```

禁止：

```text
auto-open Composer
auto-convert to References
```

AI Work 必须显式进入。

---

# 5. Compact Composer

最终：

```text
target-local
compact
bounded height
no huge sidebar
no auto-focus
```

Composer state 至少覆盖：

```text
target
prompt draft
ordered References
Voice state
Receiver
Skill / params when present
Run state
failure / recovery
```

失败不能清：

```text
draft
refs
receiver
```

---

# 6. Voice

最终：

```text
selected text
→ replace

active caret
→ insert

no caret / no selection
→ append
```

Voice：

```text
no auto Run
no separate Voice Workbench
transcript remains editable
```

---

# 7. Receiver

产品心智：

```text
本轮交给哪段 Conversation
```

不是 provider selector。

Per-run Receiver：

```text
≠ Project Active Receiver
```

Set Current：

```text
explicit only
```

---

# 8. Glyth Local Interaction

Glyth：

```text
Conversation spatial identity
```

点击层级：

```text
first click
→ Select

already selected + click
→ Arc + Compact Composer

double click
→ same Conversation deep work
```

Phase B：

```text
Conversation Child Canvas
= nested Worksite

Conversation Preview
= Professional Window

Assembly
= Project-shared Professional Window
target=current Conversation
```

Artifact body → Glyth：

```text
Conversation Context Mapping
```

Relation：

```text
Relation handle
```

---

# 9. Work View / Professional Window coexistence

T3 必须消费 T4 单一公共 occupancy seam：

```text
occupiedRects
safeRect / safeInsets
activeRegions
```

禁止：

```text
DOM query multiple panels
hardcoded right panel width
persisted safeRect
```

Local UI priority：

```text
active editing / voice / reference pick
>
draft Composer
>
Action Arc
>
tooltip
```

Professional Window open/resize：

```text
不得因为 host resize 自动改变 Camera
```

T3 只负责 local overlay 重新定位/折叠。

---

# 10. Remove / Archive / Delete

## Remove

presentation / projection / local mapping removal：

```text
immediate
+ Undo
```

---

## Archive

由 Core lifecycle owner。

T3 仅：

```text
入口
反馈
restore affordance
```

Restore：

```text
fresh layout
no old x/y restore
```

---

## Delete

真实 canonical entity / file / durable structure：

```text
explicit confirmation
```

---

# 11. Queue

当前状态：

```text
DEFER
```

TapNow Queue：

```text
future donor candidate
```

Phase B 未将 Queue 纳入默认 Gen2。

T3 source plan 不新增 queue product / store / contract。

---

# 12. 正式退休的 T3 旧措辞 / 旧假设

以下在任何新 source plan 中不得再次出现。

## RETIRE-01

```text
Right-drag = temporary borrow
```

替换：

```text
source spatial placement unchanged
+
target natural semantic commit
```

---

## RETIRE-02

```text
membership/use semantic
→ source always home
```

替换：

```text
Visible Host
→ projection stays

Remote Target
→ source scene projection stays
```

---

## RETIRE-03

```text
Collection = enterable child-canvas-like place
```

替换：

```text
Collection = canonical durable membership
presentation = collapsed/expanded spatial layer
```

---

## RETIRE-04

```text
Scope = durable container / saved scope object
```

替换：

```text
Scope = transient work boundary
```

---

## RETIRE-05

```text
Work View open
→ hide all local overlays
```

替换：

```text
consume safeRect / occupiedRects
→ active local work survives
→ lower-priority chrome yields first
```

---

## RETIRE-06

```text
Glyth = card/node special case
```

替换：

```text
Conversation spatial identity
```

---

## RETIRE-07

```text
Multi-selection
→ auto Composer
```

替换：

```text
multi toolbar only
AI Work explicit
```

---

# 13. 当前 C1-S1 必须重新核的 source domains

下一步只做 exact current source map，不写 patch。

必须重新核：

```text
A. pointer / gesture entry
B. selection
C. node click / dblclick
D. context menu entry
E. floating toolbar / popover
F. composer shell
G. ChatInput / draft owner
H. Reference state / controller / recognizers
I. Run / receiver frontend seam
J. Voice transport
K. semanticDropMachine / drop presentation
L. relation connect seam
M. Glyth host / node presentation
N. Work View occupancy seam consumer
```

每一项必须列：

```text
exact file
exact symbol
current owner
exact consumer
current behavior
existing primitive
known legacy
```

C1-S1 不允许先写：

```text
“新增 XxxManager”
```

---

# 14. C1-S2 Engineering Seam Skeleton 目标

C1-S1 完成后，才能产：

```text
T3 Source Engineering Seam Skeleton
```

它只回答：

```text
现有能力从哪里长出来
复用什么
增加什么薄 seam
退休什么
给 T5 暴露哪些真实视觉状态
blast radius 在哪里
```

不锁最终 CSS / body / icon / motion。

---

# 15. T5 将从 T3 seam 得到的输入

T3 C1-S2 必须输出：

```text
Action Arc:
anchor / action count / hover / dismiss / safeRect

Composer:
bounds / draft / refs / voice / receiver / run / failure

Reference:
eligible / hover / pick / invalid

Semantic Give:
approach / receptive / hit / commit / stay/home / receipt

Right Carry:
source fixed / proxy / accept / reject / settle

Relation:
handle / live line / receptor / settle

Glyth:
selected / attention / receive / relation / current receiver

Work View collision:
occupied / safe / local priority
```

T5 再决定：

```text
shape
material
motion
LOD
glyph
density
spacing
```

---

# 16. Architecture Conflict Gate

只有下面全部成立，才能回 Coordinator：

```text
1. exact current source 与 Phase B contract 真实冲突
2. adapter / migration / thin seam 无法无损解决
3. 强行实现会造成 duplicate truth / broken recovery / destructive migration
```

报告必须包含：

```text
exact file
exact symbol
current behavior
Phase B target
why thin seam fails
minimum alternatives
blast radius
recommended coordinator decision
```

否则：

> **继续施工，不重新 OPEN。**

---

# 17. C1-S0 Done Checklist

- [x] Phase B T3 回填已写入
- [x] Visible Host / Remote Target 分开
- [x] Right-drag temporary borrow 旧措辞退休
- [x] Relation Handle 独立
- [x] Selection / Reference / Relation / Mapping 四分
- [x] Multi-select no-auto-Composer
- [x] Voice insertion rule locked
- [x] Receiver vs Active Receiver locked
- [x] Glyth click / Context / Relation locked
- [x] Work View occupancy consumption locked
- [x] Remove / Archive / Delete roles locked
- [x] Queue default deferred
- [x] Scope / Collection / Work View 等旧错误假设退休
- [x] Architecture Conflict gate defined
- [x] C1-S1 source map scope defined

---

# 18. 下一步

立即进入：

# `C1-S1 · T3 Current Source Exact Map`

只做 current HEAD source inventory / exact owner / exact consumer。

不做产品讨论。

不提前写最终 patch。


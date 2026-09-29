# LCOS Gen2 · T6 → T5
# 01 · Stable Truth / State Boundary
## T5 最终高保真设计前的 Core Truth 输入

**日期：2026-09-06**  
**来源线程：T6 · Core / Realtime / Modularity / Migration**  
**接收线程：T5 · Final Visual / Motion / Density / LOD / Donor Adoption**  
**性质：T5 设计输入，不是 production patch，不是 T6 全量 migration 施工稿**

---

## 0. 这份文档只解决什么

T5 不需要吞下 T6 全部数据库迁移、realtime、兼容读写和 retirement 细节。

T5 只需要知道：

> **哪些状态是真实产品状态，哪些只是映射、空间投影或临时视觉状态；哪些状态之间可以视觉变化，哪些变化绝不能暗示 canonical truth 被改变。**

这份文档是 T6 给 T5 的最小稳定 truth 边界。

T5 可以自由决定：

- body；
- morphology；
- visual density；
- motion；
- transition；
- LOD；
- material / glass / depth；
- micro-feedback；
- donor 高保真采用方式。

但 T5 不重新决定：

- canonical identity；
- durable membership；
- Workflow composition；
- Worksite identity；
- Archive lifecycle；
- ProjectionBinding；
- ProjectEvent recovery；
- geometry owner。

---

# 1. 最核心的一条

LCOS Gen2 中必须始终区分：

```text
Canonical Entity
≠ Relation / Membership
≠ Mapping
≠ Projection
≠ Spatial Body
```

更具体：

```text
Canonical Entity
    = “这个对象本身是谁”

Membership / Composition
    = “它长期属于/参与什么”

Mapping
    = “它和另一个语义对象之间存在什么映射关系”

Projection
    = “这个 canonical object 是否在某个 canvas / surface 出现”

Spatial Body
    = “它此刻在 Huabu 空间里长什么样、在哪里、尺寸多少”
```

T5 的视觉设计必须能够让这些层级**自然可感知**，但不能把它们合并成一个视觉动作后再反向定义 product truth。

---

# 2. Same Entity / Multiple Projections

Phase B 后的稳定规则：

```text
same canonical entity
可以出现在不同 canvas / surface

但：
same canonical entity
+ same canvas
+ same spatial kind
= one authoritative projection
```

因此 T5 需要支持：

### 可以存在
- 同一对象在 Main 与 Workflow 分别出现；
- 同一对象在 Main 与 Context 分别出现；
- 同一对象作为 Reference / derived preview 在同一画布出现第二次；
- 同一对象在不同 Worksite 中有不同空间位置。

### 不应画成
- 同一 canvas 内两个视觉 body 都像“两个独立 canonical 实体”；
- second occurrence 暗示 duplicate/copy 已经发生；
- mirror/preview 和 authoritative projection 没有任何视觉区分。

### T5 应输出
至少定义：

```text
authoritative projection
reference / proxy
derived preview
remote mapping preview
```

四类视觉关系中哪些需要强区分，哪些只需轻提示。

---

# 3. ProjectionBinding 不是几何

T6 当前正确 seam：

```text
Canonical Entity
→ ProjectionBinding
→ Huabu spatial body
```

ProjectionBinding 只回答：

```text
projectId
canvasId
spatialKind
entityType
entityId
spatialId
```

它不拥有：

```text
x/y
width/height
camera
layout
frame bounds
contour
spatial history
```

这些属于 T1 / Huabu spatial truth。

因此 T5 不应设计出一种必须由 ProjectionBinding 持久化 geometry 才能成立的视觉系统。

---

# 4. Collection 是 durable membership，不是“一个框”

Phase B 稳定规则：

```text
Collection
= canonical project object

Entity → Collection
= durable many-to-many canonical membership

Collection → Collection
= structural nesting
```

而以下属于 Presentation / Huabu：

```text
collapsed / expanded
fan-out
Grid / Stack / Masonry
Frame body
member placement
visual containment
```

因此：

> **“看起来在 Collection 框里”不是 canonical membership 的唯一证明；“把框收起来”也绝不能删除 membership。**

T5 可以让 Collection 有很强的空间组织感，但必须保留下面这个产品事实：

```text
membership survives:
- projection removal
- collapse
- layout change
- Archive
- restart
```

---

# 5. Colony 与 Collection 必须视觉上可区分

Colony：

```text
surface-local Presentation semantic
sticky membership
peel
rescope
dissolve
organic field
derived contour
```

Collection：

```text
canonical durable membership
project-level truth
```

所以 T5 不能因为二者都可能“围住一堆对象”，就把它们设计成同一个容器换颜色。

最低差异要求：

```text
Collection:
结构性 / 长期 / 可跨 Surface 理解

Colony:
局部 / 场域性 / 组织性 / 空间涌现
```

Colony contour 是 derive-only，Core 不保存 contour points。

---

# 6. Workflow 是 durable composition，不是 Presentation layout

Workflow 有：

```text
canonical identity
durable typed composition
```

它可以长期引用：

- input material；
- Conversation / Glyth；
- Result；
- adopted action；
- Review；
- Skill usage。

但：

```text
Workflow composition
≠ Workflow visual layout
≠ ProjectionBinding
```

T5 的 Workflow 视觉可以非常具象、可编辑、可编排，但布局位置变化不能被误读成 composition relation 的增删。

---

# 7. Worksite 是 durable working identity，不是旧 Workspace 大杂烩

Worksite 稳定拥有：

```text
identity
projectId
name / intent
stable canvasId
durable working-set refs
home/origin Surface or parent Worksite ref
lifecycle
timestamps
```

Huabu 拥有：

```text
camera
node geometry
layout
spatial history
frame/body geometry
```

所以 T5 设计 Worksite 时：

### 可以强调
- “这是一个长期可恢复的工作现场”；
- 有明确进入/返回后的空间连续性；
- 其对象集合是 durable working-set。

### 不应暗示
- camera 本身是 Worksite canonical identity；
- viewport bounds 是 Core truth；
- Worksite = Collection；
- Worksite = Scope；
- “进入一个对象”自动创建 Worksite。

Worksite materialization 只由**显式用户动作**发生。

---

# 8. Conversation Child Canvas = nested Worksite

稳定语义：

```text
Conversation Child Canvas
= nested Worksite
```

它不是：

- transient preview；
- Professional Window；
- modal；
- old Workspace clone。

因此 T5 若设计 Conversation Preview / Professional Window 与 Child Canvas，二者必须具有明确的层级区别：

```text
Professional Window
= 当前 Surface 上的专业工作中间态

Conversation Child Canvas
= 可进入、可返回、具有 durable working identity 的 nested Worksite
```

---

# 9. Archive / Restore 是 lifecycle，不是 Delete / Hide

Archive：

```text
Core mark archived
→ preserve membership / relation / history
→ active Main projection eligibility false
→ reconciliation removes active projection
```

Archived object 仍然：

```text
Searchable
Referenceable
Agent-readable
Context/Workflow-referenceable
read-only
```

Restore：

```text
clear archived
→ projection eligibility true
→ reconciliation creates projection
→ T1/Huabu fresh layout
```

关键：

> Restore 不回旧 x/y。

因此 T5 至少需要提供：

```text
normal
archived / read-only
reference-to-archived
restore-in-progress / restored feedback
```

的视觉处理。

不要把 Archive 画成“垃圾桶删除动画”后从所有上下文彻底消失。

---

# 10. Remove Projection / Remove Membership / Archive / Delete 不同

T5 设计危险最大的地方就在这里。

四种动作：

```text
A. Remove Projection
B. Remove Membership
C. Archive
D. Delete
```

绝不能共用完全相同的 destructive visual grammar。

### A. Remove Projection
只影响当前 canvas/surface 的出现。

### B. Remove Membership
只移除某个 durable relation。

### C. Archive
对象仍存在，进入 archived/read-only lifecycle。

### D. Delete
真正删除 canonical object，属于更高风险生命周期动作。

T5 必须让用户能从视觉反馈理解“刚刚失去的到底是什么”。

---

# 11. Visible Host / Remote Target

Phase B 后，canonical semantics 来自目标本身，不来自鼠标键。

T6 只保证：

```text
visible host
→ semantic mutation + current projection may stay/reflow

remote target
→ semantic mapping/mutation + source projection stays source
```

T3 决定 left/right gesture grammar。

T5 应支持两类 feedback：

```text
visible host acceptance
remote target acceptance
```

但不要通过视觉把“右拖 = 某种 canonical relation”硬编码死。

---

# 12. Context 顶层不是一个隐藏 canonical membership 容器

Context Atlas 顶层是：

```text
whole Project 的 derived interpretation
```

时间、topic、source、evolution、relation 都是 interpretation。

因此 T5 不应设计出一个“Context 顶层文件夹”并暗示对象被持久化塞进某个 Context Scope。

只有显式 fixation/materialization 才可能进入：

```text
Collection
Workflow
Long-term Worksite
existing canonical Context artifact
```

---

# 13. Assembly 是 router，不是 owner

Assembly：

```text
Project-shared Source Bay + Target
```

它可以接收 typed canonical target ref。

但 Assembly 自己不拥有：

```text
membership
relation
Skill binding
Collection containment
Workflow composition
```

T5 可以把 Assembly 设计成非常强的专业装配工作台，但视觉上不能让它看起来像“另一个项目数据库”。

---

# 14. Skill usage

稳定规则：

```text
Skill package
= canonical unique object

Composer 中一次选择 Skill
= per-run input

明确长期绑定到 Workflow / Glyth
= durable capability-use relation
```

因此 T5 至少应区分：

```text
ephemeral selected-for-this-run
durable attached capability
```

不要把 Composer 内一次点选直接画成永久 attachment。

---

# 15. T5 必须返回的视觉状态答案

T6 不要求 T5 返回数据库方案。

只需要 T5 在最终视觉稿中明确以下状态：

```text
01 authoritative projection
02 reference / proxy
03 remote mapping preview
04 Collection member vs merely spatially inside
05 Colony member / sticky / peeled
06 Workflow composed item vs merely visually nearby
07 Worksite active / inactive / nested
08 archived
09 archived-reference / read-only
10 restored / fresh placement
11 projection removed but canonical object still exists
12 membership removed but object still exists
13 explicit destructive delete
14 ephemeral Skill selection vs durable Skill use
15 Assembly source vs target vs applied state
```

---

# 16. T5 不需要关心的 T6 内部细节

以下不应塞给 T5：

```text
legacy DB table retirement sequence
compat-read implementation
event cursor storage schema
idempotency token implementation
migration SQL details
old Scope endpoint retirement order
ResultSlot transaction internals
```

除非某项会真实限制视觉状态。

---

# 17. T5 的权限边界

T5 可以提出：

> “这个 truth 在当前视觉方案里无法自然呈现。”

T5 不直接把 truth 改成另一个。

若发生冲突：

```text
T5 reports conflict
→ Coordinator decides
```

这保持整个项目不会在“画得更顺眼”时顺手把 canonical model 改掉。

---

# 18. 一句话交付

T5 最终需要画的不是数据库。

T5 要画清楚的是：

> **一个 canonical object 如何在不同 Surface 被看见、被引用、被组织、被归档、被恢复，而用户始终不会误以为视觉变化本身改写了 truth。**

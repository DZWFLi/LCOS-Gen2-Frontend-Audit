# LCOS Gen2 · T6 → T5
# 02 · Visual State / Interaction Constraint Matrix
## Core Truth 状态如何进入最终视觉与动效

**日期：2026-09-06**  
**来源线程：T6**  
**接收线程：T5**  
**性质：视觉状态矩阵 / interaction-state constraint，不替代 T1/T2/T3/T4 的专项输入**

---

# 0. 使用方式

T5 在做最终 body、motion、density、LOD、donor adoption 时，不需要重新推理 Core。

直接按本矩阵检查：

```text
这个状态是否存在？
是否 durable？
是否只影响 projection？
是否 read-only？
是否需要 fresh placement？
是否允许当前 body 继续存在？
视觉反馈是否会误导 canonical truth？
```

---

# 1. Master State Matrix

| Object / State | Canonical object exists | Durable semantic relation | Projection may exist | Editable | T5 visual must communicate |
|---|---:|---:|---:|---:|---|
| Normal canonical object | YES | optional | YES | YES | normal authoritative body |
| Reference / Proxy | YES | no new identity | YES, derived | usually contextual | clearly secondary occurrence |
| Remote mapping preview | YES | target-dependent | source stays | preview only | target accepted without implying move |
| Collection member | YES | YES | optional | YES | durable membership independent of frame |
| Spatially inside Collection frame only | YES | NO | YES | YES | do not imply membership |
| Colony member | YES | surface-local sticky | YES | YES | organic local grouping, not project container |
| Workflow composed item | YES | YES | YES/NO | depends | durable composition separate from layout |
| Worksite working-set member | YES | YES | YES/NO | YES | belongs to durable working context |
| Archived | YES | preserved | active Main normally NO | NO/read-only | retained identity, not deleted |
| Archived reference | YES | preserved | derived/read-only may appear | NO | archived status remains legible |
| Restored | YES | preserved | YES after reconcile | YES | fresh return, not old-position resurrection |
| Projection removed | YES | preserved | NO on that canvas | YES elsewhere | disappearance is local, not deletion |
| Membership removed | YES | changed only for target relation | projection may stay | YES | object remains, relation ended |
| Delete | NO after commit | relations cascade/retire | NO | NO | true destructive finality |
| Skill selected for run | YES | NO durable binding | composer-local | YES | ephemeral |
| Durable Skill use | YES | YES typed relation | surface-dependent | YES | attached capability, not one-run chip |

---

# 2. Projection States

## P0 · Authoritative Projection

Meaning:

```text
canonical entity
→ current canvas authoritative spatial occurrence
```

T5 visual:

- normal body；
- full interaction affordance；
- normal selection；
- can expose Action Arc / Composer according to T3/T4 rules。

禁止：

- 和 Reference / Preview 完全同权重。

---

## P1 · Reference / Proxy

Meaning:

```text
same canonical identity
second visual occurrence
without second authoritative projection
```

T5 should make it legible as：

```text
same thing, different occurrence
```

可用方法由 T5 决定，例如：

- subtle linked badge；
- lower material authority；
- edge treatment；
- source indicator；
- contextual tether。

不规定具体美术方案，但必须不产生“复制了一个新对象”的误解。

---

## P2 · Projection Removed

Meaning：

```text
canonical entity still exists
current canvas occurrence removed
```

视觉反馈不应使用：

```text
full delete collapse
global destructive warning
```

更接近：

```text
remove from here
detach from surface
```

---

# 3. Collection States

## C0 · Durable Member

Truth：

```text
Entity ∈ Collection
```

无论：

- Collection body collapsed；
- member visually outside frame；
- member projection temporarily absent；
- object archived；

membership 都可以继续存在。

T5 必须避免：

> “只有在框里面才算属于 Collection”。

---

## C1 · Spatially Inside but Not Member

这是视觉容易制造错误 truth 的状态。

T5 需要让：

```text
position overlap
```

与：

```text
membership accepted
```

之间存在反馈差异。

例如 Drop preview、accept feedback、membership marker 的强弱由 T5 决定。

---

## C2 · Collection Collapsed

Collapse 只影响 Presentation。

因此：

```text
collapse
!= remove members
!= archive members
```

Collapsed body 仍应能表达：

- durable contents exist；
- member count/preview 可以 derived；
- reopen 后恢复视觉组织，不发生 canonical mutation。

---

# 4. Colony States

## K0 · Sticky Member
表示当前 Surface 的组织关系仍生效。

## K1 · Peel
对象从 Colony 场域剥离，但 canonical identity 不变。

## K2 · Rescope
Colony surface-local semantics 重组。

## K3 · Dissolve
Colony 本身的 Presentation grouping 消失，不删除 underlying entities。

T5 动效必须强调：

```text
field/group dissolves
objects survive
```

不要使用 Collection deletion grammar。

---

# 5. Workflow States

## W0 · Candidate / Proposal

若 Agent 只是建议：

```text
no canonical Workflow mutation
```

T5 应表达 proposal / preview，而不是“已经进 Workflow”。

---

## W1 · Adopted

显式 adoption 后：

```text
create/reuse canonical Workflow
persist typed composition
source entity remains original identity
```

T5 反馈应是：

```text
relationship adopted
not object cloned
```

---

## W2 · Re-layout

Workflow body 内拖动、排序、重新布局：

```text
presentation change
```

不能自动等同：

```text
composition relation change
```

若 T3/T4 定义某个 drop target 明确表示 composition mutation，则走明确 acceptance feedback。

---

# 6. Worksite States

## WS0 · Non-materialized temporary detail

Temporary detail / Work View 不自动成为 Worksite。

T5 不能因为 UI 展开时间长、节点多、窗口被 dock，就视觉上暗示“已经保存为长期 Worksite”。

---

## WS1 · Explicitly Materialized Worksite

显式动作后：

```text
durable identity
stable canvasId
durable working-set
```

T5 可以提供清楚的“被固定 / 成为长期现场”的确认反馈。

---

## WS2 · Active Worksite

当前进入的工作现场。

T2 负责 Enter/Return/Arrival；T5 负责最终视觉语言。

---

## WS3 · Nested Worksite / Conversation Child Canvas

与 Professional Window 必须区分。

Nested Worksite 是可进入/返回的 durable place。

---

# 7. Archive / Restore States

## A0 · Archive request preview

这是 destructive-ish 但非 Delete。

预览/确认不应文案或动效暗示永久销毁。

---

## A1 · Archived

Truth：

```text
identity preserved
relations preserved
membership preserved
history preserved
active Main projection removed
read-only
```

T5 应明确：

```text
retained but inactive
```

---

## A2 · Archived Reference

Archived object 仍可在 Context / Workflow / Search / Agent result 中被引用。

视觉需同时传达：

```text
this object exists
+
it is archived/read-only
```

不能因为出现了 reference body 就恢复成 normal editable appearance。

---

## A3 · Restore

Restore 后：

```text
same canonical entity
fresh projection placement
```

所以 Restore 动效不要做：

```text
teleport exactly back to old x/y
```

除非 T1/Huabu 恰好 fresh layout 算到了类似位置，那只是结果，不是 contract。

---

# 8. Semantic Drop Visual States

T6 不定义 left/right gesture。

T3 定义 gesture grammar。

T5 需要支持以下 target states：

```text
target-neutral
target-hover
semantic-acceptable
semantic-rejected
pending proposal
accepted
remote accepted
```

### Visible Host
可以：

```text
semantic mutation
+
current projection stay/reflow
```

### Remote Target
应：

```text
semantic mutation/mapping accepted
+
source projection stays
```

所以 remote acceptance 不应该用“对象被吸走”的唯一视觉语法。

---

# 9. Assembly States

Assembly 只路由 canonical services。

T5 至少需要视觉区分：

```text
Source Bay item
Target
Target-ready
Applying
Applied
Rejected / unsupported
```

“Applied”反馈表示 target command 成功。

不表示：

```text
Assembly now owns this object
```

---

# 10. Skill States

## S0 · Available Skill
catalog/package state。

## S1 · Selected for current Run
ephemeral composer state。

## S2 · Durable capability-use relation
长期 Workflow/Glyth attachment。

三者不要使用完全相同的“已绑定”视觉。

---

# 11. Read-only Grammar

至少以下对象可能 read-only：

```text
Archived object
Archived reference
Historical/derived occurrence
Remote projection/preview depending on context
```

T5 应提供统一但可扩展的 read-only grammar。

它应区别于：

```text
disabled because loading
disabled because permission
disabled because unsupported
```

否则用户会把 lifecycle、权限、等待状态混成一锅灰色 UI。

---

# 12. Realtime / Recovery 对视觉的最低要求

T6 负责 ProjectEvent / reconnect / reconcile。

T5 不需要设计技术 cursor。

但最终视觉必须能承受：

```text
temporary stale
reconnecting
reconciled
projection removed by recovered truth
projection recreated after restore
```

原则：

- 不让短暂 reconnect 产生大面积 destructive animation；
- reconciliation 后以 truth 为准；
- 本地 transient selection/composer 尽可能由对应线程保留，不应因为一次 refetch 全页闪烁重建。

---

# 13. T5 与其它线程的 owner 边界

| 问题 | Owner |
|---|---|
| geometry / layout / contour / spatial placement | T1 + Huabu |
| Enter / Return / Arrival / Railway / Minimap | T2 |
| gesture / Action Arc / Composer / Semantic Drop grammar | T3 |
| Work View / Context / Workflow / Assembly / Skill professional UX | T4 |
| final body / visual density / motion / LOD / donor fidelity | T5 |
| canonical identity / membership / projection / archive / recovery | T6 |

T5 遇到无法自然呈现的 truth：

```text
report conflict
```

而不是跨线程重定义。

---

# 14. T5 Final Review Checklist

T5 最终稿至少逐项回答：

```text
[ ] authoritative projection 与 Reference 是否可区分
[ ] same entity 在不同 Surface 的视觉身份是否保持一致
[ ] Collection membership 与 spatial containment 是否可区分
[ ] Collection 与 Colony 是否不会混
[ ] Workflow composition 与 layout 是否不会混
[ ] Worksite 与 transient Work View 是否不会混
[ ] Professional Window 与 nested Worksite 是否不会混
[ ] Archive 是否明确不是 Delete
[ ] Archived reference 是否仍体现 read-only lifecycle
[ ] Restore 是否允许 fresh placement
[ ] Remove Projection 是否不被误读为 Delete
[ ] Remove Membership 是否不被误读为 Remove Projection
[ ] Remote target acceptance 是否不吸走 source projection
[ ] Skill one-run selection 与 durable use 是否不同
[ ] Assembly 是否像 router/workbench，而不是第二 owner
[ ] reconnect/reconcile 不要求整个 UI 重建
```

---

# 15. T5 回传格式

T5 无需回数据库字段。

请回：

```text
STATE
→ VISUAL BODY
→ LOD
→ MOTION / TRANSITION
→ ACTIVE AFFORDANCE
→ READ-ONLY AFFORDANCE
→ DONOR SOURCE
→ IMPLEMENTATION NOTES
→ CONFLICT (if any)
```

这样 T1/T2/T3/T4/T6 可以把最终视觉 patch 精确回写到各自源码施工卡。

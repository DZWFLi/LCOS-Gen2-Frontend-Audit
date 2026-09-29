# LCOS Gen2 · 三视频交互合同 × RhineLabUI Source Donor 统一裁决
## Context / Workflow / Temporal Rail / Motion Runtime 视觉与交互正本

日期：2026-09-10  
状态：`PRODUCT INTERACTION FREEZE / T5 FRONTEND INPUT / NON-BLOCKING`  
用途：将 2026-09-08 至 2026-09-10 围绕 Context、Workflow、Temporal Rail、Global HUD / Navigator、Assembly 的多轮讨论，统一回收到一套不互相冲突的产品与动效合同。

---

# 0. 这份文档解决什么

过去几轮最容易混淆的其实不是单个按钮，而是五件不同的东西被长得太像：

1. 三个独立 Worksite：Main / Context / Workflow；
2. 跨 Worksite 的 Global HUD / Global Navigator；
3. Context / Workflow 各自可呼出的“强 Representation”；
4. Context 子画布独有的 Temporal Rail；
5. Assembly 项目仓库。

本稿先冻结边界，再把三条用户参考视频与 RhineLabUI 源码 donor 对应到具体交互。

---

# 1. 顶层架构不变

冻结：

> 一个 Project Truth → 三个独立 Worksite。

```text
Project / Canonical Truth
        │
        ├── Main Worksite
        │    ├ canvasId
        │    ├ camera
        │    ├ selection
        │    ├ layout
        │    └ history
        │
        ├── Context Worksite
        │    ├ canvasId
        │    ├ camera
        │    ├ selection
        │    ├ layout
        │    └ history
        │
        └── Workflow Worksite
             ├ canvasId
             ├ camera
             ├ selection
             ├ layout
             └ history
```

共享的是 Kernel / canonical semantics / Project objects / Pin / Selection primitives 等基础能力。

**不是同一个 Canvas 切三种 mode。**

---

# 2. Global HUD

底部 Main / Context / Workflow HUD 常驻。

作用：

```text
切 Main
切 Context
切 Workflow
```

这是 Worksite Switcher。

Context Atlas、Workflow Cards、Global Navigator 等临时强 Representation 呼出时：

```text
HUD 轻微弱化 / 让位
```

关闭强 Representation：

```text
HUD 恢复
当前 Worksite 不变
```

---

# 3. Global Navigator

Global Navigator 是跨三个 Worksite 的统一“地址系统”。

对象：

- Pin
- Color Pin
- Glyth
- Focus Mark
- 重要对象自带的 navigation mark
- 被用户或 Agent 标记的区域 / Artifact / Workflow / Context target

统一提供两种动作：

```text
Go there
→ 切到真实 Worksite / Canvas
→ Camera / Selection Focus

Find / Use
→ 不切 Worksite
→ 不移动当前 Camera
→ Assembly 的 Pinned / Marked 中直接找到
→ 可拖到当前工作现场
```

这两种行为必须分开。

---

# 4. Assembly

Assembly 不再理解为一个必须进入的重型“装配页面”。

Assembly = 当前工作现场旁边可随时打开的 Project Warehouse。

能力：

- 分类
- Search
- RAG semantic search
- Pinned / Marked
- Recent
- Artifact
- Context
- Workflow
- Skill
- Run / Result
- Note / Link / media
- 拖入当前 Canvas

核心：

> 用户不应为了“拿一个东西”离开当前子画布。

Assembly 不建立第二 Project truth。

---

# 5. Context 的两级导航

## 5.1 大 Context Atlas

作用：

> 快速找到“大 Context 集合”。

特征：

- 呼出式浮层；
- 规整 2.5D 阵列；
- 数量相对少；
- 每块 = 一个 Context collection / large context block；
- 默认按时间，亦可按 Context 性质重排；
- 高度有差；
- 有空间 Avenue / Shelf / street 作为秩序骨架；
- 有搜索；
- Hover / Focus 有连续波浪；
- 选中的 body 单独抬起；
- Pin / Glyth 标签跟随；
- 可做集合级操作：
  - merge
  - split
  - extract
  - move
  - rename
  - delete collection shell

删除 collection ≠ 删除其中真实 canonical objects。

双击 / Enter：

```text
Context Atlas body
→ 进入该集合对应的 Context child canvas
```

---

## 5.2 Context child canvas

这里才是真正的工作现场。

真实对象：

- Conversation
- Artifact
- Result
- Decision
- Reference
- Note
- Skill
- Relation
- 等

空间布局不被时间轴绑死。

Agent 可以根据当前任务选择不同 Presentation：

```text
按时间组织
按概念组织
或未来其他合适组织
```

这些只是 display layout。

不是第二 Context truth。

---

# 6. Temporal Rail

Temporal Rail 只属于当前 Context child canvas。

它不是：

- Global Navigator；
- Railway；
- Context Atlas；
- 全局时间轴；
- 单个 node list。

它是：

> 当前子 Context 的局部时间导航 / temporal minimap。

推荐放 **右侧**：

- 左侧已存在 Railway；
- 右侧短线向左、朝向 Canvas 展开；
- 更符合用户提供的录屏手感。

---

# 7. Temporal Rail 的基本手感

来自 2026-09-10 用户录屏的冻结观察：

## 静止

- 高密度短灰线；
- 不应有一根永久黑色 current cursor；
- 不应平均铺满整个屏幕高度；
- 使用固定 pitch，窗口变高时仍保持 Codex-like 密度。

## Hover

```text
hover target slice
→ target 临时变黑
→ target 向 Canvas 方向明显凸出
→ 上下邻居按距离平滑增长
→ 形成局部 fisheye / Dock-like lens
→ 浮出轻量 preview
```

离开：

```text
黑条消失
邻居恢复
```

## Wheel

滚轮改变：

> 当前正在查看的 temporal window。

不是拖着一个永久黑 handle 移动。

当前时间窗口可用克制的中灰 activity band 表达。

## Click

```text
Temporal Episode
→ target identities
→ Context Canvas Selection
→ Camera fit / Focus 对应真实区域
```

---

# 8. Temporal Rail 不是“一根 = 一个 node”

当一个 Context 里有几十甚至上百真实对象时，默认 Rail 不逐节点绘制。

正确层级：

```text
Canonical timed events
        │
        ▼
Deterministic Temporal Index
        │
        ▼
Agent Episode Projection
        │
        ├ FAR  → Episode
        ├ MID  → Sub-episode
        └ NEAR → Event
```

默认 Rail 主要导航 Episode / meaningful temporal activity。

一个 Episode 可包含：

- 1 个 node；
- 20 个 nodes；
- 一组关系链；
- 一组 semantic cluster；
- Run + Result + Feedback；
- Conversation + edits + Decision；
- 同一迭代中的多个 Artifact versions。

---

# 9. Episode 如何生成

采用：

> 确定性事实底座 + Agent 语义聚合。

## Layer A · Deterministic

基于真实 timestamp：

- create
- edit
- Conversation
- import
- Run start
- Result
- Feedback
- Decision
- version
- review
- 等

排序产生事实时间索引。

## Layer B · Agent

Agent 判断：

- 时间是否接近；
- 是否作用于同一批 canonical objects；
- 是否属于同一 Context scope；
- 是否存在 Relation；
- Run / Result / Feedback 是否属同一迭代；
- 是否围绕同一个目标；
- 用户是否显式分组；
- 是否有跨时间延续。

Agent 输出：

```text
Episode boundary
Episode title
summary
representative targets
semantic cohesion
importance hint
```

Agent grouping 是 derived projection，不创建新 Collection / Context truth。

---

# 10. Temporal Rail 长度规则

长度不直接等于 node 数量。

推荐：

> 连续 score → 量化为 5 档视觉长度。

基础五档：

```text
L0  7–8px
L1  10–12px
L2  14–18px
L3  20–26px
L4  28–38px
```

具体 token 由 T5 baseline 再标定。

底层 score 可综合：

```text
event count
object coverage
change magnitude
Run / Result significance
user feedback / decision weight
semantic cohesion
relation density
```

但视觉上只表达相对层级，不默认暴露“精确分数”。

关键：

```text
静止长度
= activity / episode weight

Hover 额外凸出
= interaction fisheye
```

两者不混。

---

# 11. Workflow 的强 Representation

Workflow Worksite 是独立真实画布。

需要快速调取 Workflow 时：

```text
Workflow Cards summon layer
```

一张卡 = 一个完整 Workflow。

卡面极简：

- material
- user-uploaded image（可选）
- Workflow name
- small tag / label
- 轻状态（若确有必要）

单击：

```text
light preview
```

双击 / Enter：

```text
如果 Workflow 是共享 Worksite 上的一块 region
→ Focus region

如果 Workflow 有独立 subcanvas
→ enter subcanvas
```

产品层不要硬限制成一种。

---

# 12. Workflow Card Pool

Workflow 数量大时不能只靠手牌式轮转。

提供 Card Pool：

- 放大；
- 网格 / 卡牌池；
- Search；
- Filter；
- 直接选择；
- 双击打开；
- 仍是同一批 Workflow identity。

手牌式轮转：

> 适合少量、最近、推荐、常用。

Card Pool：

> 适合 20+ Workflow 的快速检索。

---

# 13. 三条用户参考视频分别解决什么

---

## Video A · Project Memory Shelf

文件：

`6d968fd434860abf063346eb710a0e67.mp4`

时长约 149s。

已经 1FPS 抽取 149 帧。

给 LCOS 的核心：

### 结构

- 少量大对象；
- Shelf / Rail / Avenue 规整组织；
- 负空间形成 street；
- 对象有内容 skin；
- Overview 清楚。

### Focus

```text
overview
→ select same in-situ body
→ camera approach
→ context remains
→ detail
→ restore
```

给 Context Atlas：

- 规整阵列；
- Avenue / shelf；
- Focus 同位；
- Detail 不脱离项目世界；
- Restore 稳定。

---

## Video B · Temporal Rail Recording

文件：

`2026-09-10 02-01-20.mp4`

时长约 14.7s，1920×1080。

给 Temporal Rail：

- 高密度短灰线；
- Hover 局部黑色突出；
- 邻近线按距离变化；
- 不存在永久黑 current bar；
- 滚动 / 时间区段移动；
- 内容 preview 从 Rail 向内容区域展开；
- Rail 是交互导航，而不是装饰刻度。

LCOS 适配：

> 原录屏在左侧；因为 LCOS 左侧已有 Railway，本产品将 Rail 镜像到右侧，使所有横条朝 Canvas 向左展开。

这是产品适配，不是误读视频。

---

## Video C · Vertical Motion Reference

文件：

`ac60764a666a31d74f750ce9bb9e35b9.mp4`

时长约 18.36s，480×1056。

最值得拿的是：

> 一个很小的起始形态，可以连续生长 / 拉伸 / 分裂 / 组合成完整 UI body。

核心不是红白皮肤，而是：

- small seed → structured body；
- pill → strip / stack；
- body morph；
- surrounding space participates；
- UI 不像“元素突然出现”；
- transition 本身表达结构形成。

给 Workflow / Context candidate：

```text
Extend
Gather
Split
Merge
Materialize
Retract
Settle
```

---

# 14. RhineLabUI 不算三条用户参考视频，而是源码工程 donor

RhineLabUI 提供：

- `damp(value, velocity, target)`；
- spatial field；
- `archiveWave`；
- `settlingWave`；
- `selection pulse`；
- current-state reversal；
- outgoing visual state；
- control camera → rendered camera；
- log-distance zoom；
- shortest-angle reset；
- world→screen anchor；
- bounded render pool；
- motion verification。

用户三视频负责“我们要什么感觉”。

RhineLabUI 负责“这些感觉怎样稳定写进真实 Web 前端”。

---

# 15. 四者合并后的 Motion Grammar

```text
STRUCTURAL
Extend
Gather
Split
Merge
Lift
Isolate
Materialize
Retract
Settle
Return

SIGNAL
Ripple
Pulse
Temporal Fisheye
Activity Band
Pin Highlight

CAMERA
Approach
Reframe
Focus
Restore
Region Fit

AMBIENT
Low-amplitude drift
Subtle field response
```

---

# 16. Figma baseline 与 donor 的关系

用户提供的开源 Figma component library 作为 T5 视觉 baseline。

它负责：

- container
- spacing
- typography
- button / chip
- panel
- state
- icon
- node anatomy
- feedback
- density

三视频 + donor 负责：

- spatial behavior
- motion
- focus
- navigation
- representation
- LCOS signature interaction

不要再让 HTML prototype 自己发明一套完整 design system。

---

# 17. 最终一句

现在 LCOS 的交互主线可以被压成：

> **三张独立工作画布保持真实工作现场；需要找大的，就呼出 Atlas / Cards；需要找细的，就用局部 Rail / Global Pin；需要拿东西，就从 Assembly 直接拖；所有强 Representation 都只帮助理解和导航，不夺走真实 Canvas 的工作权。**

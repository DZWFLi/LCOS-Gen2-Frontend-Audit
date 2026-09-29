# LCOS Gen2 · T4 → T5
# C1-3 Assembly Visual-State Delta

日期：2026-09-06  
状态：`T5 MAY CONSUME NOW`

> 这是对此前 `T4 → T5 C1 Engineering Seams Handoff` 的增量。
> 不替代 C1-0/1/2，只补 Assembly 真实工程状态。

---

# 1. Assembly 现在可以正式锁 body 了

工程已经确认：

```text
Assembly
= 一个 Project-shared Professional Window

不是：
Main Assembly
Context Assembly
Workflow Assembly
Conversation Assembly
四套窗口
```

Window region：

```text
lcos:assembly
```

target 随当前工作现场注入。

---

# 2. Source Bay 四区真实存在

```text
PROJECT
CAPTURE
SOURCES
SKILLS
```

但它们不是同一数据库。

```text
PROJECT
→ Warehouse read model

CAPTURE
→ system/global Capture Space

SOURCES
→ Project Resources

SKILLS
→ layered Skill Catalog
```

所以视觉上可以统一，数据行为不要假装完全相同。

---

# 3. Project

真实能力：

```text
search
kind filter
provenance filter
cursor pagination
approx total
```

适合：

```text
高密度长期 Project material browser
```

---

# 4. Capture

真实语义：

```text
系统级临时收集区
不属于任何 Project
```

Assembly里看到的是：

```text
“还没正式进入项目的材料”
```

不是：

```text
Project里的第二个素材库
```

视觉上建议让它比 Project materials 更有：

```text
inbox / staging / temporary
```

感觉，但不要做成垃圾桶。

---

# 5. Sources

当前是 Project Resource descriptors。

第一层真实字段偏轻：

```text
title
source kind
understanding status
```

detail/descriptor按需读取。

不要一打开 Sources 就把每张卡塞满技术 metadata。

---

# 6. Skills

当前 list：

```text
id
name
description
source:
system / user / merged
```

Skill 是能力，不是文件缩略图。

因此可和 material cards使用同一个 grid rhythm，但建议 body形态有明显 capability identity。

---

# 7. Item states

T5可正式做：

```text
REST
HOVER
SELECTED
MULTI_SELECTED
DRAGGING

PREVIEW_LOADING
PREVIEW_READY

READ_ONLY
UNAVAILABLE
```

---

# 8. Target states

```text
TARGET_READY
TARGET_ACCEPT
TARGET_REJECT
TARGET_CHANGED
```

target默认来自当前现场。

不要默认画一个大“选择目标”的表单。

---

# 9. Apply states

这批是 C1-3 新确认的关键：

```text
APPLYING
APPLIED
SKIPPED_ALREADY_MEMBER
PARTIAL
FAILED
UNSUPPORTED
```

`PARTIAL` 必须有独立视觉。

因为 Core 可能：

```text
HTTP 200
但 3项里：
2 applied
1 failed
```

所以不要只有：

```text
success toast / error toast
```

两态。

---

# 10. Already-member

已有对象再次 Apply：

```text
不是 Error
```

应表达：

```text
已经在这里 / 无需重复添加
```

反馈要轻。

不要红色警告。

---

# 11. Unsupported

例如 current Skill target command尚未落地时：

```text
UNSUPPORTED
```

它不是网络错误。

视觉上应该区别：

```text
“当前目标暂不支持这个能力”
```

和：

```text
“系统请求失败”
```

---

# 12. Partial

建议视觉层级：

```text
整体：
部分完成

item：
✓ applied
• already here
! failed
```

但具体 glyph/material 由 T5决定。

重点是：

```text
失败项不能被成功态淹没
```

---

# 13. Drag 与 Apply

Source item拖动只代表：

```text
送出 canonical sourceRef
```

Window移动仍然只能从 Window chrome。

所以：

```text
Assembly item drag feedback
≠ Window dock feedback
```

继续严格区分。

---

# 14. Capture apply特别反馈

Capture第一次成功时，背后可能发生：

```text
staging
→ materialize Project artifact/view
→ target membership
```

但用户不需要看到两步技术流程。

只需要：

```text
进入当前工作目标
```

如果第二步失败：

```text
PARTIAL / retryable context
```

后端会幂等复用第一次物化结果。

不要设计“回滚动画把素材吸回 Capture”这种会误导 canonical reality 的表现。

---

# 15. Search

视觉可统一一个轻 Search。

底层：

```text
Project / Skills
→ server filtering

Capture / Resources
→ current first pass local filtering
```

不要暴露四个搜索模式。

---

# 16. Pagination 差异

```text
Project Warehouse
→ cursor pagination

Capture
→ limit snapshot

Resources
→ no current pagination

Skills
→ no current pagination
```

所以 T5不要硬画：

```text
四页完全一样的 Load More footer
```

优先做：

```text
连续浏览体验
```

具体加载 mechanic由 body adapter处理。

---

# 17. Virtualization

Huabu已经有：

```text
react-virtuoso
```

所以 T5可以大胆设计高密度长浏览区。

但 variable-height Masonry 最终要以实现 proof 为准。

Lovart：

```text
借视觉语言 / density / hierarchy
```

不是直接复制代码。

---

# 18. Target identity

Assembly顶部/局部需要让用户知道：

```text
“现在这些东西会给谁”
```

但因为 target来自现场：

```text
Main / Context / Workflow / Conversation
```

建议：

```text
轻量 context indicator
```

不要做：

```text
大型 Select Target form
```

---

# 19. 多 Source error 隔离

真实工程允许：

```text
Capture unavailable
但 Project / Sources / Skills仍可用
```

所以视觉要支持：

```text
section-level unavailable/error
```

不能整个 Assembly一报错就白屏。

---

# 20. 推荐 T5 本轮正式产出

现在可以锁：

```text
A. Assembly overall body
B. Source Bay four-section navigation
C. Project material browser
D. Capture staging visual
E. Resources source cards
F. Skill capability cards
G. target indicator
H. multi-select
I. semantic drag
J. applied / already / partial / failed / unsupported
K. section-level loading/error/empty
```

---

# 21. 暂时不要画成产品事实的东西

不要：

```text
Assembly membership editor
Scope selector
Collection tree作为Assembly truth
Skill binding table
per-Surface Assembly instances
unified four-source database schema
```

这些都不是 T4/C1-3 当前工程 truth。

---

# 22. 一句话

> **Assembly 可以长得像一个非常成熟、漂亮、低 chrome 的素材与能力装配台，但底下永远是四路 canonical source + 一个 typed target + 一次诚实的 apply result，而不是另造一个“万能资产后台”。**

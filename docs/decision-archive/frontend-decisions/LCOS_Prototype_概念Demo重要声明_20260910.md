# ⚠️ 重要声明：本包中的 HTML / Prototype 仅为极基础概念 Demo

日期：2026-09-10

## 核心结论

本包中的所有 HTML prototype、交互 mock、临时视觉演示与截图，**都非常基础、非常粗糙，远未达到 LCOS Gen2 最终产品应有的完整度与视觉质量**。

它们只能作为：

- 产品层级关系的概念参考；
- 交互心智验证；
- 不同 UI 层职责的白模；
- 后续 T5 / Codex / 前端施工的行为草图。

**绝对不能直接作为最终 UI、最终 UX、最终动效、最终 Camera、最终布局、最终组件尺寸、最终响应式方案或生产验收标准。**

---

## 当前仍大量不完善

目前 prototype 在以下方面都只是最低限度模拟：

### 视觉
- 排版、字体、间距、色彩、材质、阴影、边框；
- Node anatomy、HUD、Pin、Glyth、图标、状态反馈；
- Context Atlas body 的材质、内容 skin、高度比例与空间秩序；
- Workflow Card 的最终质感、卡牌池密度、封面处理；
- 与用户指定 Figma component baseline 的一致性。

最终视觉必须以后续 **Figma baseline** 为主重新统一。

### Motion / Camera
当前 transition、easing、duration、displacement、zoom 都只是概念值。

最终必须继续对照：
1. Project Memory Shelf 视频；
2. Temporal Rail 录屏；
3. Vertical Motion Reference；
4. RhineLabUI exact source donor。

尤其仍需完善：
- spatial field / ripple / wave；
- fisheye；
- lift / gather / split / merge / settle；
- Camera approach / reframe / restore；
- current-state reverse；
- velocity preservation；
- outgoing visual state；
- world→screen anchor；
- focus / selection continuity。

### Temporal Rail
当前只证明：
- Rail 属于 Context child canvas；
- 右侧更合理；
- fixed-density / fixed-pitch；
- 无永久黑 current cursor；
- Hover 临时黑条 + 邻近 fisheye；
- Wheel 改 temporal window；
- Click 可映射到真实 Canvas targets；
- 默认单位应为 Episode，而非一 tick 一 node。

仍未完整实现：
- Episode / Sub-episode / Event 多级语义缩放；
- Episode 聚合算法；
- activity scoring 最终函数；
- 五档长度 token；
- 极端密度与 virtualization；
- touch / pen / accessibility；
- reduced motion；
- 与真实 Huabu Camera / Selection 的正式接线。

**所以 Temporal Rail HTML 只能看交互方向，不能看完成度。**

### Context Atlas
当前只验证：
- 规整 2.5D 阵列；
- Time / Nature derived layout；
- Avenue / Shelf / Street 秩序骨架；
- 高度差；
- Wave / Focus；
- Pin / Glyth；
- Search；
- collection-level open / merge / split / extract / delete grouping。

最终还需要显著提升：
- 空间完整度；
- Three.js / WebGL 质感；
- Camera 连续性；
- body material / content skin；
- focus / restore；
- 大规模 Context 浏览与搜索；
- 与 Global HUD / Railway / safe rect 的协调。

**禁止直接照抄当前柱体、街道、颜色、比例与排布。**

### Workflow Cards
当前只验证：
- 一张 card = 一个完整 Workflow；
- cover / material / user image / name / tag；
- click preview；
- double click / Enter 进入真实 Workflow；
- 多 Workflow 用 Card Pool / Search。

尚未完成：
- 最终 hand fan geometry；
- card material system；
- user image crop；
- card pool density；
- drag / assembly；
- motion polish；
- responsive / touch / accessibility。

---

## 顶层结构 Demo 也只是结构验证

综合 HTML 只用于说明：

```text
Project Truth
├ Main Worksite
├ Context Worksite
└ Workflow Worksite
```

三者是独立 runtime worksite，而不是同一 Canvas 的三个 mode。

以及：

```text
Global HUD
Global Navigator
Assembly
Context Atlas local summon
Workflow Cards local summon
Context Temporal Rail local navigation
```

这些关系如何共存。

它**没有完整实现**：
- 真实 worksite persistence；
- 真实 camera save / restore；
- 真实 selection owner；
- Huabu history；
- Work View safe rect；
- Minimap / Spatial Navigator；
- 完整 overlay collision；
- keyboard focus；
- touch；
- production state machine。

---

## 正确的权威顺序

### 产品语义 / UX
1. 用户最新原话；
2. 最新冻结裁决；
3. 当前施工正本 / 作业 MD。

### 最终视觉
1. 用户指定的 Figma component baseline；
2. LCOS 已冻结 GUI / HUD / Railway / Node / Composer 规范；
3. 成熟 donor primitive。

### Motion / Spatial
1. 三条用户参考视频；
2. RhineLabUI source donor；
3. 当前 HTML prototype 仅作为概念参考。

---

## 禁止误用

后续施工 Agent 不得：

- 像素级照抄 prototype；
- 把 prototype CSS 当 design tokens；
- 把当前 demo 布局写死；
- 从 mock 数据反推 domain schema；
- 把 demo Canvas 当 Huabu current source；
- 因 demo 画了某按钮就判断产品必须常驻该按钮；
- 因 demo 没画某能力就认为该能力被删除；
- 把 demo transition 参数当正式 motion contract；
- 把“能运行”误判成“已经完成”。

---

## 正确理解

请把当前 prototype 当作：

> **交互白模 / 行为草图 / Concept Proof。**

它们回答：

- 谁和谁是什么关系；
- 从哪里呼出；
- Focus 以后发生什么；
- 关闭后回哪里；
- 全局导航与局部导航如何区分；
- Card / Context body / Episode 分别代表什么。

它们不回答：

- 最终有多好看；
- 最终动效有多高级；
- Camera 精确怎么跑；
- 最终组件尺寸；
- 正式产品完成度。

---

# 最终提醒

> **如果后续正式实现“看起来和当前 HTML 差不多”，应该视为没有完成视觉与交互深化，而不是成功还原。**

最终效果必须显著高于这些 Demo，并继续向三条参考视频的手感、Figma baseline 的成熟度、RhineLabUI donor 的连续 motion / camera 质量靠拢。

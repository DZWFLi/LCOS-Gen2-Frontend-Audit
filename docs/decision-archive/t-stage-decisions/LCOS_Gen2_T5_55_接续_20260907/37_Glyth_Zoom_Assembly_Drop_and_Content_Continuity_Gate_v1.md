# Glyth 缩放、Assembly / Drop 与内容对象连续性体验闸门 v1

> 性质：在不修改 Gen2 源码的前提下，回答 Glyth 精细视觉、内容查看/编辑连续性、自由 resize 三个当前体验问题。  
> 基线：后续实现按**最新 Huabu**。2026-09-07 复核 GitHub `LCOS_Gen2/main@232b2ca` 后，仓库已包含合并后的 `huabu/`；但当前本地 `OS开发` 工作树不是该 Gen2 main，且 GitHub 的 `HUABU_UPSTREAM.md` pin metadata 与最新 merge commit message 不一致。因此本文严格区分“GitHub Gen2 main 已含”“当前本地已接入”“浏览器已证明”。

## 0. 结论先行

| 问题 | 当前真实状态 | 裁决 |
|---|---|---|
| Glyth 缩放 | takeover 机械与阈值已有；物种形态、LOD 身份连续性已有合同；最终 renderer 与浏览器性能证明未闭合 | **PARTIAL READY** |
| Glyth Assembly / Drop | durable `conversation_context` 语义已冻结；此前没有足够精确的 receptive / accept / reject 视觉合同 | **本文补齐设计合同，仍待实现证明** |
| 内容卡片多种查看 | Huabu 已有多数 species preview；同一对象跨 Spatial / Preview / Work View 的连续合同已写 | **机械基础存在，Gen2 全链未证明** |
| 内容卡片编辑 | Note 最接近闭合；Text 是轻量 canvas inline edit；Image/PDF/Web/Video/Office 主要是查看，不应虚称“原生编辑都完成” | **未全量闭合** |
| 边框自由拖动 | GitHub Gen2 main 内的 Huabu 已有 `NodeWrapper + NodeResizer`；多数内容对象自由宽高，Image/Video 锁比例；多选有 group resize | **GitHub main 已含，当前本地与手感待验收** |

所以现在不能说这三项都“已经做好”。正确说法是：**底层机械和大部分对象合同已经够施工；Glyth Drop 精细视觉刚补齐；跨视图编辑连续性与 resize 手感仍必须做浏览器 Gate。**

## 1. Glyth 的缩放不是把一张卡片等比缩小

Glyth 是 Conversation 的活体身份，不是头像贴在通用矩形卡片上。缩放必须保持同一个 Glyth 的辨认、情绪与任务状态，只改变信息带宽。

### 1.1 采用最新 Huabu takeover 机械

| 项 | 当前 Huabu 基线 |
|---|---|
| takeover start | 屏幕宽度 `64px` |
| takeover end | 屏幕宽度 `24px` |
| hysteresis | `6px` |
| glide | `200ms` |
| badge fraction | `0.28` |
| badge clamp | `30–84px` |
| mark clamp | `6–30px` |
| face → dot | `<7px` |

这些数值是 host 机械，不等于最终视觉。Glyth 的精致度来自连续的形态接管：

```text
near / full
完整身体 + 面部 + 少量状态姿态 + 当前活动线索

mid / compact
身体轮廓收束 + 眼神仍可读 + 状态从姿态转为局部 mark

far / identity
轮廓退场，保留 Glyth face / eye identity + 一枚必要状态 mark

extreme far
非关键 Glyth 才可临时聚合；active / selected / waiting_input 不聚合
```

禁止：整张卡片 `transform: scale()`、远处只剩相同彩点、缩放时切成另一套 DOM 身份、所有 Glyth 持续漂浮晃动。

### 1.2 缩放中的操作稳定性

- hover、selection、drop hit area 使用 screen-space 容差，视觉变小不等于目标难以命中；
- selected / active Glyth 在跨 takeover 阈值时保持 selection、Action Arc owner 与 canonical id；
- 相机移动或 zoom 中暂停复杂连续动画，只保留形态 glide；
- active Run、waiting_input、conflict 的状态 mark 在 identity LOD 仍必须可辨；
- zoom 停止后再恢复眨眼、凝视等低频生命感，不能与相机动画争夺注意力。

## 2. Assembly 中 Glyth 的视觉

> `USER CORRECTED 2026-09-07`：Assembly / Docked Source Bay **默认**从右侧打开，但位置自由，可移动并重新 Dock；右侧是初始 placement，不是固定拓扑。Glyth 当前 HTML 验证方向获认可；隐形正方形几何壳、本体氛围光、同比例 resize 保持不变。

冻结路径：

```text
选择 Glyth
→ Action Arc
→ Assembly
→ Docked Source Bay
```

Assembly 打开后，Glyth 不变成一个大号虚线 Drop Zone。它仍留在原空间位置，只进入安静的 **target-ready** 状态：

- 身体不放大，避免位置和 hit geometry 漂移；
- 眼神转向 Source Bay / 当前指针方向；
- 外缘出现很薄的开放式 presence ring，开口朝向来源；
- Action Arc 收束，只保留退出 / 关闭 Assembly 的必要控制；
- Source Bay 中被拖对象保持自身物种外观，不变成通用文件 chip。

这使用户感觉是“把东西交给这个 Conversation”，不是“把文件扔进一个数据库容器”。

## 3. Glyth Drop 精确视觉合同

### 3.1 五阶段视觉

| 阶段 | Glyth 身体 | 外部场 | 被拖对象 | 语义 |
|---|---|---|---|---|
| approach | 轻微注意、目光跟随；不移动中心 | 无或极淡方向提示 | 保持 native face | 尚未命中 |
| receptive | 轮廓轻微张开/呼吸一次；姿态朝向来物 | 开放环转成稳定 receptive field；只在外圈使用来源类别色 | 轻微受吸引，但指针仍完全控制 | 目标有效 |
| commit | 一次短促闭合与满足式 settle；不可夸张吞咽 | 环由开口闭合为一圈，再淡出 | 原对象回 Source Bay；一个缩小的语义 token 沿短弧进入 Glyth 周边 | 写入 durable mapping |
| settle | 恢复本来形态；保留一瞬确认目光 | 新 context 以极淡 satellite / tether 出现，随后进入普通关系层级 | Source Bay 原项仍存在并显示已使用状态 | `conversation_context +1` |
| reject / cancel | 中性后撤或轻摇一次，立即复位 | field 打开远离指针；原因 tooltip 就近出现 | 原路返回，不改变原对象 | 无 canonical mutation |

动效建议：approach/receptive `120–180ms`；commit `160–240ms`；settle `180–260ms`。采用 Huabu pointer/drop 机械与现有 motion primitives；局部 icon / mark morph 可直接采用 Morphicons 等成熟组件，不自造一套 tween engine。

### 3.2 durable 与 temporary 必须一眼不同

| 路径 | 结果 | 视觉语言 |
|---|---|---|
| Source Bay → Glyth body | durable `conversation_context` | token 落入稳定 satellite / context orbit；关系可在重载后恢复 |
| Composer Reference → Glyth | current Run temporary input | 一条更细、更短命的脉冲 tether；Run 结束后消散，不形成常驻卫星 |

不能只用不同颜色区别二者；持续时间、落点、是否留存关系形态也必须不同。

### 3.3 状态互斥与优先级

```text
error / conflict
> waiting_input / approval
> active drop receptive
> selected
> hover
> ambient life
```

- selection ring、reference tether、receptive field 不能合并成同一个紫色发光圈；
- 真错误才使用 error 色；普通无效目标用中性阻力 + 原因，不红闪；
- Drop 期间若 target 消失、Core 拒绝或提交失败，必须回到原状态并给出可恢复原因；
- reduced motion 下取消吸入、弹性和视差，仅保留 opacity / stroke / static mark 变化。

## 4. 内容卡片的查看与编辑连续性

### 4.1 目标体验已经明确

```text
Canvas 上的同一 ArtifactView
→ 记录 source rect / camera / selection
→ 展开为 Preview 或 Work View 的 presented face
→ 在同一 canonical content 上查看或编辑
→ 关闭
→ 回到原锚点、原选择、原相机
```

这不是“打开另一张详情页卡片”，而是同一对象从空间身体进入适合阅读/编辑的脸。内容、身份、版本和选择不应断裂。

### 4.2 目前各物种真实程度

| 物种 | Canvas → 查看 | 编辑 | 当前判断 |
|---|---|---|---|
| Note / Markdown | `MilkdownPreview` canvas face → `NotePreview` | 同一 Markdown 深度编辑；应沿同一 patch 路径 | **最接近原生无缝，待 Gen2 浏览器证明** |
| Text | 画布轻量文本 face | canvas inline textarea / auto-size | **已有原生直觉，但不是完整 Markdown 文档编辑** |
| Image | ImageNode → ImagePreview | 主要是查看、复制、下载；非像素编辑器 | **查看可用，编辑不应虚称完成** |
| PDF | 首屏/页 face → PDF preview | 阅读、翻页、批注粒度另有合同；非 PDF 原生编辑 | **查看为主** |
| Web | 静态 canvas face → reader/live preview | 安全边界下查看；非网页源码编辑 | **查看为主** |
| Video | poster/transport face → preview | 播放与定位；非时间线剪辑 | **查看为主** |
| Office / PPT | 当前为抽取内容/Markdown preview 基线 | 原生 slide 编辑与高保真 current-slide face 未闭合 | **明确缺口** |
| Audio | Huabu 有 AudioNode 基础 | Preview registry 仍缺失 | **未闭合** |

所以，“几种查看方式”和“同一身份连续切换”的设计方向够；“所有内容卡片都已经查看—编辑无缝化”不够真实。下一步必须针对 Note、Text、Image、PDF、Office/PPT 各跑一条真实入口浏览器录像，不能用静态截图替代。

## 5. 内容卡片边框能否自由拖动

### 5.1 最新 Huabu 已有的机械

`NodeWrapper` 已接 React Flow `NodeResizer`：单选对象显示 edge / corner resize；多选走 `MultiSelectResizer`。

| 物种 | resize policy |
|---|---|
| Image | 可拖，`keepAspectRatio=true` |
| Video | 可拖，`keepAspectRatio=true` |
| PDF | 可自由宽高，`keepAspectRatio=false` |
| Note | 可自由宽高，`keepAspectRatio=false` |
| Text | 可自由宽高，`keepAspectRatio=false` |
| Office | 可自由宽高，`keepAspectRatio=false` |
| Web | 可自由宽高，`keepAspectRatio=false` |
| Audio | 可拖，默认不锁比例，受最小高度约束 |
| Glyth / Question host | 机械上可拖，但最终应受物种形态与 takeover policy 约束，不把它拉成任意矩形 |

### 5.2 “自由”不是没有约束

- 每个 species 有最小宽高，避免内容与控制器不可用；
- Image / Video 默认锁比例，防止内容变形；
- Note auto-height 时，用户主要拖宽度，内容重排后高度由内容 owner 计算；只有显式进入 fixed-height 才允许高度成为人工决定；
- resize 期间不应裁掉正文却不给提示；fixed-height 截断必须有 bottom fade / continuation affordance；
- handle 与边框是选中态的 screen-space affordance，不应常驻破坏“内容就是身体”；
- drag 结束后 debounce / batch 写 geometry，拖动过程不连续写 Local Core；
- resize 不得触发对象身份重建、Preview 滚动记忆丢失或 selection 跳走。

因此答案是：**最新 Huabu 的底层能力允许；但 Gen2 在同步最新 Huabu 并通过真实拖拽手感验收前，不能标记为完成。**

## 6. 必须补的浏览器验收

### GZ-01 Glyth zoom identity

连续 zoom 穿越 `64px → 24px → <7px`，录屏证明：无跳变、无身份替换、selected/active 状态不丢、命中区仍可用。

### GD-01 durable drop

从 Assembly Source Bay 拖 Artifact 到 Glyth，证明 approach → receptive → commit → settle；重启后 mapping 仍在，源对象未被移动或复制成私有仓库项。

### GD-02 temporary reference

从 Composer Reference 给 Glyth 当前 Run，证明视觉与 durable drop 不同；Run 完成后 temporary tether 消失。

### GD-03 reject / cancel / failure

覆盖无效类型、Esc 取消、target 消失、Core 提交失败；均无脏 mapping，Glyth 精确恢复原状态。

### CC-01 same-object view/edit/restore

Note 至少验证 Canvas read face → Preview edit → 保存 → Canvas 即时更新 → 关闭恢复原相机/锚点/selection/caret 规则。

### CR-01 species resize

逐一验证 Note、Text、Image、PDF、Video、Office：corner/edge、最小尺寸、比例锁、auto/fixed height、撤销/重做、重启恢复；不得出现内容重建闪烁或静默裁切。

## 7. 对当前颗粒度的判断

现在颗粒度足够开始施工的部分：

- Glyth takeover 与 LOD host；
- Assembly → Glyth durable context 的语义；
- 本文定义的 receptive / commit / settle / reject 视觉；
- 内容对象的 Preview promotion seam；
- Huabu `NodeResizer` 与 species resize policy。

仍不允许宣称完成的部分：

- Glyth 最终 Grok / Gen1 Bloub renderer 取舍；
- Glyth 全 LOD + Drop 的浏览器精致度与性能；
- Office/PPT 与 Audio 的完整 Preview；
- 所有物种的编辑能力；
- 当前本地 `OS开发` 尚未对齐 GitHub Gen2 main 的体验，以及 vendor 后尚未通过浏览器证明的部分。

下一推进顺序应为：

```text
最新 Huabu 同步完成
→ 先接 Glyth renderer + takeover
→ 接 Assembly target / five-stage drop feedback
→ Note 同身份 view-edit-restore
→ species resize matrix
→ Office/PPT、Audio 缺口
```

## 8. 边界与回滚

- 本文没有修改仓库、Schema、冻结交互或 canonical owner；
- 不新增第二套 avatar、drop、resize、canvas 或 overlay engine；
- 若视觉方案不成立，只回滚 presentation adapter / tokens / motion，不回滚 Huabu pointer/resize host，也不修改 Core 语义；
- 当前状态仍是设计施工输入，**不是浏览器验收 PASS**。

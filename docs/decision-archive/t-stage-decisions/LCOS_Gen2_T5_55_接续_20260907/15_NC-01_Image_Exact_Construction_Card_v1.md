# NC-01 Image — Exact Construction Card v1

## 0. 卡片状态

```text
Species: Image Artifact View
Card status: DESIGN READY / IMPLEMENTATION NOT STARTED
Canonical truth: LCOS Artifact + Revision + ArtifactView
Mechanical host: Huabu ImageNode + NodeWrapper + ImagePreview
Morphology authority: actual image content
Primary visual donor: Spatial v1 / v5 image states
```

本卡把可验证的 Huabu 真值与 Gen2 建议值分开。标记为 `PROPOSED` 的数值必须经浏览器原型验证后才能冻结。

## 1. Authority 与边界

### Current-source truth

| 项 | 真值 |
|---|---|
| Canvas body | `apps/web/src/components/Nodes/image/ImageNode.tsx` |
| Shared shell | `apps/web/src/components/Nodes/NodeWrapper.tsx` |
| Preview body | `apps/web/src/components/Nodes/image/ImagePreview.tsx` |
| Preview registry | `apps/web/src/components/Nodes/previews.ts` → `image: ImagePreview` |
| Default geometry | `400 × 300` |
| Resize | `keepAspectRatio=true` |
| Image fit | `object-contain` |
| Loading | centred pulsing image icon；`48px–200px`，约占短边 70% |
| Missing | `MissingFileBanner`，禁用 Preview action |
| Preview actions | copy / download |
| Minimal LOD | current Huabu 未给 Image 启用 binary minimal |

### LCOS owner

- 原文件、hash、missing/stale、Revision、来源与版本：Local Core；
- canvas position/size 与 Workspace 内 ArtifactView：LCOS projection；
- selection、resize、toolbar、connection handle：Huabu `NodeWrapper`；
- 图片解码、显示、Preview body：Huabu Image renderer；
- T5 只定义 morphology、state token、LOD contract 与 promotion choreography。

禁止把 canvas node data 变成原文件或版本真相；禁止在 T5 内另建图片缓存与 selection store。

## 2. 形态合同

### Full face

```text
outer geometry = image aspect ratio
visible body    = image pixels
permanent title bar = none
permanent type badge = none
default border = none / transparent host border only
content fit    = contain; never crop by default
corner radius  = 8px current host baseline
```

Spatial v1/v5 的关键结论：图片本身就是节点；选中 affordance 叠在内容之外，不挤压或缩放图像。

### Identity face（PROPOSED）

Image 不进入 Huabu generic title placeholder。缩远时保留：

```text
thumbnail silhouette + dominant image content
minimum short-side visibility target: 24 screen px
below readable thumbnail: image-shaped identity tile, not generic Image icon
label: hover/selection/focus 时才出现 screen-space overlay
```

这只允许在 Huabu 现有 LOD owner 上扩展 Image 的 `full → identity` species policy；不新建 resolver，也不由本卡直接批准修改现有 `SEMANTIC_ZOOM_CONFIG`。

## 3. 状态视觉合同

| 状态 | 内容 | screen-space chrome | 行为 |
|---|---|---|---|
| rest | 原图完整显示 | 无常驻描边 | 不改变 z-order |
| hover | 内容不变 | `1px` 中性 hover outline，轻阴影（沿用 host） | 不出现 resize handles |
| selected-single | 内容不变 | 选择框 + 4 角 handle；建议 `1px` / `8px` mouse、`12px` touch，后两者沿用 host | toolbar 出现 |
| selected-multi | 内容不变 | 由全局 multi-select bbox 表达 | 单节点 handle 与 toolbar 隐藏 |
| dragging | 内容不变 | host elevation 升一级 | 不修改 selection truth |
| resizing | 连续 contain | handle 跟手；无 120ms geometry 尾随 | 锁定原始比例 |
| loading | 图片隐藏 | 中央 pulse icon | load/error 结束 loading |
| missing | 不显示假缩略图 | MissingFileBanner | 禁用 Preview；保留重新定位入口给 LCOS adapter |
| stale | 仍显示最后可信 preview | `PROPOSED` 右上小型 stale notch + tooltip | 不自动覆盖；点击进入冲突处理 |
| generated/pending | 图片保持主视觉 | `PROPOSED` Pending Return Zone 外部状态，不在图片上盖大 AI badge | Accept/Retry 由 Run owner 驱动 |
| error | 能显示旧 preview 则保留 | `PROPOSED` 边缘 warning + 简短原因 | 不吞错、不伪装 missing |

分类不能只靠颜色：Source / Working / Generated / Context 至少结合位置、边界样式、状态文案或 zone；Image body 本身不加统一 header。

## 4. LOD 合同

### 现有 Huabu LOD owner 的扩展输入

```text
screenWidth = canvasWidth × cameraZoom
screenHeight = canvasHeight × cameraZoom
critical = selected || focused || activeRunTarget || pendingReview
```

### 建议状态（PROPOSED，待浏览器校准）

| 状态 | 进入条件 | 退出条件 | renderer |
|---|---|---|---|
| full | shortSide ≥ 40px 或 critical | — | 原图 `object-contain` |
| identity | 非 critical 且 shortSide < 32px | shortSide ≥ 40px | 轻量 thumbnail/色块 identity |

`32/40px` 构成 8px 滞回带。Image 不复用 PDF 的 150px generic-label boundary；图像在较小尺寸下仍比文字标签更有识别力。此判断是设计建议，不是 Huabu current truth。

## 5. Preview / presented choreography

### 当前流程

```text
Image node
→ toolbar Fullscreen
→ openPreviewNode(id)
→ Preview Workspace
→ ImagePreview
→ copy / download
```

### Gen2 目标流程

```text
同一 ArtifactView / Image entity
→ double-click 或 Preview action
→ source rect 被记录
→ Preview/Work View 作为 presented face 打开
→ copy / download / provenance / revision browsing
→ close
→ 回到原 spatial anchor、selection 与 camera context
```

不得复制一个“expanded image node”作为第二实体。打开与关闭只改变 view state；原 Artifact、Revision 和 canvas geometry 不变。

### Motion（PROPOSED）

- normal：source-rect continuity，建议 `180–260ms`；opacity/scale/clip 同步，不做弹跳；
- close：反向回到当前可见 anchor；若原节点不在视口，先恢复 camera context，再完成 settle；
- reduced motion：`120ms` crossfade，不做空间飞行；
- 未经六段原视频时间轴测量，不把 `≈250ms` 写成冻结值。

## 6. Persistence 与 failure contract

| 数据 | Owner | 规则 |
|---|---|---|
| file path / hash / missing / stale | Local Core | 写前校验 hash；外部修改进入 stale |
| Artifact / Revision | Local Core | AI 结果默认新 Revision |
| node geometry | LCOS projection | drag/resize 期间内存；停止后 300–800ms batch persist |
| Preview open/layout | UI/Preview Workspace | 可丢布局偏好与正式 view state 分层 |
| decoded bitmap / thumbnail cache | cache | 内容 hash key；可删、可重建 |

失败路径：文件缺失、无权限、解码失败、路径变化、hash conflict、Preview 加载失败。任何失败都不能把旧文件静默覆盖成新文件。

## 7. Browser acceptance

1. 以 `400×300` 创建横图，内容无标题栏且不裁切；
2. 导入竖图后 geometry 使用真实宽高比，不继承 4:3 造成大空边；
3. 单选出现 overlay/handles，节点内容 bbox 前后像素尺寸不变；
4. 连续 resize 过程中 handle 与边缘同帧，比例误差 ≤ 0.5%；
5. 多选时不出现单节点 resizer/toolbar；
6. 图片未加载显示 pulse；成功与失败均终止 pulse；
7. missing 时 Preview action 不可用，且有明确恢复路径；
8. stale 显示旧可信 preview，同时阻止静默覆盖；
9. Preview 打开/关闭保持 node id、anchor、selection 和 camera context；
10. identity 往返无闪跳，selected/pending 节点不得过早降级；
11. reduced motion 不发生长距离 morph；
12. viewport pan/zoom 不令所有 Image body 重渲染。

## 8. 非目标

- 不在本卡加入图片编辑器、滤镜、裁切或标注套件；
- 不修改 LCOS 对象模型、Schema、Run 流程或 Preview Workspace 架构；
- 不以 iOS glass 包裹图片；
- 不因统一性给 Image 增加 generic card header。

## 9. Card verdict

```text
DESIGN READY
Next proof required: browser prototype + render-count trace + motion capture
Implementation requires separate approved Sprint scope
```

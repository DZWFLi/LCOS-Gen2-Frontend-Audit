# NC-05 Video — Exact Construction Card v1

## 0. 卡片状态

```text
Species: Video Artifact View
Card status: DESIGN READY / IMPLEMENTATION NOT STARTED
Canonical truth: LCOS Artifact + Revision
Mechanical host: Huabu VideoNode + VideoPreview + NodeWrapper
Reuse posture: DIRECT USE; styling/metadata adapter only
```

## 1. Current-source truth

| 项 | 真值 |
|---|---|
| Canvas body | `apps/web/src/components/Nodes/video/VideoNode.tsx` |
| Preview body | `apps/web/src/components/Nodes/video/VideoPreview.tsx` |
| Default geometry | `400 × 300` |
| Canvas media | native `<video preload="metadata" muted>` |
| Canvas fit | `object-contain`；pointer disabled |
| Canvas state | centre Play overlay；hover 时遮罩增强、Play 放大 |
| Resize | `keepAspectRatio=true` |
| Preview | native `<video controls>` + `object-contain` |
| Missing | `MissingFileBanner`；禁用 Preview action |
| LOD | current 未 opt-in binary minimal |

不新写播放器、时间轴、解码器或媒体缓存。第一阶段直接复用 native video 和 Huabu Preview。

## 2. 形态与状态合同

```text
body = poster/first decoded frame or video surface
permanent header = none
primary identity = frame content + restrained play affordance
controls = Preview only
```

| 状态 | 内容 | feedback | 约束 |
|---|---|---|---|
| rest | poster/video frame | 中央 Play | 不自动播放 |
| hover | 内容不变 | 轻遮罩 + Play scale（沿用 current） | 不显示完整 controls |
| selected | 内容不变 | NodeWrapper screen-space selection | 不改变画面 bbox |
| resizing | `object-contain` | handles 跟手 | 保持视频比例 |
| metadata-loading | 稳定 footprint | `PROPOSED` 小型 loading cue | 不挂重型播放器 |
| missing | 无伪 poster | MissingFileBanner | 禁用 Preview |
| stale | 最后可信 poster | `PROPOSED` stale cue | 不静默替换文件 |
| unsupported/decode-error | fallback identity | codec/error 原因 | 不伪装 missing |
| pending-review | Current 视频保持 | Return Zone 外部状态 | Run owner 控制 Accept/Retry |
| playing | Preview controls | 原生播放状态 | Canvas 不持久化 playback truth |

## 3. LOD（扩展 Huabu 现有 owner，不另造系统）

Video current 不使用 minimal。建议沿 Image 的 species-preserving 路径：

| face | `PROPOSED` boundary | renderer |
|---|---|---|
| full | short side ≥40px 或 critical | native video/poster + Play |
| identity | 非 critical且 short side <32px；≥40px 返回 | cached poster silhouette + compact Play cue |

identity 不挂可播放 video，只用缓存 poster；selected/focused/pending 节点优先保留可读状态。`32/40px` 待浏览器校准。

## 4. Preview / playback contract

```text
Video ArtifactView
→ openPreviewNode(id)
→ existing VideoPreview/native controls
→ playback remains ephemeral UI state
→ close
→ restore spatial anchor/selection/camera context
```

- 不复制 expanded Video entity；
- 默认不承诺跨关闭恢复播放进度；若未来需要，作为 Preview view-state adapter，不写进 Artifact truth；
- 音量、倍速、字幕偏好优先交给 native/player capability，不自研控制层；
- 原视频无 captions source 时不伪造字幕轨。

Motion 使用现有 Preview Workspace。若增加 source-rect continuity，只扩展其 transition seam；normal 建议 `180–260ms`，reduced motion 用短 crossfade，均为 `PROPOSED`。

## 5. Persistence / performance

| 数据 | Owner | 规则 |
|---|---|---|
| file/hash/missing/stale | Local Core | hash 冲突进入 waiting_input |
| poster/metadata | derived cache | 内容 hash key；可删可重建 |
| geometry | projection | 停止交互后 batch persist |
| playback position | ephemeral Preview state | Phase 1 不写 canonical truth |
| generated revision | Run/Revision | 用户确认前 Draft/Pending |

Canvas 只 `preload=metadata`，不得为多个远端节点预加载完整视频；identity face 不挂 video element。

## 6. Browser acceptance

1. `400×300` 创建且不裁切画面；纵/横视频保持真实比例；
2. Canvas 不自动播放、无完整 controls，仅显示克制 Play affordance；
3. hover/selected/resize 不改变内容 geometry；
4. resize 比例误差 ≤0.5%，handle 无尾随；
5. Preview 使用现有 native controls，关闭后回到同一 node/anchor/context；
6. missing、stale、unsupported codec、decode error 可区分；
7. 50 个 Video 不预加载完整媒体；
8. identity 往返不闪跳且不挂 video；
9. pending review 不覆盖 Current；
10. reduced motion 与 viewport render-count 合格。

## 7. Card verdict

```text
DESIGN READY
DIRECT USE HUABU VIDEO STACK
OPEN: poster cache adapter + optional Preview playback view-state
```


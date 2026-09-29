# NC-12 Audio Exact Construction Card v2

## 0. 卡片状态

```text
STATUS: DESIGN READY / BROWSER PROOF PENDING
FUNCTIONAL HOST: latest Huabu AudioNode
MORPHOLOGY: Spatial media grammar
MOTION ORGANS: Morphicons + selected Amicro source
IMPLEMENTATION: DIRECT USE + LIFT + thin LCOS adapter
REWRITE: NO
```

Audio 的视觉主体是“可操纵的时间身体”，不是麦克风图标加一条通用白卡。

## 1. 精确复用源

### 最新 Huabu `main @ a3c411e1`

- `apps/web/src/components/Nodes/audio/AudioNode.tsx`
  - MediaRecorder、MIME fallback、录制/停止/上传；
  - play/pause、click seek、Arrow ±5s；
  - duration Infinity 修复；
  - 22-bar deterministic waveform；
  - stream/timer/listener cleanup；
  - MissingFileBanner、NodeWrapper。
- `packages/shared/src/canvas-engine/utils/nodeSizes.ts`
  - 当前默认 `200×56`，只作 proof 起点。
- `apps/web/src/components/Nodes/previews.ts`
  - 尚未注册 Audio Preview。
- `apps/web/src/index.css`
  - `.audio-live-bars` 当前为 `900ms ease-in-out infinite`；reduced-motion 未覆盖。

### 可直接采用的本地开源组件

- Morphicons `1.7.1` / MIT：
  - `Play ↔ Pause`；
  - `Mic ↔ Square`；
  - 必须 `reducedMotion="user"`。
- Amicro / MIT 源码 registry：
  - `apple-sound-wave.tsx`；
  - `apple-equalizer.tsx`；
  - `symmetric-wave.tsx`；
  - `shimmer-line.tsx`；
  - `presets.ts`、`use-reduced-motion.ts`。

这些组件直接提取运动与 SVG 器官，接入 Huabu 的真实 audio state；不保留 loader demo 的假状态。

## 2. 外观 anatomy

```text
AudioBody
├─ origin cap
│  └─ play/pause OR record/stop morph control
├─ temporal body
│  ├─ deterministic waveform
│  ├─ played segment
│  └─ current head
└─ terminal cap
   └─ total duration / live elapsed
```

- `NodeWrapper` 可见框退为隐形 hit/selection 层；
- waveform 占主要面积与视觉权重；
- 标题、来源、revision 只做临近 caption/decoration，不压成 metadata header；
- 形态至少具“起点—时间流—终点”的方向性，去掉 icon 后仍能辨认 Audio；
- 录音态时间身体从起点向前生成，而不是整条呼吸。

## 3. 状态形态

| 状态 | 身体表现 | 动作 |
|---|---|---|
| empty | 安静未写入的时间槽；record 起点 | Record |
| recording | 时间头前进，局部 equalizer 活动 | Stop |
| uploading | 已录区冻结；末端短 shimmer | Cancel/等待 |
| playable | 稳定波形；played 区与 head 清楚 | Play/Pause/Scrub |
| paused | 时间头停住，身体完整 | Play/Scrub |
| missing | 来源端断裂 + MissingFile 语义 | Relink/Inspect |
| stale | 来源端 revision mark；播放按安全策略只读 | Inspect |
| error | 故障只落在失败部位 + 短原因 | Retry |

## 4. LOD

| LOD | 保留 | 移除 |
|---|---|---|
| full | 完整 waveform、head、play/record、时间 | 重元数据 |
| compact | 8–12 单元时间带、主控制、总时长、状态 | 细波形、caption |
| glyph | 时间方向轮廓 + play/record/missing 身份 | scrub、数字细节 |

- 进入最新 Huabu 单一 LOD resolver；
- recording 不得因 LOD 隐藏唯一 Stop；必要时强制最低 compact；
- zoom out / camera move 时关闭复杂波形动画。

## 5. 运动参数与来源

### 节点内

- icon：Morphicons spring morph；
- recording bars：从 Amicro `apple-equalizer` / `symmetric-wave` 选更克制者接真实 recording state；
- playback：只移动确定性 progress/head，不做 glow；
- uploading：Amicro `shimmer-line` 只走一次可循环短带，不能覆盖整物体。

### Spatial → Focus / Preview

- 沿用 Spatial 同对象原位打开；
- proof 起点 `220–260ms` snappy、无明显回弹；
- Work View renderer 与画布 AudioBody 共享 target identity；
- 关闭反向回节点原 frame。

### Reduced motion

- icon 直接切换或极短 dissolve；
- live bars 固定为确定性不等高序列；
- recording 只靠 elapsed 与红色时间头变化；
- 禁止 hover scale、循环 pulse、整条 shimmer。

## 6. 数据与状态 owner

| 数据 | Owner |
|---|---|
| Artifact identity/src/revision/hash/stale | LCOS Local Core |
| node position/size/selection | Huabu canvas host |
| recorder lifecycle | Huabu AudioNode/UI runtime |
| playback currentTime/isPlaying | ephemeral UI |
| transcript | 独立 Artifact/metadata（存在才显示） |

播放进度与 MediaStream 不进入 Project Graph；上传成功前不创建伪 canonical Artifact。

## 7. Preview seam

第一选择：增加薄 `AudioPreviewAdapter`，复用相同 media source 与控制器，放大时间身体并展示来源/revision；不复制 Blob 或建立第二播放器 truth。

若同步后发现 Preview retention 会造成双 `<audio>` 竞争，则 Alpha 退路为 Focus + Inspector-only，而不是仓促写第二套播放器。

## 8. Browser acceptance

1. 不看 icon/标题可从轮廓辨认 Audio；
2. 录音、停止、上传、回放走 Huabu 原机械；
3. WebM/MP4/OGG 支持路径与错误路径真实；
4. click seek 与键盘 ±5s、ARIA slider 正常；
5. unmount 后无活 MediaStream、timer、listener；
6. waveform 重挂载稳定，不闪变；
7. full/compact/glyph 均保留物种身份；
8. recording 在任何 LOD 都可停止；
9. Focus/Preview 开合保持同 target；
10. missing/stale 不静默覆盖；
11. reduced motion 无循环波形、scale 与 shimmer；
12. 只新增薄 adapter/decoration，没有第二播放器。

## 9. 非目标

- 不做 DAW、剪辑、降噪、频谱分析；
- 不用伪波形冒充真实振幅数据；
- 不把 Voice 输入另建 VoiceRun；
- 不把 Amicro loading demo 整组件套进节点；
- 不新增 Audio BLOB 数据库。

## 10. 回滚

保留 Huabu 原生 AudioNode 为功能基线。任何 morphology/Preview proof 失败时，删除 LCOS decoration 和 Preview adapter 即可，不影响录音、上传、Artifact 与画布数据。

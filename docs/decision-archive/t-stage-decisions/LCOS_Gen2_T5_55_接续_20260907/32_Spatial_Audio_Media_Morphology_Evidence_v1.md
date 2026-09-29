# Spatial → LCOS Audio / Media 形态证据 v1

## 结论先行

Spatial 现有六段录屏和 80 张原帧**没有证明一张独立 Audio node 的完整视觉**。它证明的是媒体物种的共同身体语言；Audio 应将这套语言嫁接到最新 Huabu 已完成的录音/播放机械上，不能凭空声称“照抄 Spatial Audio”。

```text
Spatial evidence: MEDIA MORPHOLOGY DONOR
Latest Huabu AudioNode: FUNCTIONAL HOST
LCOS Audio: Huabu mechanics + Spatial media body language + LCOS truth adapter
```

## 1. 原帧能直接证明什么

证据包：`Spatial_画布形态与动效收敛包_含帧图_20260905.zip`。

- v1/v2 原帧：图像、文档、任务、彩色媒体/信息对象并置，轮廓和内容表面不同；
- v2 原帧可见媒体/Spotify 摄取入口与多类型对象组合，但不足以证明最终 Audio card；
- v3–v6：文本、图片、纸页、集合的原位生成/打开/关闭，确认“同一对象换表达”；
- MD6 通过符号确认 `CanvasVideoItem`、`CanvasVideoTransitionView` 等媒体专属 transition；
- Spatial 数据字段证明媒体载荷多态、品类色与形态分类，不是一种 GenericCard 塞所有内容。

因此可以迁移的是：

1. 媒体以时间/封面/波形等内容本体形成身体；
2. full body 与 deep view 是同一对象原位展开；
3. 媒体/信息类可有稳定品类 accent，但颜色不是唯一识别方式；
4. 控件贴内容出现，不建立永久 toolbar；
5. selection chrome 不改变媒体几何。

不能从原帧宣称的是：

- Spatial Audio 的精确 waveform；
- 独立 Audio node 的尺寸、按钮位置或颜色；
- Audio 专属 LOD 阈值；
- Audio 打开动画的精确参数。

## 2. Audio 的身体应该是什么

Audio 不是一个“带麦克风 icon 的 200×56 白条”。它的核心内容是时间，因此身体由三段组成：

```text
origin/identity head
→ temporal body（波形或时间密度）
→ duration/end state
```

- 有封面/来源时，身份头可体现来源；
- 无封面录音时，时间身体占主导；
- 播放进度沿身体真实推进，不另挂 progress badge；
- recording 时身体正在被写入，波形从起点向前生长；
- uploading 是刚录完但尚未成为 canonical Artifact 的过渡态；
- missing/stale 在媒体身体的来源端或断裂处出现，不把整条变成报错卡。

这是基于“Content is the body”的 LCOS 设计裁决；具体像素仍需 browser proof。

## 3. 与最新 Huabu 的复用关系

最新 Huabu `AudioNode.tsx` 已提供：

- MediaRecorder 与 MIME fallback；
- record / stop / upload / play / pause；
- 22-bar 稳定伪波形；
- click seek 与键盘 ±5 秒；
- duration 修复；
- MediaStream、timer、listener cleanup；
- MissingFileBanner 与 NodeWrapper。

这些全部保留。视觉层不新建播放器，只允许：

- 调整 body morphology，使 waveform 成为主体而非表单行；
- 将 LCOS Artifact source/revision/stale 映射进 decoration；
- 把 Audio 注册进单一 LOD resolver；
- 补 reduced-motion；
- 决定 Preview/Focus 是沿用同一媒体身体放大，还是第一阶段 Inspector-only。

## 4. 三层形态

### Full

- 时间身体完整可 scrub；
- 播放/暂停是贴在起点的局部 affordance；
- 当前时间与总时长靠近时间轴两端；
- recording 可直接停止；
- 不出现大标题头和元数据卡壳。

### Compact

- 保留 Audio 轮廓、起点控制、精简时间带和总时长；
- 22 bars 可降为 8–12 个节律单元或一条确定性波形摘要；
- recording 状态不能隐藏 stop。

### Glyph

- 保留“声音/时间”轮廓，而不是退化成普通圆点；
- playing/recording/missing 三类信号仍可辨；
- 不播放持续高频动画。

## 5. 运动

- Spatial 同一对象原位展开：browser proof 起点 `220–260ms`、snappy、无明显回弹；
- playback：进度是确定位置变化，不做霓虹呼吸；
- recording：只让时间身体活动，外壳保持安静；
- reduced motion：波形停止循环，以静态不等高形态 + 时间递增表达正在录音；
- Focus/Preview 关闭反向回到原节点位置，播放是否连续由稳定 targetRef policy 决定。

## 6. 对现有 Huabu Audio 的审计判断

| 项目 | 判断 |
|---|---|
| recorder/player mechanics | `DIRECT USE` |
| waveform algorithm | `DIRECT USE` 起步，视觉可薄调 |
| 200×56 default geometry | proof 起点，不是最终形态权威 |
| white horizontal row | 功能可用，但物种性格偏弱 |
| Audio Preview | 当前不存在，`OPEN` |
| minimal/glyph LOD | 当前不存在，`OPEN` |
| reduced-motion live bars | 当前未覆盖，`OPEN` |

## 7. 下一张 Audio 施工卡必须新增的验收

1. 与 Text row 并排时，不看 icon 也能认出 Audio；
2. waveform/time 是最大视觉权重；
3. recording、playing、stale 通过身体局部变化识别；
4. full→compact→glyph 不丢 stop / identity；
5. 原位进入 Focus/Preview 时 target continuity 可见；
6. 复用 Huabu media lifecycle，没有第二套播放器；
7. 报告明确标注 Spatial 的事实与 LCOS 的设计推导，不混为一谈。

> **20260927 后续实测纠正**：下文仅测到 species-body 的0px，未涵盖更外层 NoteNode 内容宿主。后续确认其 p-2 实为8px，文本/音频各被吞掉16px宽高；已针对 LCOS BodyOverride 接缝修复。以 `audio-summary-and-note-host-fix.md` 为最新结论。公共6px不是根因，但“无祖先padding问题”的整体判断不成立。
# 低 LOD 文本与音频祖先布局核查 · 20260927

结论：**未证实公共 padding:6px 导致文本/音频视觉退化，不能为了这条怀疑修改它们的几何。** 当前生产 freeform 分支内联 `padding:0` 优先级更高，实际浏览器也为 0px。没有重复 CSS transform。

## 依据

- 已查看当前 `root-main-current.png`（1280×720）与本地 Figma `E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/main-final.png`（1440×900）。两者相机、材料和对象世界尺寸不同，不以截图占屏比例直接替换几何。
- T1 原卡 `LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md` §14.2：使用单一 density owner，不另造阈值引擎。节点宪法 §4：LOD 决定显示信息，不等于改动 canonical 空间尺寸。
- 源码：`huabu/apps/web/src/lcos/ui/lcos.css:73` 公共规则确有 padding:6px；但 `nodes/LcosSpeciesBodies.tsx:432` 的真实 source/draft freeform 分支内联为 padding:0。`sourceTextLayout.ts` 从世界宽高与 zoom 消费字号；未额外 transform。

## 真实浏览器测量

地点：隔离开发项目 `/projects/lcos-gen2-dev/main`，既有生产节点，未注入替代组件、未修改节点数据。

| 对象 | density | 世界尺寸 | 屏幕尺寸 | 外层 padding | body / view transform |
|---|---|---|---|---|---|
| 越过边界…文本 | summary | 369×126 | 197.75×67.52 | 0px | none / none |
| 山野环境声音频 | summary | 155×80 | 83.07×42.87 | 0px | none / none |

相机约 53.59%；文本字体 24 world px，约 12.86 screen px。这个尺寸与现有算法一致，不能称为 padding 把它压小。文档和两张图片同样实测 padding:0。

音频当前 summary 没有已解码波形，显示真实播放控件与名称；Figma 5388:121 近景参考有波形。真实 caller 只有 working/reading 触发 AudioContext 解码，不能把 Figma 波形值直接灌成真实音频数据。

## 后续候选（未当作已验证缺陷）

`AudioSourceMorphology` 在 working/reading 解码并保留 peaks；`AudioSourceView` 只在 mark 隐藏已得到的波形。因此代码显示 summary 可能受“是否曾经进入近景”的历史影响。尝试通过恢复100%再缩回验证时，音频离开视口被虚拟化，locator超时；本次没有取得同一可见音频的近→中连续实测，不把该推断算成完成或据此随意改动。后续宜围绕音频定位后复测，并按原卡决定 summary 的确定显示策略。

## 回传

- READ_SOURCE：上述 T1 §14.2、节点宪法 §4、真实 source body 与音频加载链。
- ADOPTED：无代码移植；保留当前 owner 和 freeform 内联样式。
- VISUAL_SOURCE：Main 5388:96；文本 5388:102；音频 5388:121。
- RETIRED：无。
- VERIFIED：生产页面真实 computed style / geometry；[测量截图](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/node-low-lod-measurement.png)。缩放后已用现有“适合画面”按钮恢复视角。
- UNRESOLVED：音频波形在同密度是否受 zoom 历史影响尚待连续实测；尚未证明全远中近视觉与 Figma 一致。

本项只输出测量，无产品代码更改。不要把没有改代码误报成视觉闭环。
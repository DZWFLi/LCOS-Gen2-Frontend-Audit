# Spatial Primary Evidence Manifest v1

## 已定位原件

### 收敛包

`C:\Users\1\Desktop\施工前最后一轮校准\Spatial_画布形态与动效收敛包_含帧图_20260905.zip`

内容：

- 80 张逐帧图；
- Spatial 画布形态与动效收敛稿；
- 帧采样与卡片比例复核稿。

帧分布：

| 视频组 | 帧数 |
|---|---:|
| v1 | 8 |
| v2 | 19 |
| v3 | 37 |
| v4 | 5 |
| v5 | 6 |
| v6 | 5 |
| 合计 | 80 |

### 独立情报包

`C:\Users\1\Desktop\施工前最后一轮校准\Spatial_独立情报包_v4_20260904.zip`

包含：

- 6 段 Spatial 录屏；
- symbol census；
- SQLite / CoreData schema；
- AX window snapshot；
- MD5 / MD6；
- source census correction。

### T5 总研究包

`C:\Users\1\Desktop\T5_视觉研究总包_含视频与图片_20260906.zip`

其中重复收录 6 段 Spatial 视频、80 帧、分析报告、donor 研究和历史 HTML。后续应以“独立情报包 + 含帧图收敛包”为 Spatial primary root，总研究包作为汇总副本，避免重复计证据。

## 已确认视觉/行为证据

| 证据 | 状态 |
|---|---|
| intrinsic content morphology | `VISUALLY_CONFIRMED` |
| heterogeneous layout | `VISUALLY_CONFIRMED` |
| focus 时邻居退让/降权 | `VISUALLY_CONFIRMED` |
| source object 原位 morph | `VISUALLY_CONFIRMED` + symbol support |
| drag 时邻居让位/聚散/settle | `VISUALLY_CONFIRMED` |
| Stack pull-out / scatter | visual + symbol/report evidence |
| Folder 与 Stack 分离 | symbol/data/report evidence |
| text hierarchy floating editor | `VISUALLY_CONFIRMED` |
| six-video state coverage | primary material located |

## 数值证据分级

| 项目 | 数值 | 等级 |
|---|---:|---|
| 打开放大 | ≈250ms 内 | `REPORT_MEASURED`（逐帧） |
| 多卡入场 | ≈550ms | `REPORT_MEASURED`（逐帧） |
| 编辑菜单 | ≈200ms | `REPORT_MEASURED` |
| 背景 scale | .96 | `INFERRED_CALIBRATION` |
| 背景 opacity | .4 | `INFERRED_CALIBRATION` |
| 背景 displacement | 8–16px | `INFERRED_CALIBRATION` |
| spring 0.25/0.8 | 建议值 | `INFERRED_RECIPE` |

所以，只有前三类时长可以写“逐帧测得”；背景 scale/opacity/displacement 与 spring 参数都不能写成 Spatial 源码真值。

## Phase 1 可直接消费

- Image / Notes / WebClip / Video 的 species-specific opening；
- content-first body 与留白比例；
- Collection collapsed stack / expanded content-first host；
- focus/presented choreography；
- drag reflow / local settle；
- full / compact / identity 之间的视觉连续性原则。

## 不直接照抄

- Spatial 原生窗口 chrome；
- AppKit 手写 gesture/animator owner；
- 卡片色板直接覆盖 LCOS semantic colors；
- Spatial Folder 自动等价为 LCOS Collection；
- Spatial Stack 自动等价为 durable membership；
- 把反推参数固定成全局硬 token。

## 下一步

原件已经齐全，不再是缺料问题。下一步是建立 `frame → observed event → LCOS target state → host seam → acceptance` 的逐帧 ledger，并把 80 帧中重复的静止帧压成关键帧序列。


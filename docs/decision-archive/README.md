# LCOS 前端 T 阶段、Donor 与全量审计归档

日期：2026-09-30  
对应源码提交：[`a9f51a3`](https://github.com/DZWFLi/LCOS_Gen2/commit/a9f51a3)  
对应源码分支：[`codex/gui-figma-recovery-20260926`](https://github.com/DZWFLi/LCOS_Gen2/tree/codex/gui-figma-recovery-20260926)

## 先看结论

这个目录把前端重构的四类证据放到同一条可追溯链里：Gen1 原行为、T1–T7 裁决、Figma/HTML/Donor 视觉输入、当前 Gen2 源码审计。它是施工和复核材料，不表示所有内容都已经进入生产 caller。

推荐先读：

1. `current-audit/Gen1_T规划覆盖_第二轮全量复核_20260930.md`
2. `current-audit/T1-T7_原审计逐项施工总账_20260929.md`
3. `frontend-decisions/LCOS_三视图交互合同_RhineDonor统一裁决_20260910.md`
4. `frontend-decisions/LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md`
5. `t-stage-decisions/LCOS_Gen2_T5_55_接续_20260907/00_README_先看这里.md`

## 目录

- `t-stage-decisions/`：T1–T7 接续、施工卡、交互蓝图和 donor 分类原件。
- `frontend-decisions/`：前端冲刺阶段的整机裁决、Context/Workflow 专项、Figma/源码审计和后续纠正。
- `prototypes-and-patches/`：我们自己的 LCOS HTML 原型，以及待审/历史 patch。HTML 表达 UX 与动效意图，不能自动等同生产实现。
- `current-audit/`：2026-09-26 至 09-30 的源码交叉检查、修复记录、测试清单和关键实页截图。
- `ASSET-MANIFEST.csv`：本地 donor、压缩包、视频和 Figma 来源清单。第三方原包采用登记制，不在仓库二次公开分发。

## 证据优先级

出现冲突时按以下顺序判断：

1. 用户最新明确纠正。
2. 后续 T 裁决对早期方案的显式覆盖。
3. T5/T6 的 exact blueprint、construction card 和正式接口语义。
4. 成熟 HTML 原型中的 UX 与动效连续性。
5. Figma 中的视觉与布局。
6. Gen1 的产品语义和交互范围。
7. Donor 只提供材质、密度、动效和成熟组件做法，不反向改写 LCOS 产品身份。

## Donor 采用规则

- Oreo：HUD 外壳、弹层、引用、进度与基础组件密度。
- TapNow：节点 AIGC 画布、近场关系线、Color Pin、定位与轻 HUD。
- Lovart：Assembly 的大面积瀑布流、媒体占比和自由缩放。
- Spatial / 动效库：空间连续性、光幕、生成、Drop、arrival 与状态过渡。
- Gen1：Collection、Railway、Drop 范围、画外定位和 LCOS 自身产品语义。

Donor 可替换表现，不替换 Core owner、canonical identity、状态机或真实回执。

## 已知未闭环

- Run / Result 与部分节点物种可能只有 renderer，没有 production producer。
- Railway 的用户添加、排序、移除与 reload 尚缺完整实页证据。
- Drop 六类 Receiver 尚缺统一手感和整机录屏。
- Context / Workflow 根现场仍需按专项裁决与 HTML 做最终核对。
- Glyth 本体状态机和真实 provider 仍需整链验收。

## 公开与私有边界

`LCOS_Gen2` 当前是公开仓库，所以外部 donor 完整源码、视频和压缩包不会进入该仓库。本私有归档保存我们自己的文档、HTML、审计证据，以及外部资产的来源和指纹。需要重放 donor 时，按 `ASSET-MANIFEST.csv` 回到本地原件或官方来源。

# 装配视觉对齐 · 第 8 批

结论：修了真实装配瀑布流的两处空间浪费，以及触屏选择框遮挡正文的问题。仍由现有 AssemblyBody 与 ProfessionalWindowStage 承载；没有改 S11 双组拓扑、导航、相机、Core 或业务状态。

## 1. 严重级别与具体状态

- **P2 / S02：桌面装配静息态。** 每个 125px 预览对应的条目高 238px，隐藏操作区仍占 48px，加间距共浪费 56px。
- **P2 / S02：自由窗口缩到 511px。** 原条目统一限宽 290px，材料内容只有 276px；可用宽度未用于看图和读正文。
- **P2 / S02：390px 触屏。** 常驻选择框和更多按钮盖在材料上，选择框遮住文字预览首行。

## 2. 采用原件与依据

- [T4 BP-05 原卡](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T4/45_T4_to_T5_ProfessionalWindow_and_ProfessionalBodies_ExactBlueprint_v1.md)：§5.1–5.3，Project 共享专业窗口，真实来源、目标及 apply snapshot 不变。
- [窗口最终规则](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/unification/specs/window.json)：5392:6087/6090/6092，唯一 Stage、最小 360×280、窗口不跟随画布 zoom 缩放。
- [C01 装配瀑布流](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/pages/5332-2/frames/5346-1416/nodes-000.json)：5346:1601 自由窗口 644×648；真实材料本体、集合与工作流保持不同形态。
- [C02 悬停取用](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/pages/5332-2/frames/5346-1666/nodes-000.json)：5346:1877 按钮 y=444、h=44，叠在上方材料下沿，而非每个静息条目常驻留整排空白。
- [N03 窄屏单列](E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/pages/5332-2/frames/5347-1037/nodes-000.json)：集合 248×244、工作流 224×324；这两类固定本体保持，不被强行横向拉伸。
- 原件截图：[C01](surfaces-assembly-figma-C01.png)、[C02](surfaces-assembly-figma-C02.png)、[N03](surfaces-assembly-figma-N03.png)。由第 13 页原始 overview.png 按导出节点坐标裁切，没有重绘。

## 3. 真实生产 caller 与改动文件

`LcosProjectShell → ProfessionalWindowStage bodyKey=assembly → AssemblyBody → AssemblyMasonryView → AssemblyItemView → AssemblyMaterialView / AssemblyArtifactMedia`。

- 保留 caller：[AssemblyBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/AssemblyBody.tsx)。来源、查询、分页、预览 revision、拖放与 apply callback 全未改。
- 改：[AssemblyItemView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/AssemblyItemView.tsx)。仅补已有 hideCaption 对应的 object-only 展示标记；未挪动 DOM 顺序、未新增状态。
- 改：[professional-assembly.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/professional-assembly.css)。同一 Grid 单元叠放材料及操作条；窄窗普通材料占完整列宽，集合/工作流本体尺寸保留。

## 4. 修复与保留内容

- 桌面取用操作在材料下沿浮现，静息态不再占独立空行。悬停前后条目高度和后一个条目的 y 坐标不变。
- 触屏操作保留常驻，放在标题下方；选择框与更多按钮分列在标题两侧，正文和图片不再被永久遮住。
- 存在真实媒体/重试控件的材料继续把取用命令放在内容下方，避免覆住播放或重试入口。
- 使用原 Oreo 按钮、既有色彩变量与玻璃层；44px 点击范围保留。
- Tab 仍按选择 → 更多 → 原有取用动作移动；Esc 返回当前条目更多按钮。原 action handler、可访问名称、拖放和 selection 不变。

## 5. 实际验证与截图

| 场景 | 修复前 | 修复后 |
|---|---:|---:|
| 638px 双列窗口，总滚动长度 | 2623px | 2119px（减少 19.2%） |
| 首个 125px 预览，条目总高 | 238px | 182px |
| 511px 窗口，普通材料实际宽度 | 276px | 455px |
| 390px 窗口，普通材料实际宽度 | 276px | 308px |

数字来自同一个隔离 fixture 的生产页；集合/Workflow 不计入普通材料放宽。

- [宽屏修复前](surfaces-assembly-before-1440.png) / [修复后](surfaces-assembly-after-1440.png)
- [511px 自由缩放](surfaces-assembly-after-resize-510.png)
- [真实 revision 图片与悬停取用](surfaces-assembly-real-image.png)
- [165 字符长标题、390px](surfaces-assembly-long-title-390.png)
- [触屏 390px](surfaces-assembly-touch-390.png)
- [短窗口](surfaces-assembly-short-window.png)
- 浏览器 11 状态：1440、511px 自由 resize、1024、390、hover 不跳、Tab 取用、Esc 回焦、真实图片、短窗口、长标题、触屏；0 pageerror、无横向溢出。
- 4 个现有测试文件 / 54 项通过；全前端 tsc 通过；修改 TSX 的 ESLint 通过。
- [布局脚本](surfaces-assembly-density-qa.cjs) / [交互脚本](surfaces-assembly-interaction-qa.cjs) / [几何数据](surfaces-assembly-after.json) / [交互数据](surfaces-assembly-interaction-states.json)。长标题只改隔离浏览器 GET 响应，不写项目。非 GET 请求仅已有画布 RFS query；未执行 apply、Run 或创建业务实体。

## 6. 剩余问题与下一步

- **未宣称装配所有视觉细节完工。** 音频/部分文件仍显示真实的暂无预览状态；本批没有造封面，没有将当前 node src 冒充历史 revision。
- 已保留四来源、搜索、筛选、刷新、真实结果总数、来源失败与重试，不为减少字数删掉现有操作。
- “图像 · 图像”等重复元数据仍需一次展示适配器整理；本批未改 AssemblyBody，避免碰正在并行收口的导航 callback。
- 大量素材分页/多来源故障仍用此前单测证据，本批 16 项 fixture 不替代 50+ 材料的浏览器测量。
- 推荐后续先补真实音视频缩略/播放信息，再统一本体元数据；S11 等原挂起项保持原状态。

# 节点选中、resize、zoom 与 ActionArc 跟随核验

日期：2026-09-27。结论：**本轮没有复现 Arc 绑定旧节点或不跟随 resize/zoom。未修改生产代码。** 早期截图的疑点不能直接当作已定位缺陷；此次用真实节点身份、DOM锚点和操作链确认当前行为。

## READ_SOURCE

根：`E:/TRAE项目/LCOS0.1收口`。

- `_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T3/LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md`：§8.2 Arc、§8.7浮层定位primitive、§19近场卫星/hover补字/不造第二定位引擎。
- 同目录 `LCOS_Gen2_T3_C1-S1_Current_Source_Exact_Map_20260906.md`：Exact anchor behavior与Existing owner split（约626–690行）；复用Huabu internal absolute position、真实尺寸与CanvasFloatingPopover。
- T1 `42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md` §3.2–3.4：选择/resize机械、screen-space chrome、同对象晋升、camera边界。
- 当前生产 `LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx`：soleSelected/context target → nodeId → anchor → CanvasFloatingPopover；nodeId变化关闭更多面板。
- `huabu/apps/web/src/components/Common/CanvasFloatingPopover.tsx`：ReactFlow viewport、body portal、FloatingUI flip/shift/nearbyControls。
- `huabu/apps/web/src/lcos/ui/nearfield/LcosActionOrbitMotion.tsx`：退出host设置inert/aria-hidden，旧命令不得继续派发。

## ADOPTED

保留当前正确caller，不为截图怀疑修改锚点owner。真实流程：单击项目定位 → 用户resize →松手 →撤销 →切图片 →省略号 →Esc；另外单击项目定位 →原生放大两次 →省略号 →切当前里程碑 →缩小返回 →重新选项目定位。

## VISUAL_SOURCE

Figma `nFUdroLvI5qJZuYTW8h2rF`，最终Main `5388:96`，Arc `5388:311`：82×82；三个卫星30×30，局部坐标0/0、46/6、52/52。

结构原件：`_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/structures/main/nodes-*.json`。

当前生产右上角偏移为(-34,-48)屏幕像素，由原CanvasFloatingPopover夹边/避让；不是固定右侧UI。

## RETIRED

没有删除或替换任何实现。未将“截图中似乎留在工作流附近”升级成事实，也没有重写相机、导航、Shell或Core。

## VERIFIED

真实页面 `http://127.0.0.1:5286/projects/lcos-gen2-dev/main`；所有测量只统计非aria-hidden的active Arc。

| 操作 | selected / Arc身份 | Arc相对真实节点右上角偏移 |
|---|---|---|
| 单击项目定位 | 同为 node-260adbf3-1338-4ee0-83c5-1bc153892100 | dx=-33.62，dy=-47.95px |
| resize鼠标仍按下 | 同一文档身份 | dx=-34.13，dy=-47.95px |
| resize松手 | 同一文档身份 | dx=-34.13，dy=-47.95px |
| 切参考图 | 同为 node-c1fa91ba-8ffb-4b67-8816-cab26810bd1e | dx=-34.14，dy=-47.95px |
| 项目定位放大两次 | 同一文档身份 | dx=-34.03，dy=-48.01px |

- 图片省略号面板的 `data-lcos-arc-panel-node` 与图片id一致。
- 文档更多面板打开后，单击当前里程碑，Arc切换为 node-52bcaf22-151b-4672-8641-7fe704c069cd，旧active更多面板数量为0。
- 缩小并返回项目定位，Arc重新绑定项目定位；Esc退出更多后仍是原对象。
- 用户resize已Ctrl+Z撤销，无节点几何残留；缩放放大/缩小各两次。
- 图：`arc-document-resize-proof.png`、`arc-return-proof.png`。
- 未改代码，因此未新增只测实现字符串的测试，也未扩大跑全仓测试。

## UNRESOLVED

早期reading截图中Arc疑似旧host的确切形成条件没有定位；可能需要当时选择/HMR/退出帧的额外事件记录才能判定，不能断言原因。当前稳定生产路径未复现。

本轮未覆盖集合内部子节点、父容器移动、画布切换中的异步退出、专业窗口强遮挡等其它状态。源码flowBox仍优先measured再width/style，而原T3历史指引倾向resize style优先；当前实测resize连续正确，缺少失败证据，不据此贸然换顺序。

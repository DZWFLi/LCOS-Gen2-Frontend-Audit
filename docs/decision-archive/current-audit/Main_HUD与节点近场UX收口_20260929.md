# Main HUD 与节点近场 UX 收口

结论：右键节点现在走同一条近场 Arc，不再弹第二份长菜单；Arc 受 Canvas attention 控制，Reader/Assembly 获得注意力时自动让位。顺手清掉了 Arc 里的临时 `canvasRef` 直写 Portal 入口，避免 UI 宣告提交却拿不到 canonical 回执。

## 交叉核验

| 用户动作 | Gen1 / T 卡 / Figma 依据 | 当前生产路径 | 结果 |
|---|---|---|---|
| 选中单节点后执行常用动作 | Gen1 `features/canvas/NodeContextToolbar.tsx`；T3 C1-S0 §1 object-local grammar；Figma `5388:311` | `LcosActionArc`：节点锚定，两个 icon-first 常用命令 + 更多 | 符合。命令仍由 `buildLcosNodeCommands` 提供，未新增 owner。 |
| 右键节点找命令 | Gen1 `features/canvas/ProjectCanvas.tsx` selection toolbar / `NodeContextToolbar.tsx`；T3 C1-S0 §1；Figma `5388:311` | `LcosActionArc` 的 `contextmenu` listener → `selectNodes` → 同一 Arc | 已修。原先独立按分组堆叠的长菜单删掉，常用命令与 More 不再两套入口。 |
| 多选对象 | Gen1 `ProjectCanvas.tsx` selection toolbar；T3 C1-S0 object-local interaction | Canvas `MultiSelectToolbar` / `LcosMultiSelectToolbar` | 现成入口和多选 owner 在位；未改。 |
| 收起/展开空间导航 | T2 C2-3B；Figma `5386:274` | `LcosSpatialNavigator` 默认 `expanded=false`，52×48 按钮展开相机控件；动作发给现有 camera owner | 符合。静息时不常驻大面板。 |
| 搜索与 Color Pin | T2 C2-2A/C、Figma `5384:367` / HUD `5392:7799` | `LcosNavigatorIsland` 顶部搜索 + 已使用 Pin；颜色来自 canonical Pin definition，Where/Resolve 仍由原 owner 执行 | 符合。颜色仍是高饱和成员导航标记，未换成运行状态。 |
| 左侧 Railway 看项目目的地 | T2 C2-1C §§0–2、18–22；Figma HUD `5392:7804–7806` | `LcosRailway` 读取 Core ordered refs；`railwayProjection` 过滤旧 Surface-root rail refs，不将 Collection/Scope 自动变目的地；实际无项目目的地时 rail 高度为 0，底部 SurfaceDock 常驻 | 保持最终 Figma 的目的地 hug 与 Dock 根入口分工；没有用 Collection Atlas 或 guessed scope 补内容。 |

## 修改

- [LcosActionArc.tsx](</E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx>)：右键选中对象后展示现有近场 Arc；删除独立长菜单。Arc 显示改由共享 `useCanvasAttentionStore.isCanvasEngaged` 裁决，Reader/Assembly 夺取注意力时收起，返回 Canvas 后随 attention 恢复。移除每次节点选中都读取 ProjectGraph 的 Portal 目标下拉和本地 `addNodes(canvasRef)` 写入；该入口没有 canonical 创建/取消/未知/逐项回执 owner，故不再伪报提交成功。Portal 预览/打开既有节点路径保留。
- [GlythStateActions.test.tsx](</E:/TRAE项目/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/GlythStateActions.test.tsx>)：增加右键复用 Arc、不出现第二长菜单，以及 Canvas attention 离开/返回 Arc 显隐测试。

## 验证与剩余

- `tsc --noEmit -p apps/web/tsconfig.json`：通过。
- Vitest 定向 4 文件 42/42 通过（Glyth/Arc、空间导航几何、Hud 组件族）。未操作浏览器；本轮 UI 视觉仍待共享会话验收。
- 此外合跑了之前 Collection Atlas 的 3 个测试文件：52 项通过、Context Atlas 旧“Workspace 目标不可用”两项失败，输出内容未出现原期望 reason。该断言属于 Context workspace-target 路径，本批未改对应入口；请由负责 Context 的代理核对并归属，不把它记作右键/Arc 回归。
- Railway 空项目时隐藏与最终 HUD“随目的地数 hug”一致；实际项目目的地的当前截图未由本轮浏览器实测。底部三现场切换仍由 SurfaceDock 独占快速入口。

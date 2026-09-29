# Workflow 取用与 Composer 显示修复（2026-09-29）

结论：Workflow「用于当前会话」已沿现有 Composer owner 链真实挂载；根因是画布注意力状态把明确的取用动作当成离开画布，压掉了浮层。没有增加第二个 Composer，也没有清空 receiver。

## 证据与改动

- 语义依据：Figma 采用清单 B03 节点 5344:752 将「用于当前会话 / 打开工作流现场 / 续接原会话」列为不同动作；B05 节点 5345:869 对应 Composer 草稿引用反馈。原裁决见 `docs/handoffs/GEN2_ContextWorkflow_UX纠偏_20260914.md` 的 Warehouse → Workflow kind → Task card + take into Composer draft 路径。
- 实际链路：`WorkflowTaskCardFace` / `WorkflowTaskCardView` 的按钮把点击锚点交给 `WorkflowCardPool.takeCard`；该 handler 调用 `setCanvasEngaged(true)`（WorkflowCardPool.tsx:194），随后复用既有 `openComposer`/receiver 与 CanvasFloatingPopover。状态变更位于显式按钮事件中，不在 render/effect 中。
- 真实根因：取用后 draft 与 Composer target 均已建立，`LcosComposerHost` 也收到 open；但 hand 在 React Flow 画布外，注意力 tracker 将画布标为未 engaged，`CanvasFloatingPopover` 的 `hiddenByOtherSurface` 据此隐藏 Composer。显式取用现在将焦点交还当前 worksite。
- 锚点：卡片正面及预览的取用按钮传递其实际 DOM rect；WorkflowCardPool 用既有 React Flow `screenToFlowPosition` 转成浮层坐标，保留取用近场位置。
- 唯一 owner 可见窗口判断：新增 `professionalStageVisibility.ts` 作为 Stage 与 Composer owner 共用的可见窗口枚举；`LcosHostOverlay` 不再让 compact 下不可见的 conversation window 错误占住 Composer owner。分组/Stage 结构由并行 T3/T4 改动提供。

## 实测与验证

- 页面：`http://127.0.0.1:5286/projects/lcos-gen2-dev/main`，真实现有 Canvas；从 Workflow 卡片预览点击「用于当前会话」。
- 结果：Canvas 1、`data-lcos-composer` 1、Composer view 1、textarea 1；卡片状态为「草稿中」，页面错误 0。Composer 矩形约 `{x:473,y:117,width:338,height:264}`，取用按钮锚点约 `{x:531.7,y:390.6,width:221.4,height:45.1}`。点「关闭 Composer」再 Escape 收起手牌后，Composer 0、手牌 0、Canvas 1。
- 截图：[取用后 Composer 可见](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/workflow-composer-final-open.png)、[关闭并返回 Canvas](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/workflow-composer-final-return.png)。
- 定向 Vitest：2 个文件、8 项通过；web `tsc --noEmit` 通过；`git diff --check` 通过。Core 单测不作为此用户链路证据。

## 未闭环

- 实际浏览器验证覆盖了分组、左右/上下分屏、拖比例与 reload 保持；窄视口 compact 切换未做实际页验证，可见 owner 的 compact 边界由定向测试覆盖。
- 本次修复不代表真实 provider、多模态、legacyNote 或其他下游执行链闭环。
- SSE 离线期间仍存活而消费者 refetch 失败、恢复后未触发权威刷新，是另一条独立待修链，不属于此次 Composer 取用修复。
 

## 实际窗口分组、分屏、比例与 reload 验证

同一 `decision-excerpt` Playwright CLI session，在现有 `http://127.0.0.1:5286/projects/lcos-gen2-dev/main` 页面中通过真实 UI 操作：双击 Canvas 会话 Glyth 开会话窗；打开 Assembly；在窗口菜单选择「并入上一个区域」；选择「左右分栏」。1280×720 下会话和 Assembly 同处一个分组 region，左右 pane 各约 356.5 px。拖动实际 separator 后 pane 宽约 388.19 / 324.81 px；reload 后同一分组、左右分栏及 ratio 均保留。

随后从同一分组选择「合并分屏」再「上下分区」，拖动 separator 后 pane 高约 308.23 / 264.77 px；reload 后方向、ratio 继续保留。真实 Canvas 节点的「在阅读器打开」打开 Reader 后再次 reload：DOM 仍有 `readerBodies=1`，Reader 是独立的第二 region，原组的 Assembly + conversation 上下分屏也继续保留。实测截图：[Canvas 分组、上下分屏与 Reader](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/workflow-windows-reader-after-reload.png)。

这次测量只证明该 fixture 页上的实际用户链路与持久化可见结果；没有覆盖窄视口下的 compact 切换，也不代表全部 window body 类型的恢复都已实测。

## Stage attention 与 Canvas Arc 回归验证

主审修复 Stage 打开/恢复时的 Canvas attention 后，我在同一浏览器 session reload 同一 5286 页面：Assembly、conversation split 与 Reader 三个 window body 保留；Canvas floating popover/action 查询为 0，没有 Arc 白色操作按钮漂在 Assembly 内容上。截图：[reload 后 Arc 收起](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/stage-reload-arc-hidden.png)。

在旧 z-index 版本中，pointer x=128,y=297 实际选中的是媒体 image node `node-c1fa91ba-8ffb-4b67-8816-cab26810bd1e`，不是 Glyth。查询到的 4 个「创建连接节点」是该 image node 的 React Flow source handles，不是 LcosActionArc；真正的 Arc 是 `在阅读器打开` / `围绕此对象工作` 等 `data-lcos-action-orb-hit` 按钮，位于 `[data-floating-chrome]`。当时 wrapper z-index=1000，Stage region `[160,88,540,580]`，两个按钮 rect `[446,287,44,44]` 与 `[492,293,44,44]` 均压在 Assembly 上。截图：[旧层级下节点选中与 Arc 按钮](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/stage-canvas-select-arc-restored.png)。


## Stage 隔离与真实命中复测（主审更新后）

主审将 Canvas root 改为 `isolation:isolate`，并让 LcosActionArc 的 CanvasFloatingPopover wrapper z-index=30（window Stage z-index=40）。同一页面上无窗口时选中 image `node-c1fa91ba-8ffb-4b67-8816-cab26810bd1e`，LcosActionArc DOM 仍出现；其 `[data-floating-chrome]` wrapper z=30，open/compose按钮可用位置约 `[1158,287,44,44]` / `[1204,293,44,44]`。这证明 z 调整没有移除 Arc。

打开 Assembly 并拖到 region `[450,88,640,580]` 后，按旧 Arc 点位执行 hit-test：`elementFromPoint(468,309)` 命中 `DIV.lcos-assembly-scroll`，`elementFromPoint(514,315)` 命中 `DIV.lcos-assembly-item`，二者都位于 `region-assembly` 内。Stage 打开/拖动会先把 canvas attention 置 false，因此 hit-test 时 Arc DOM 已隐藏；本次实测证明原坐标由 Stage 接管，未伪称测到了“Arc 与窗口同时挂载时的 z 抢占”。

Stage 打开时点击右侧露出的 Glyth 仍能选中 `node-1f04858a-4876-49da-a45e-19c02d1e5e91`，可访问名称为「承接会话（e2e fixture） · 正在思考 · 双击或按回车打开会话窗口」。关闭 Stage 后的全画布截图：[Glyth 状态与会话入口](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/glyth-thinking-visible-canvas.png)。Glyth 状态目前从可访问名称/DOM title 可见，页面上没有独立常驻“正在思考”文字标签。

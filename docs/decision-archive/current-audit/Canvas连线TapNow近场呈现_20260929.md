# Canvas 连线呈现对齐（2026-09-29）

## 结论
“显示/隐藏连线”仍只是总览减噪偏好；这次把其视觉行为推进到 TapNow 拆包里真正的 edge 交互模式：闲置关系收敛，选中节点/拖动节点的邻接关系回到近场，悬停和当前活跃关系提亮。Glyth/节点连接端口继续使用现有 near-field 规则，不移除锚点或改变连接能力。

## 拆包证据
- `E:/TRAE项目/LCOS0.1收口/_cabin/02_施工卡/施工前最后一轮校准/tapnow_拆包_20260904__unzipped/tapnow_raw/assets/vendor-pkg-canvas-CI-o9b4X.js` 中自定义 `E1e` edge renderer（bundle 字节偏移约 802,060）：zoom 下线宽按 2 / 2.5 / 3px 分档；闲置不透明度约 0.6；selected、hover、活跃端点提亮；只有 `animated` edge 在合适缩放/节点数下显示流动渐变；提供独立 20px interaction path。
- 同 bundle 的 `k1e` wrapper 使用全局 edgesVisible、两端点活跃状态及 node-drag 状态决定是否保留 edge。因而“收起总览”不是简单地把数据数组清空。
- 同 bundle 的 `node-handle-plus` 与 `vendor-pkg-canvas-CHU-0IGm.css`：加号端口在节点 hover/显式连接状态才显现，闲置时透明且不可点；ReactFlow 端点锚点与交互端口分离。
- TapNow 现存截图目录 `E:/TRAE项目/LCOS0.1收口/_cabin/07_原型与截图/拆包截图_20260908/TapNow` 只有登录、注册、主页及未登录项目列表图，没有真实画布连接截图。因此连线视觉取证来自打包后的生产 renderer/CSS，而不是假称有画布截图。

## 生产接线改动
- `huabu/apps/web/src/components/Panels/Canvas/edges/connectionViewEdges.ts`：纯呈现筛选。关闭总览时保留 selected edge、选中/拖动端点的邻接关系；隐藏端点对应的 edge 不渲染；开启时原数组直接返回。只复制渲染对象加 `lcos-connection-active` class，不改 store/Core edge。
- `huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx`：仅 LCOS chrome 使用上述筛选；Huabu 原生画布路径不变。无偏好时仍默认关闭。
- `huabu/apps/web/src/index.css`：连线总览投影线宽统一限制为 2.5px、闲置不透明度 0.6；显式活跃/选中/hover 路径恢复不透明并带轻微信息色光晕。override 只落在 LCOS 的渲染层，关系记录原有 strokeWidth 不被改写。尊重 reduced-motion。
- `huabu/apps/web/src/components/Panels/Canvas/edges/connectionViewEdges.test.ts`：覆盖闲置收起、活跃端点近场恢复、选中关系保留、隐藏节点过滤、拖动和展开全量。

节点端口的8个 anchor/每节点属于 ReactFlow source+target 的四边定位锚点，并非8个可见按钮。`NodeConnectAffordance.tsx` 将 idle handle 设为透明且 `pointer-events-none`；只有选中节点，或连接手势中悬停的目标节点才暴露交互端口，拖动节点和多选修饰键会收起它们。既有 `NodeConnectAffordance.test.ts` 定向验证通过；本批没有改这套连接 mechanics。

## 验证与限制
- 定向 Vitest：`connectionViewEdges.test.ts`、既有连线偏好/导航控件测试、`NodeConnectAffordance.test.ts` 共 4 文件、12 项通过；CSS 最后调整后再次跑 connection-view 与端口两组，共 7 项通过。
- 当前 `pnpm exec tsc --noEmit -p tsconfig.json` 报错只在并行改动文件 `src/lcos/navigation/LcosMultiSelectToolbar.tsx:20`：`referenceProjectId` 声明未使用；不属于本批文件。源码行已核，不将其标成连线回归。
- 浏览器扩展两次连接均失败（`nodeRepl.fetch request failed`）；按浏览器故障说明重试后停止。故本批没有伪造“后截图”或声称页面实测完成。先前的 LCOS 画布图 [旧总览截图](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/.playwright-cli/page-2026-09-29T13-29-39-972Z.png) 是上批开启状态，发生在这次端点近场实现之前，仅能作旧基线。拿到浏览器后仍需在同一真实 fixture 验收默认减噪、选中端点邻接关系恢复、hover 提亮及 idle handles 视觉/可点击性。

未新增后端/状态 owner；未提交或推送。

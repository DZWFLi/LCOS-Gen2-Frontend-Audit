# Arc 近场命中与邻近 Glyth 避让修复

日期：2026-09-26 19:47；仅隔离树 `LCOS_GEN2_GUI_RECOVERY_20260926`。没有修改节点几何、相机、Composer、canonical owner、主仓或发布。

## 结论

Arc 的透明矩形不再拦截空白点击；真实 44×44 按钮仍可点击。邻近 Glyth 被 More 热区遮挡时，沿现有 FloatingUI host 在 48px 内选最小有效位移。More 展开不再撑大整条 Arc 的定位框，仍锚在同一节点右上角。

## 采用依据

- 原 T3《全范围 Exact Interaction Blueprint》§8.2、§8.4、§19：对象局部卫星、能力驱动、高频直接动作、hover 才补文字，复用 Huabu geometry/display/actions，不另造大径向菜单。
- 最终 Figma **5388:311**：82×82 三圆弧，30px 可见圆；现有适配保留 44px 命中面积。
- 历史纠偏中“窗口打开就全部隐藏 Arc”已由当前真实注意力 owner 更新；本次不倒退为任意窗口存在就隐藏画布操作。

## 改动

1. `LcosActionArc.tsx`：浮层根与 Orbit 父层 pointer-events:none。现有 orb placement 的 pointer-events:auto 保留，透明缝隙穿透。
2. `CanvasFloatingPopover.tsx`：新增可选 nearbyControls 参数；仅 Arc 启用。读取邻近节点真实 button/role=button/input/link 屏幕矩形，排除自身节点，交给纯呈现函数。默认调用者不变；无实际碰撞不移动。
3. `boundedPopoverAvoidance.ts`：只计算有界位移，无状态。若 48px 内无法改善，留在原锚点，不将近场菜单甩到远处。
4. More 使用同一个 CanvasFloatingPopover 组件和同一节点角锚点，向角点左下方展开；独立测量宽度，不影响82×82圆弧。保持原命令模型、dispatch、原尺寸/强调色持久化。
5. More 命令行、输入、应用/清除与强调色按钮保留至少44px命中尺寸；44px色按钮内部仍为16px色样，未把视觉体积全部放大。
6. More 的 Esc 只收该层，并尊重已经被高优先级层消费的 Escape。

## 实测

- 原桌面 Arc `(962,114,82,82)`；More 热区 `(1007,159,44,44)`，与 Glyth `(1009.81,166.29,56.27,67.52)` 重叠。
- 修复后 Arc `(962,73,82,82)`，只上移41px；More 热区底边162，Glyth顶边166.29，留出约4.29px。三个按钮均44×44。透明缝隙 `elementFromPoint` 不再命中 Arc。
- More 面板 `(722,210,280,331.19)`，右边1002；Glyth左边1009.81，中心命中仍为Glyth。
- 展开前后相机矩阵均为 `translate(404.227px,317.95px) scale(0.535912)`。
- 普通 Playwright 非force双击邻近Glyth，真实会话窗出现；退场结束 More 数量为0。fresh reload 后重测成功且 errors=[]。
- 640宽已截稳态 More；360×640 下三个44px热区完整在x204..300，More `(53,292,280,294.39)` 留在视口内。
- **3文件26项回归通过**（Arc真实命令、命中/菜单层级、几何边界），前端 tsc 通过，diff check 无格式错误。

## 证据

- [修复前命中](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-before-hit-qa.png)
- [局部避让后](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-after-local-avoidance.png)
- [More展开](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-more-open-qa.png)
- [640宽](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-640-more.png)
- [360宽](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-360-more.png)
- [真实打开Glyth会话](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-glyth-real-open.png)

## 独立遗留，未冒充解决

- 360宽选中集合时，原生 right-source 的“创建连接节点”透明命中区域仍能盖住邻近Glyth。这一层不是Arc，已给主代理，不擅自改NodeWrapper/handle owner。
- 360宽底部Workflow曾遮住“收起空间导航”；主代理负责全局响应式布局，本次未修改其HUD文件。
- 极密集节点若48px范围内无更佳位置，Arc不会远移；后续需按真实拥挤案例继续看，不把本次六个几何用例当所有布局已覆盖。
- 浏览器历史日志曾记录并行 source 热更新时 documentSourceLayout.ts 500与动态模块错误；最终 fresh reload 的 Arc→Glyth 完整操作错误为0，未用旧日志掩盖失败。

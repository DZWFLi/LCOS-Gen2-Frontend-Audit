# G02｜Glyth 状态主动作与同一会话窗

已接通状态主动作，保留现有会话、窗口和 Composer owner。不是只换图标。

## 采用规则

依据 R5《Glyth ConversationSession UX 产品化设计施工规范》§7；视觉沿 Figma Main **5388:118/119** 的 Glyth、**5388:311** 的近场 Arc。

| 真实事实 | 主动作 | 实际去向 |
| --- | --- | --- |
| ready / done，允许发送 | 继续、打开、更多 | 原 Composer（intent=continue，真实 conversationId）/ 原 WorkView |
| thinking / working | 查看进度、打开、更多 | 同一 WorkView 的真实时间线 |
| 存在 pendingInputId | 回答、打开、更多 | 同一 WorkView 的输入区与真实回答控件 |
| 存在 pending_review | 复核、打开、更多 | 同一 WorkView 的结果复核区 |
| 未读取、读取失败、unavailable 或 needs_user 无具体待办 | 打开、更多 | 如实读取原 WorkView，不猜可执行动作 |
| capability=false | 打开；对应动作留在更多并显示真实原因 | 不替换成继续，不偷偷发起任务 |

运行态优先于待办；同时存在输入与结果时优先回答，结果仍在同一工作窗可达。没有新造产品状态枚举。

## 实际改动

- **READ_SOURCE**：读现有 Collaboration projection、T3 近场规则、R5 状态主动作及当前 shell/window caller。
- **ADOPTED**：在唯一 nodeCommandModel 内增加状态主动作。Arc 使用现有 SessionStore 的配对订阅；与 Glyth/WorkView 共享 SSE。点击回答/复核/进度调用既有 openWindow，既有窗口身份去重。
- **VISUAL_SOURCE**：保留现有三颗近场按钮、图标优先和悬停提示；打开使用窗口图标，回答/复核/进度分别使用明确语义图标。
- **RETIRED**：去掉会话一律普通“围绕此对象工作”的入口；不再用陈旧 descriptor active/waiting 在读取失败时伪装运行。辅助命令不会填入缺失的会话主动作位。
- **交互细节**：只滚动目标工作窗内部，不移动画布；懒加载后聚焦真实回答/复核控件或时间线。局部 observer 最多 5 秒，卸载/换项目/再次操作会取消；不增加 window/session owner。
- **Glyth**：姿态来自真实投影；选中/悬停保留轻反应；真实 Drop 接收 preview 保留 curious。双击/Enter 仍打开同一 WorkView。

## 验证

- 新增 **20 项**行为回归：六种状态/缺失事实/身份不符/capability 禁用；继续进入原 Composer；回答、复核、进度、打开保持同一窗口 ID；真实状态改变 donor；Drop receiving；双击与 Enter；延迟挂载和取消焦点。
- 原共享命令模型 **10 项**回归通过，非会话对象原行为保留。
- web-gen2 与 Huabu web TypeScript 检查通过。
- 独立浏览器在隔离实例 5286 操作真实 thinking fixture，近场出现“查看进度 / 打开 / 更多”；点击进度打开同一工作窗，显示真实运行事件。
- [工作窗截图](glyth-g02-progress.png)。截图里的 continuation 不可用是 fixture 的真实能力/缺少绑定 owner；未涂成成功，也未发送任何消息。

## 未完成项及限制

1. 待回答、待复核、完成等状态已做组件行为回归，但没有创建假后端事件凑端到端截图。
2. 发现缩小态中，上一集合的 Arc 会遮住邻近 Glyth。点击空白取消旧选择可恢复；已向主代理报告，需要近场碰撞专项处理。见 [命中重叠现场](glyth-g02-before.png)。本批不擅改统一锚点/避让。
3. G01 的 Composer 续工 preparation 由主代理实现，本批没有编辑 ComposerHost/useComposerContinuation。
4. 其它节点/集合/媒体余项继续看 [节点实施清单](nodes-implementation.md)，不能把 G02 完成当成全部视觉已对齐。

## 修改文件

- [apps/web-gen2/src/interaction/nodeCommandModel.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/interaction/nodeCommandModel.ts)
- [apps/web-gen2/src/presentation/glythPresentation.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/glythPresentation.ts)
- [apps/web-gen2/test/node-command-model.test.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/test/node-command-model.test.ts)
- [huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx)
- [huabu/apps/web/src/lcos/navigation/focusConversationSection.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/focusConversationSection.ts)
- [huabu/apps/web/src/lcos/navigation/focusConversationSection.test.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/focusConversationSection.test.ts)
- [huabu/apps/web/src/lcos/navigation/GlythStateActions.test.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/GlythStateActions.test.tsx)
- [huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx)

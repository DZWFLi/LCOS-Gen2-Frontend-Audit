# T3/T4 Composer / Glyth / Professional bodies 逐行对账

日期：2026-09-29。只对父任务指定的原矩阵行号复核，不重写总账。源码依据均指当前修复工作树 `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926`；本记录把源码路径、界面验证和 Core/provider 验收边界分开写。

## 样式链核验

`main.tsx` → `index.css` → tokens / families / `lcos.css` 是完整生产导入链；`LcosComposerView.tsx` 自己导入 `nearfield.css`，其 `.lcos-composer-view` 同时拥有 Noto Sans SC 字体族、338px 基准宽与窄屏 max-width。续工控件自己的 `conversation-continuation.css` 被 `ConversationContinuationControls.tsx` 导入。`LcosComposerHost.tsx` 将控件传进 `LcosComposerView.continuationControls`，因此生产渲染时确实位于 `.lcos-composer-view` 之内，字体和 Composer 引用条样式都会继承。

首次截图是隔离挂载，没有 Composer 父层，所以显示成默认字体/裸引用条；那不是生产视觉。本次用已缓存 Playwright Chromium + Vite 在 `/setup` 同页加载真实生产 `LcosComposerView` 和 `ConversationContinuationControls` 模块，放进 320px viewport。Core 与 `/api/workspace` 未运行，能力提示/提交禁用是如实降级；这不是核心提交验收。超长材料名为测试 fixture。

实测（320px viewport）：Composer x=16、宽 288、scrollWidth=clientWidth=288；四个模式各宽约 62.25，模式条 scrollWidth=clientWidth=264，无横向溢出；两个超长引用条的内容宽 296、可视宽 264，由现有引用横向滚动承接；长名省略显示。computed font 为 `"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`。截图：[生产样式下 320px Composer 与精选引用预览](E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\T3_T4_Composer窄宽生产样式核验_20260929.png)。

结论：隔离截图漏加载/继承生产样式才造成衬线字；生产 CSS 链完整，当前窄屏四模式和引用条没有容器溢出。未改样式或产品代码。截图组件渲染没有走真实 Core、canvas pointer 或数据端到端。

## 原矩阵逐行对账

| T3/T4 行 | 操作链与当前事实 | 已修/当前源码证据 | 现成未接、实质 UX 缺口 | 仅缺验证 / 底层后置 |
|---|---|---|---|---|
| 9 | Glyth 本体投放与 Composer 引用槽是两条不同语义。 | `GlythNodeBody.tsx` 注册 `collaboration-reference`；`dropIntentResolver.ts` 的 Glyth 本体目标生成 conversation `assembly-apply`，`LcosHostOverlay.tsx` 调 Core `assembly.apply` 并刷新会话；`ConversationWorkViewBody.tsx` 展示 bound context。Composer 的 resolver 分支仅追加 draft reference store。 | 当前没有静态证据显示二者错接；不可把 Glyth 本体 drop 写成 Composer 单次引用。 | Core 落库 receipt、重开会话后持久上下文、Composer 仅当次引用需真实现场验证；不是同一个后端持久化检查。 |
| 10 | Composer 引用 pick/drop → 有序草稿引用 → 删除。 | `LcosComposerHost.tsx` 从 draftRefs 建 `referenceItems`（含 display label、image thumbnail、remove 回调）；`ComposerReferenceStrip.tsx` 使用 nearfield 正式 tag 样式；`ComposerReferencePicker.tsx` 和 `lcosReferenceState.ts` 是 caller/store。 | 当前未见明确 UX 缺陷；需真实 canvas drop 命中槽位后确认排序/去重/remove。 | 浏览器验收缺失；组件/状态测试不能代表 pointer drop 真实命中。 |
| 11 | 节点到 Composer 后继续输入，并保留 draft/reference。 | `lcosShellStore.ts` 持有 composerPrompt/target；`composerPresentationOwner.ts` 处理 Arc/Composer overlay owner；Host 以同一 draft store 装载 prompt 和 refs。9/14纠偏已落实 presentation 去重。 | 当前源码可追到同一 draft owner；未发现组件重建后明确丢稿的 UI 缺口。 | 切换对象/现场再回来、节点投递后继续编辑需浏览器验证。 |
| 12 | Work View 绑定 canonical receiver 后继续发送。 | `ConversationWorkViewBody.tsx` 以 connected conversation、confirmed continuation operation 判断 `canContinueCurrentConversation`；receiver identity 独立组件，发送使用 continuation operation id。 | 未见把 A receiver 串到 B 的静态依据；与 Composer receiver 绑定仍应现场确认。 | 真实 provider 发送/回执缺测；mock/组件测试不证明 Core 路由。 |
| 13 | 录音 → Core 转写 → 选择/光标/末尾合并草稿，不自动 Run。 | 本轮先前已把 `voiceInput.ts` 接 `MediaRecorder`；`LcosComposerHost.tsx` 上传既有 `/runtime/voice/transcriptions`，成功仅改 prompt 并恢复 caret，明确不触发 submit。相关交付为 `T3_T4_语音输入Core接线_20260929.md`。 | UI 按录音/转写状态反馈；当前没有经真实麦克风/provider验收，保留为未验收，未扩实现。 | Core 有既有接口；但本地 whisper provider 环境配置、权限及浏览器格式仍未知。纯文本合并定向测试通过不等于语音实测。 |
| 14 | 改草稿 → Run → failed/stopped/recovery。 | `composerSubmission.ts` 与 Host 使用当前 target 和 operation owner；Work View 有 Recovery section / 状态回读路径。 | 没有新的、已证实的纯 UI 断点可安全就地改。 | 真 Run 的 create/stop/failure 与 draft/receiver 恢复需要 Core/provider 场景实测；不由样式测试替代。 |
| 20 | 打开 Assembly → 搜索/预览 → 应用 → receipt。 | `AssemblyBody.tsx` 是独立 Professional body；`AssemblyPreviewView.tsx` / `AssemblyReceiptView.tsx` 渲染既有预览和回执；`dropAssemblyReceipt.ts` 接现场投放回执。9/14 Assembly UX 纠正把它从节点 Arc 移除，按专业窗口入口使用。 | 暂无可从本次窄 Composer/静态路径确认为 UI bug 的证据；不要把“Core未连”写成入口未接。 | 当前缺真实 warehouse 材料数据、apply 后新实体可见、receipt 可读的浏览器链。 |
| 21 | 指定 artifact revision → 阅读 → 回来源位置。 | `ArtifactReaderBody.tsx` 解析目标 artifact/revision 和 source；`ReaderContentView.tsx`、`ReaderContentTabsView.tsx` 保留阅读内容/标签；Professional Stage 的 Reader close/Esc 路径调用 `returnReaderToSource`。 | 当前源码可追到指定 revision、阅读位与来源连续性，没有发现明确 GUI 缺口。 | 真实 artifact revision 与相机/选择回跳尚未实测；源码存在不算“读后返回”实测。 |
| 22 | Professional Window move/resize、dock、split/group、close/restore。 | `ProfessionalWindowStage.tsx`：205–284 pointer move/resize；290–299 dock/undock；430–495 close/tab group/ungroup；500+ resize handles。相关区域几何保存在 shell store，窗口 owner 与 Canvas camera 分开。 | **确认的拓扑缺口**：生产 stage 只渲染当前 region 的一个 active body/tab；可见动作只有 floating/right-dock/group-as-tab。`windowRegionTopology.ts` 有 `splitRegionGroup` 纯 helper 与测试，但当前 `LcosShellStore`/Stage 没有调用或生产 split 命令，故横/竖 split 不能算已接。旧 T4 §1 明确要求“横/竖组合”。实现要改 window topology/store owner，不是只加一个视觉图标；本轮未做未经授权的底层拓扑重接。 | move/resize/dock/group 需浏览器操作验证；真实 split 仍属后置实现，不可标仅缺实测。对象跨现场 move 禁用与专业窗口 move 无关。 |
| 23 | Glyth/Work View 读协作状态 → 续工/输入 → waiting/recovery。 | `GlythNodeBody.tsx` 挂持久上下文、续工入口；`ConversationWorkViewBody.tsx` 渲染投影状态、receiver、Composer continuation；`WaitingInputSection.tsx` 和 `RecoverySection.tsx` 由 projection capability/action 门控并调用既有客户端。独立续工控件保留预览、确认、请求 id、错误和恢复入口。 | 本次实测只检查续工 Composer controls，不覆盖真实 Work View 业务状态；未确认静态纯 UI 缺口。 | Core collaboration capability、provider权限/失败/unknown、waiting input/recovery 实际回执需要现场实测。 |

## 本轮未动与下一步

除前序语音接线和续工入口改动记录外，本次样式核验没有新增源码修改。唯一查实的当前差距是原卡 Professional Window 横/竖 split 没有生产 caller：split helper 是未接入模型辅助，不等于 UI 完成。它涉及 window region/store/topology owner，不能靠给按钮挂假 action 解决；应由窗口拓扑施工批继续处理。Assembly、Reader、Receiver、Run/Recovery 需要的真实端到端验收仍独立保留。

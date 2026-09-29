# Context / Workflow / 运行反馈分路对账｜2026-09-29

结论：修了 Atlas 当前现场身份未接入的问题；Workflow 的“预览→取用→可见反馈→返回”在现有浏览器样本里闭环。真实 workflow workspace 没有可用 canvas，故进入链只能确认“明确不可用”，不能冒充成功。其余未闭环项按原总账行号列在下方，方便主审汇总；未编辑总账。

## 本轮代码变化

Context Atlas 的卡片视图早已支持 `active`/`selected` 和 active pocket outline，但 `ContextAtlasStage` 没有把当前 Shell Workspace 传进去，结果同名的当前现场与其它目标长得一样。本次沿现有 owner 接线：`ContextWorksite` 读取 `activeWorkspaceId` → `ContextAtlasStage` 仅对 `kind==='scene' && entityRef.id===currentWorkspaceId` 标 active → 复用已有 selected outline，并显示“当前现场”徽标与 `aria-current="location"`。不按 scope/标题猜当前项。

- `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\surfaces\context\ContextWorksite.tsx`：传入当前 Workspace ID。
- `...\surfaces\context\ContextAtlasStage.tsx`：按 Warehouse scene 的 exact ID 决定 active。
- `...\ui\context\ContextCollectionView.tsx`、`ContextCollectionFace.tsx`、`context-spatial.css`：把已有 active variant 贯穿到卡片，增加明确身份徽标和读屏当前位置信息。

上一批已有 title 悬停提示继续保留：整卡与箭头分别显示“打开/选择/定位”。未更换箭头动作 owner。

## 原总账相关行逐项状态

状态含义沿用原表：已修有证据、主仓已有待接、实质 UX 缺口、仅缺验证、底层后置。原表行号均指对应 T1/T2、T3/T4、T6/T7 对照表的条目号。

| 原表行 | 当前结论 | 当前证据 / 边界 |
|---|---|---|
| T1/T2 #4 Collection 拖入与成员接收 | **底层接口缺失，后置** | 旧 `ScopeKind=collection` 与旧 branch 兼容路径存在；当前 Gen2 contract/producer 没正式 Collection identity、成员增删事务与 Assembly target。Atlas 卡片不能替代同画布成员展开。依据 `T1_T2_UX原件对照.md:10`。 |
| T1/T2 #5 展开/折叠成员与恢复布局 | **底层接口缺失，后置** | Huabu Frame/reflow 可复用，但 host seam 缺 membership manifestation、成员显隐和折叠恢复 owner；依赖 #4。依据 `T1_T2_UX原件对照.md:11`。 |
| T1/T2 #6 peel / dissolve 集合 | **owner 未裁决，后置** | 原补丁卡将 Colony 标为 `BLOCKED_OWNER`；没有产品动作链。不是 UI 按钮漏画。依据 `T1_T2_UX原件对照.md:12`。 |
| T1/T2 #9 三现场身份同步 | **部分已修有证据** | Shell 按当前 surface 提供 `activeWorkspaceId`；本次 Atlas 用精确 Warehouse scene ID标出对应卡。浏览器实测 Context 根页命中 1 张同名卡；三现场切换与深层 child 状态保留仍沿用原表“需要更广往返验证”。依据 `T1_T2_UX原件对照.md:15`。 |
| T1/T2 #10 child Back 来源返回 | **仅缺验证** | `childWorksiteNavigation` / `returnToSourceWorksite` owner 已存在，根/子误判已修；本 fixture 未跑真实多级 child 进入→返回。依据 `T1_T2_UX原件对照.md:16`。 |
| T1/T2 #20 跨 child 定位后返回 | **仅缺验证** | exact canvas/spatial identity 与 Enter/Back 源码已存在；本轮无真实多级 Worksite + 目标组合，未把 root route 当 child 证据。依据 `T1_T2_UX原件对照.md:26`。 |
| T1/T2 #21 Portal 与 Collection 区分 | **Portal caller 有；Collection 成员链底层后置** | Portal worksite Enter 与来源栈存在；普通 Collection 按裁决应留原 Canvas 展开，但 membership/display seam 未接。依据 `T1_T2_UX原件对照.md:27`。 |
| T3/T4 #12 Work View 继续会话、绑定 receiver 后发送 | **主仓 caller 有，provider 仅缺实测** | canonical conversation id / receiver identity 与发送阻断已接；需真实 provider 回执，不从组件或 ACP fixture 外推。依据 `T3_T4_UX原件对照.md:20`。 |
| T3/T4 #14 Run 提交、失败/停止/恢复 | **主仓 caller 有，真实运行仅缺验证** | `composerSubmission`/`LcosComposerHost` 提交与阻断理由存在；真实 Run create/stop/failure 后草稿与 receiver 恢复未以 provider receipt 验证。依据 `T3_T4_UX原件对照.md:22`。 |
| T3/T4 #15 三 Worksite 切换后恢复各自状态 | **仅缺验证** | surface 专属 caller/store 存在；当前无真实深层 child 离开再返回的 camera/selection/layout 浏览器证据。依据 `T3_T4_UX原件对照.md:23`。 |
| T3/T4 #16 Context Atlas 搜索/定位/进入 child | **卡片入口已修；集合编辑能力底层后置；child 回程待验证** | Atlas 只展示 context/collection/scene；无投影不给定位；当前精确 active scene 现在可辨认。拆分/合并/删除/Pin/Glyth 需要真实 command/allowedActions owner，不能补假按钮。依据 `T3_T4_UX原件对照.md:24` 与 `surfaces-batch9-context-layers.md:64-67`。 |
| T3/T4 #17 child Temporal Rail | **实现路径有，真实 child 数据缺实测** | Rail 只在 `isChildWorksite` 下挂载，producer 按 active workspace/canvas 查时间记录；当前浏览器样本是 root Context，没证明真实 child 时间索引、多目标 focus 或离开恢复。依据 `T3_T4_UX原件对照.md:25`、`surfaces-batch9-context-layers.md:66`。 |
| T3/T4 #18 Workflow 手牌专属搜索与取用 | **取用路径浏览器验证；Composer surface 有交接点** | `WorkflowCardPool` 只取 `kind==='workflow'`，卡片加到真实 draft store；浏览器上状态变为“草稿中”，副标题“已加入草稿 · 未发送”，live status 说明“尚未发送”。同时 `composerOpen=true`，但本次 DOM 没有 `.lcos-composer-view`，收回手牌后仍未出现；若该按钮要求立即打开 Composer，承接 owner 在 Host/overlay 范围，不在本次允许文件中，已交根代理。依据 `T3_T4_UX原件对照.md:26` 与 `workflow-near-preview-spatial-fix.md:62-69`。 |
| T3/T4 #19 预览→进入 workspace→返回来源 | **实现路径存在；真实进入样本缺数据，region/origin 仍未接** | 单击轻预览、双击/Enter 交给 navigation owner、来源 return context 均存在。当前浏览器唯一 workflow 有 3 个 workspace 候选，但都缺 `canvasId`，入口如实标不可用；未拿 root canvas 或假 workspace 冒充成功。region/origin 由真实 target producer 决定。依据 `T3_T4_UX原件对照.md:27`。 |
| T3/T4 #23 Glyth/Work View → waiting/recovery | **已有路径与历史受控实测；其它 provider 仅缺实测** | waiting input 保留输入、timeout 如实反馈；recovery 进入 recovering 且不重复 create 的历史 handoff 只证明受控样本，不外推全部 provider。依据 `T3_T4_UX原件对照.md:31`、`T6_T7_UX原件对照.md:21`。 |
| T6/T7 #1 Assembly 查归档/恢复 Artifact | **主仓已有待浏览器核验** | `AssemblyBody` → `ArchiveBody` 列表与恢复 consumer 存在；本轮 Context/Workflow 没重测。不是项目级归档。依据 `T6_T7_UX原件对照.md:7`。 |
| T6/T7 #2 Reader 归档/恢复与重新落位 | **源码链路符合，仅缺实测** | 归档后 fresh graph / 移除当前 projection；恢复后 mutation reconcile 以当前现场重新落位。依据 `T6_T7_UX原件对照.md:8`。 |
| T6/T7 #3 活跃 projection 过滤 archived Artifact | **符合该局部职责** | active spatial projection 过滤 archived Artifact；不代表 archive viewer 缺失，也不代表项目归档。依据 `T6_T7_UX原件对照.md:9`。 |
| T6/T7 #4 外部 Artifact 变更触发 host reconcile | **subscriber 与 caller 存在，外部端到端仅缺实测** | SSE artifact listener → `LcosProjectShell` host `notifyMutationSuccess` → reconcile 的当前路径存在；不把它说成打开中的归档列表会自动更新。依据 `T6_T7_UX原件对照.md:10`。 |
| T6/T7 #5 已打开 ArchiveBody 同步外部归档/恢复 | **实质 UX 缺口** | ArchiveBody 首次打开与自身恢复会 reload；未订阅外部 artifact change，另一客户端变化时已开列表可陈旧。依据 `T6_T7_UX原件对照.md:11`。 |
| T6/T7 #6 项目级 archive/restore | **未核实** | Artifact 与 project lifecycle 分开；本审计不据未找到 consumer 推断全系统没有项目归档。依据 `T6_T7_UX原件对照.md:12`。 |
| T6/T7 #7–8 项目 subscriber 与所有 watched consumers | **现有 caller/invalidation 路径存在** | bearer 项目 SSE 由真实 watcher 建立；session listeners 刷新 conversation projection/timeline，artifact listener 通知 host reconcile。依据 `T6_T7_UX原件对照.md:13-14`。 |
| T6/T7 #9 流断开/离线恢复 | **实质 UX 缺口仍未闭** | SSE 文件已有重连改动与定向测试；但浏览器复测明确复现：`setOffline(true)` 后现有流仍可推进 artifact cursor，消费者 refetch 失败；`setOffline(false)` 后旧流不 EOF，未建立新 snapshot/recovery，归档列表仍不更新。先前暂停后没有继续扩大底层修复。依据 `T6_T7_UX原件对照.md:15` 及最新离线恢复实测交接。 |
| T6/T7 #10–11 snapshot/replay invalidation 与 broad invalidation | **已接 watcher 的当前 invalidation 符合，不判缺失** | 当前连接收到 snapshot/replay 会刷新已注册 watcher；通用 invalidation 是既有策略。断线无续接见 #9，未注册 watcher /已打开 ArchiveBody 列表需各自归属刷新。依据 `T6_T7_UX原件对照.md:16-17`。 |
| T6/T7 #12 Glyth→Work View 信息读取 | **路径存在，历史受控样本有证据** | identity/reach/runs/operations 与 timeline 有真实 caller；本轮未重跑。依据 `T6_T7_UX原件对照.md:18`。 |
| T6/T7 #13 continuation capability probe | **符合 fail-closed 语义；provider 样本待核** | probe 不支持时 unavailable 是原卡要求，不记实现偏差；实际可用 provider 需要环境实测。依据 `T6_T7_UX原件对照.md:19`。 |
| T6/T7 #14 continuation adapter receipt | **源码接线存在，真实 provider 场景待核** | T6 journal→provider adapter→receipt/bind→accepted/error/unknown 刷新有源码路径；ACP handoff 不代表全部 provider。依据 `T6_T7_UX原件对照.md:20`。 |
| T6/T7 #15 waiting_input/recovery | **有受控路径证据，其它 provider 待测** | timeout/unknown/recovering/不重复 create 有既有 handoff；真实 provider UX 未全核。依据 `T6_T7_UX原件对照.md:21`。 |
| T6/T7 #16 持久 context 到 Composer/continuation | **已知前端 seam 已修；多模态/legacy/provider 待核** | 不重复报旧的 textArtifact/ArtifactView 持久读取与发送合并问题；多模态、legacyNote 和实际外部接收仍未闭环。依据 `T6_T7_UX原件对照.md:22`。 |

## 浏览器链路记录

- Context：用已有 Chrome `C:\Program Files\Google\Chrome\Application\chrome.exe` 打开本地开发站 `http://127.0.0.1:5286/projects/lcos-gen2-dev/context`，从真实 Context 仪器呼出 Atlas。修前 6 张卡均无 active；修后 exact active scene 命中 1 张“Context · 理解现场”，徽标、selected outline、`aria-current=location` 都在 DOM，`pageerror=0`。截图：[修前](E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\context-atlas-before.png)、[修后](E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\context-atlas-active-after.png)。此项目是现存本地开发/e2e fixture，只证明真实 route owner 与 UI 接线，不代表正式用户项目或真实 child 往返。
- Workflow：从 Main 手牌打开当前真实 workflow 条目“真实工作流导入验收”，单击进入预览；卡显示真实三候选提示。三候选因缺 canvas 都 disabled，故没有进入分支；选“用于当前会话”后 draft store 有该 workflow identity，卡切成“草稿中”，可见“已加入草稿 · 未发送”，live region 同步提示；点“收回工作流手牌”后回 Main，focus 返回 `呼出工作流手牌` 按钮，`pageerror=0`。截图：[预览](E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\workflow-preview-enter-before.png)、[取用反馈](E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\workflow-use-after.png)、[返回现场](E:\TRAE项目\LCOS0.1收口\GUI全量对齐_20260926\workflow-use-after-close-hand.png)。
- Composer 交接点：相同取用动作写入 `composerOpen=true` 与正确 `composerTarget`，但页面没有 `.lcos-composer-view`。卡内 draft 回执足够表明“加入草稿、未发送”；若期望后续编辑器立即可见，需要在 Host/overlay owner 修，当前本批不得跨文件扩大。

## 检查与限制

- 对本次四个 Context TSX 文件运行 targeted ESLint：通过；工具仅提示 monorepo 多 `tsconfig` 的常见 warning。
- 对本次 Context 文件 `git diff --check`：通过；Git 提示既有 CRLF 工作副本会在未来写入时转 LF。
- 未跑测试套件；未安装浏览器；未改 Core；未改总账；未 commit / merge / push。
- 受限范围修改 Context 的准确当前现场身份表达。Workflow 进入路径因真实 canvas 数据缺失不能实测；Collection 成员编辑、真实 child Temporal Rail、Workflow region/origin、外部 provider 与 SSE 离线回补仍按表交接。

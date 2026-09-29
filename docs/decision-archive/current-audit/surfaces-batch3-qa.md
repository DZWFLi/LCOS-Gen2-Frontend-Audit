# 专业窗口 / Context / Workflow：第三批实修与浏览器验收

日期：2026-09-26。工作树 `LCOS_GEN2_GUI_RECOVERY_20260926`。本批真实浏览器入口：`http://127.0.0.1:5286`，仅根任务恢复的隔离 fixture（Core 43131、Huabu 3011）。没有执行 Run、创建真实项目、改 backend 或新增状态 owner。

> 2026-09-26 后续更正：fixture 的三个 workspace 都是 root scope；不出现 child URL/时间轨是正确结果。根/子 caller 已按真实 canvasBySurface 分流修复，详见 [第四批记录](./surfaces-batch4-continuation.md)。下文保留当时观察，不再把根入口判作子现场缺失。

## 结论

窗口、Reader、光幕搜索和工作流手牌已完成一轮真实浏览器验收。最明显的窄屏 Reader 正文被挤成细条、集合搜索无法接收鼠标、工作流多目标一刀切禁用等问题已修。**没有把这批修复说成整套设计已完全一致**：Context 同现场进入路径仍有待导航 owner 查证，PDF/视频缺当前 fixture 实物。

## 本批修复

| 实际问题 | 已落代码 | 验证 |
|---|---|---|
| 集合光幕搜索继承 pointer-events:none，外观正常但无法点击 | `ui/context/context-spatial.css` 恢复搜索命中；390px不再被固定宽计数挤成短胶囊 | 真点击并搜索“施工”，1440/390均返回2项 |
| 同名场景和上下文完全难辨 | 用真实 kind 增加“现场/集合/上下文”轻量来源文案；不把 kind 当时间/事情组织语义 | 逐项保留真实对象，没有擅自合并 |
| Reader 在小窗口中正文被标题、归档、操作区压成约18px细条 | 正文最小阅读高度280px且不参与压缩；窗口body仍由现有滚动层承接 | 1024三窗、390紧凑窗截图可看完整图像 |
| 390px多窗切换后活跃窗口只有内容自然高度 | 唯一Stage紧凑呈现填充既有可用区，后台窗口身份和宽屏几何保留 | 1440→1024→390实际切换，无新窗口系统 |
| Reader/WorkView等小窗命令挤掉标题 | 非Assembly也使用明确命令菜单；停靠/分组/取消分组原命令保留，关闭常驻 | 菜单Esc只关菜单；已消费Esc不关闭窗口；根任务负责active tab可见性 |
| 真实text/plain材料显示无正文/无预览 | Reader与AssemblyArtifactMedia按实际revision Blob MIME读取文本；不借用当前画布内容 | 单测精确FileRecord参数；浏览器出现真实“越过边界，看见下一座山。” |
| 工作流有多个真实workspace时所有进入动作被统一禁用 | 原预览内提供已有DropdownMenu目标选择，每项用原resolve+beginChildWorksiteNavigation；缺画布仍禁用且说明原因 | 真菜单可达；fixture的3项均不可进入，未造目标 |
| WorkView把取消中的续工operation当可继续发送 | 复用根任务 `selectConfirmedSendOperation`，要求cancel=none及已有外部证据 | 完整类型检查与WorkView回归 |
| 恢复按钮仍用旧retry_external_create文案键 | 用完整ContinuationActionV1映射recover_external；只向现有operation发送recover；恢复期间不允许并发动作；父owner唯一刷新；错误不会6秒后自动消失 | 真实contract形状测试确认existing operationId、expectedRevision和recover_external；未调用创建 |

## 浏览器证据

使用现有 Playwright 1.63 + 独立 Chrome context。CUA 初始化因 sandbox helper SetNamedSecurityInfoW=5 无法运行，未改其权限设置。没有使用第二套预览服务。

| 检查 | 结果 |
|---|---|
| 身份/首屏 | LCOS项目页与fixture项目标题正确；有真实内容 |
| 白屏/框架错误遮罩 | 未见 |
| JS console/pageerror | 最终完整路径19个状态，0条 |
| Context/Workflow切换 | 真按钮可切换；Atlas/Hand各是原画布上的临时层 |
| Atlas搜索 | 真点击与搜索通过；390px再验 |
| Hand | 单击预览、返回手牌、滚到材料/会话区、打开WorkView、空白收回均通过 |
| Assembly→Reader | 显式“取用”固定操作区，再点“阅读”，真实图像可载入；仅悬停受懒加载重新排布影响，不作为稳定验收路径 |
| 一窗→二窗→三窗 | WorkView→Assembly→Reader，1440并列、1024排布、390紧凑切换；窗口命令仍在 |
| 子现场 | “施工主线”按真实preferredSurface可到Main子现场；“Context · 理解现场”8秒后仍回/context无workspaceId，已转交根/导航owner查证 |
| PDF/视频 | fixture没有对应实际材料，浏览器缺证；精确历史revision+renderer接入仅有单测证明 |

脚本：`surfaces-browser-qa.cjs`；19状态记录：`surfaces-browser-states.json`；等完整过渡的子现场脚本/记录：`surfaces-child-qa.cjs` / `surfaces-child-states.json`。

截图：

- [Reader 390](./surfaces-windows-390.png)
- [多窗 1024](./surfaces-windows-1024.png)
- [集合搜索 390](./surfaces-atlas-390-search.png)
- [工作流近场预览 390](./surfaces-hand-390-preview.png)
- [真实工作现场选择](./surfaces-hand-worksite-choices.png)
- [装配与WorkView](./surfaces-assembly.png)

## 自动验证

- 本域整组：24测试文件，123测试通过（professional、surfaces/context、surfaces/workflow、Stage6Presentation）。
- 完整 `pnpm exec tsc --noEmit --pretty false`：通过。
- 本批生产文件及新增恢复测试ESLint：通过。
- 整组测试有既有mock尝试localhost:3000的ECONNREFUSED输出，测试不失败；真实5286浏览器错误记录为空。未把该输出藏掉或替换成假服务。

## 明确留下的事项

1. Context同现场进入/返回路由与右侧时间轨的完整浏览器回合交根/导航owner继续；不能仅据点击成功称已进入。
2. 工作流Region本体的进入仍不等于已有Workspace选择；来源会话缺ID时续接保持不可用。
3. Collection组织轴仍缺明确producer；目前是诚实未指定，不按updatedAt或kind硬猜。
4. ReaderGroup完整生产挂载、阅读位置跨刷新、集合编辑/drop全命令、手牌高数量更精细动态布局仍在全量清单。
5. 现装配真实图片与Markdown属于可见时懒加载；未滚到的waiting不能误报无读取通道。音视频装配缩略呈现仍需后续专项。
6. 页面12桌面捕获/运行预留不补成Web假功能。页面13跨Composer状态由根任务唯一owner处理。

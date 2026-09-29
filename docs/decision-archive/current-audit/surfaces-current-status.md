# 专业窗口、Context、Workflow：S01–S32 当前状态

日期：2026-09-26。以当前生产 caller 和已有验证为准，保留实现与缺口分开。浏览器验证不等于全状态背书；真实fixture缺少的材料/能力均写明。

| 编号 | 功能 | 当前状态 | 已实现 / 浏览器证据 | 仍缺 |
|---|---|---|---|
| S01 | 装配四来源、搜索与分页 | 保留，部分浏览器验证 | 四来源、服务端搜索/cursor和过期请求取消仍由AssemblyBody持有；真实打开装配、滚动、搜索入口与取用 | 超过50条分页及网络重试需专项浏览器素材 |
| S02 | 装配瀑布流与预览 | 已补正文/真实图片及装配密度，完成宽窄窗口与触屏浏览器验证 | 精确revision媒体路径；text/plain也可预览；瀑布流与显式取用保持；桌面操作叠在材料下沿，窄屏材料满列、集合/工作流固定本体，触屏操作避让正文；第8批11状态：1440/1024/390、511px自由resize、真实图片、长标题、短窗、hover稳定、Tab/Esc、触屏。详见surfaces-batch8-assembly-density.md | 大量素材与音视频封面仍待专项 |
| S03 | 装配当前目标跟随 | 已修，根任务负责 | 跟随当前现场与显式锁定已由Shell owner分开；本域未单独复验跟随跨现场 | 最终浏览器跨现场投放需合并根任务证据 |
| S04 | 装配Drop、批量取用和逐项回执 | 保留，仅源码/单测 | 真实acquireDrop/applySources逐项成功与失败回执保留；取用按钮到Reader已验；批量drop未全验 | 跨来源多项混合失败的实际投放回合 |
| S05 | 装配集合跨视图取用 | 部分接通 | 跨视图进入/Portal与当前目标命令已有；装配入口已验，未验全套跨视图集合取用 | 页13所有replace/submit/引用语义需与根任务并表 |
| S06 | 专业窗口浮动、停靠和分组 | 已修拆组且浏览器验证 | 浮动/停靠/原单组命令保留；修复激活原宿主后无法拆出；窗口、revision、阅读位置和草稿不重建；真实图片+文本Reader：390合组/原宿主拆出/重组/再次拆出→1440两窗；4状态0pageerror | 六窗及所有分组组合未全量浏览器验证；S11双组独立列项 |
| S07 | 拖窗期间实时避让 | 已修，仅单测 | 拖动DOM位移时按rAF发布真实occupied rect；未另造占位状态；窗口总体布局已验，连续drag避让轨迹未专门录证 | 补拖动期间HUD避让录屏 |
| S08 | 窄屏与多窗布局 | 已修并浏览器验证 | 紧凑Stage单一active presentation，后台保留身份；窗口动作与tab保留；1440/1024/390三窗；正文可滚 | 六窗低高度压力仍待追加 |
| S09 | Reader身份、修订、只读与返回 | 保留并浏览器部分验证 | 精确Artifact/revision/FileRecord；readonly媒体；返回源入口保留；装配真实图片打开阅读/关闭；纯文本正文 | 更多历史修订切换与降级实际材料 |
| S10 | Reader实际内容缩放 | 已修，浏览器部分验证 | 文本zoom真实消费；图像只用现有Gen1ImageZoomStage，不叠加缩放；图片正文1440/1024/390可见 | 触控缩放与长文各倍率浏览器待补 |
| S11 | 双Reader与内容页签 | 可由原owner扩展；自动审批拒绝，待明确许可 | 12项纯拓扑/旧session迁移验证+单组只读兼容已落；生产store仍平面region，双组caller未接通；原单组拆合已实测；真实双组尚未实施 | 明确授权迁移原lcosShellStore区域模型后，补groups/actions、稳定正文宿主、ReaderGroupView真实调用与1440/1024/390验收；详见surfaces-S11-behavior-plan.md |
| S12 | 阅读位置恢复跨度 | 部分实现，跨刷新缺证 | 读位置属于现有内存UI state；没有证据证明持久化；本轮未证明刷新后恢复 | 禁止把内存恢复声称跨重启完整实现 |
| S13 | Reader媒体种类覆盖 | 已补PDF/视频/音频，部分缺证 | revision Blob→Huabu PDFPreview/VideoPreview；音频复用节点AudioSourceMorphology；fixture真实image/text通过；无PDF/video实物 | 网页/HTML完整安全Reader及真实PDF/视频浏览器材料待补 |
| S14 | Reader选区引用归属 | 已修，仅单测 | 引用只接受range两端位于当前Reader正文；跨窗选择不归入该材料；真实正文可读；跨窗selection未录屏 | 增加多窗文字选择实际回合 |
| S15 | Context真实现场、集合进入和返回 | 已修异步进入，仅根现场有浏览器证据 | 根目标等待原switchWorksite实际结果；成功才收光幕，失败/进行中不提前回报；真子仍沿原child helper；Context根入口无伪workspaceId/返回链/时间轨 | fixture仅根scope；真child往返未在本域实物浏览器验证 |
| S16 | Context光幕开合与注意力 | 已修并完成四宽度真实浏览器验证 | 真实画布上的临时光幕；原attention与还焦；新增只读HUD几何避让，窄屏搜索/关闭行sticky，桌面原位；320/390/1024/1440：1个底层Canvas；6命中状态searchHit/closeHit true、overlap false；关闭回入口；见第9批报告 | 复杂窗口与Navigator同时呼出的视觉边界待根整机验收 |
| S17 | Atlas分页与真实搜索 | 已修，分页故障注入浏览器验证 | 原useWarehouseBrowse query/cursor/retry；分页反馈位于保留集合之后，不再移动表征；首屏状态仍保留；真实搜索既有证据；隔离浏览器nextCursor/503注入：6个真实首项保留，加载/失败/重试Y均218；不是50+真实业务分页 | 超过50项的真实server分页浏览器未造数据；见surfaces-batch9-context-layers.md |
| S18 | Atlas时间/性质组织和邻域焦点 | 仍缺真实组织轴与邻域焦点 | Atlas只显示真实kind来源，organization保持未指定，未用updatedAt/kind硬编时间性质；光幕集合可见；未指定诚实呈现 | 需要organization/temporal canonical producer；Focus邻域语义未全接 |
| S19 | 集合文件夹旧白卡污染 | 已修并浏览器验证 | 准确文件夹+family选择器去外层白卡；保留folder face与family属性；不可用仅减弱材料，保留名称与真实原因可读；四宽度实际光幕6个scene，其中3个缺canvas明确不可用，无横溢出；第9批报告 | 仍可继续精修材质，但不是遗失caller |
| S20 | 集合合并、拆分、删除壳和拖用 | 待真实集合 command/capability owner；原卡/API/实际浏览器缺口已证实 | Atlas 保留真实 warehouse 与进入/定位；没有集合 merge/split/delete-shell 契约或 allowedActions，未造入口；surfaces-S20-atlas-current.png + surfaces-S20-command-gap.json；真实响应与按钮已核实，0pageerror | T6 成员事实 owner 尚缺集合命令能力、proposal/preview与保留成员的删除壳回执；详见surfaces-S20-collection-command-gap.md |
| S21 | 时间轨真实数据与定位 | 已修真实绑定范围/不可用说明/失效预览；真实child浏览器仍缺证 | 只消费当前bindingCanvasId匹配的真实映射；同canvas绑定变化或换canvas清旧hover；事实无投影说明原因；原wheel/多目标定位保留；只读全项目数据：无Context child；旧root?workspaceId探针退役，导航支线已验证root不再显示时间轨 | 真实Context child和多时间组浏览器完整回合；见surfaces-batch10-temporal-continuity.md |
| S22 | 时间轨范围与失败重试 | 已修，仅单测 | 限Context child；同索引失败retry/旧响应abort；新画布不误用旧nodeId；地址消失清旧partial回执；rootWorkspace显式URL已由导航支线归一且Temporal=0；真child失败恢复仍缺证 | child加载失败/恢复需实物数据 |
| S23 | Workflow真实现场与跨视图入口 | 部分接通且主层级已验证 | Main/Context/Workflow仍各自真实Worksite；Main现有Atlas+Hand对等入口；Context/Workflow切换、光幕/手牌覆盖现有canvas | 具体Workflow region topology仍缺明确owner事实 |
| S24 | 手牌空白关闭 | 已修并浏览器验证 | 手牌复用LightCurtainDismissPlane；空白不穿到画布；Esc保留；近预览→原卡→手牌原入口逐层返回焦点；手牌空白收回、单击预览、返回手牌、Esc；Main/Workflow两入口在1440/390均正确还焦 | 真实拖放跨遮罩完整回合由Drop专项补 |
| S25 | Workflow卡池分页与搜索 | 已修工作流专属数据源，真实搜索与只读压力验证 | 服务端kinds=workflow，搜索/分页原cursor透传；skills/material/receiver不混入手牌，保留其它原入口；分页不推移已有卡；真实1张workflow；搜技能名无结果、搜真实命中；实际请求带kinds=workflow；20workflow仅只读呈现模拟 | 50+真实workflow服务端分页和真实封面缺证；旧混skill证据已废止 |
| S26 | 手牌轻预览与区域/现场进入 | 已修轻预览/成功收牌，region仍缺真值 | 单击近卡预览；多workspace显式选择；成功进入通过现有HandOverlay收牌，失败保留预览原因；无可用画布保持禁用；返回预览或Esc还焦同一任务卡，可空格再次预览；preview/return/真实workspace菜单已验；fixture无可进入child，成功收牌只单测；1440/390的返回原卡已真实验证 | Workflow region定位和origin会话ID缺真实owner事实；真child往返需实际目标 |
| S27 | 取用到当前会话与续工 | 已修，真实工作流取用到草稿已验证 | Workflow真实entityRef identity加入现有会话引用草稿；缺接收者指向Glyth/会话入口；未发送；来源缺失禁用续接；真实卡点击用于当前会话→草稿中，提示已加入草稿尚未发送；无来源续接禁用。见workflow-near-preview-spatial-fix.md | 真实发送与外部续工交由根Composer/provider回合；不沿用已移除receiver lane证据 |
| S28 | 手牌扇形/网格和高数量密度 | 已修；1真实workflow手牌+20workflow只读压力模拟 | 少量真实workflow仍hand；6+或搜索采用pool；技能等其它物种不计入手牌密度；workflow-only-hand.png为1真实workflow；workflow-only-highcount-simulated.png为20workflow浏览器响应模拟，已撤销拦截恢复真数据 | 旧37张含17skill压力证据退役；真实高数量workflow/封面性能仍缺证 |
| S29 | 真实会话、继续/委派/分支和等待输入 | 已修呈现并浏览器验证 | 四种续工在Composer渐进确认；等待输入/review复用原receiver与Run；不造新会话；1440/390模式预览、折叠、Esc；四能力未探测诚实禁用 | 真实provider四模式成功创建/复核需对应能力，不造假结果 |
| S30 | 会话切换隔离与恢复入口 | 已修，部分浏览器验证 | body按window identity隔离；诊断abort旧读；恢复动作外露；recover_external用真实revision；工作窗恢复入口布局；非retryable有原窗恢复按钮 | 真实故障恢复回执需provider可用；本次snapshot不跨卸载持久化 |
| S31 | 结果回流、归档和恢复 | 保留并补恢复，仍缺部分视觉 | review/accept/reject/retry/restore真实机械保留；恢复字典与并发已修；当前fixture工作记录可见；未做真实采纳/拒绝 | 媒体对比与归档更精细视觉；实际review数据回合 |
| S32 | Portal、T7工具与历史专业页 | 部分实现/部分预留 | Portal真实六态与局部缩放保留；T7工具缺能力仍显式不可用；桌面项属预留；本域未做全部Portal状态浏览器 | 不能把桌面捕获/外部工具许可画成Web已可用 |

## 空间层级结论

三个独立 Worksite → 其上的光幕/手牌选择层 → 有真实目标的 child/region → Context child 内局部时间轨。呼出层始终不是现场本体。根scope不出现时间轨是正确行为。Workflow具体region还缺明确owner事实；不编造目标。

## 本次继续施工结果

- S26已补成功进入后收牌；失败或目标不可用保持手牌与反馈。
- S28已补生产task lane网格，高数量与搜索实测通过。
- S11双组Reader、S18组织语义、S20集合全命令、S26 region仍是实质剩余；细见各项，不用“已完成”掩盖。

完整路径和节点见 [JSON](./surfaces-current-status.json)。


第 8 批增量：S02 装配视觉密度、窄屏材料宽度、触屏遮挡已修，11 个浏览器状态完成。详见 [完整六字段报告](surfaces-batch8-assembly-density.md)。其余待补证项保持原记录。


S20 补证：集合合并/拆分/删除壳尚无可直接接入的真实命令能力，已核对最细原卡、最终 Figma、Core 路由与实际 Atlas。未加假入口。详见 [S20 六字段缺口报告](surfaces-S20-collection-command-gap.md)。

第9批 Context：根目标等待实际成功、分页状态保留空间位置、不可用目标诚实表征、搜索/关闭避让现有HUD已修。14文件51项、四宽度6命中状态通过。[完整六字段报告](surfaces-batch9-context-layers.md)。

第10批时间轨：真实当前画布绑定、目标不可用原因、同画布/跨画布失效hover已修；11文件43项通过，真实Context child仍缺证。[六字段报告](surfaces-batch10-temporal-continuity.md)。S25/27/28已按Workflow专属数据源更新，旧混skill压力证据退役。

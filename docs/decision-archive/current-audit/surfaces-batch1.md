# 专业窗口与 Context/Workflow 第一批修复

日期：2026-09-26。工作树：LCOS_GEN2_GUI_RECOVERY_20260926。不改 Core/backend/store，不推送。

## 采用依据
最终九面 + 页13；20260911《ContextWorkflow 原话回收与 FigmaT5 增量裁决》优先于旧V3。Context正文点击进入正确，不按旧HTML改回双击。
T4 Assembly 原卡要求真实 Warehouse cursor/search；专业窗口原卡 BP-02 要求拖动时连续发布同一 geometry；Narrow 使用单活跃区域/页签，不改变后台身份。

## 已施工
- 集合总览/手牌使用 canonical queryWarehouse：真实下一页、服务端搜索、去重、失败重试、旧请求取消；翻页失败保留已读内容。
- 手牌取用保留现有 Composer receiver；显式点会话才改接收者；仅入草稿不发送。
- 手牌复用光幕关闭层，空白收起且保持准确可访问名称；打开 Atlas/Hand 通知现有 canvas attention owner。
- 新文件夹组件重置旧 collection family 的白卡背景/边框/内边距/投影，不删除语义属性。
- Reader Markdown 缩放真正作用正文；图片保留 donor 自有缩放/平移/复位，移除无效重复缩放栏。
- Reader 选区必须全部位于当前正文，拒绝其它窗口或跨正文选区。
- 窗口拖动 rAF 发布现有 occupied rect；窄屏或区域放不下时用现有窗口页签切换，隐藏但不卸载后台 body，不合并/覆盖存储拓扑。

## 回归
最终 6 文件 41 测试通过，覆盖查询、分页、失败重试、请求隔离、引用归属、正文缩放、移动期间occupiedRects、窄屏切换与还原。tsc --noEmit 零错误；本批生产文件与新测试 ESLint 零错误；旧Reader测试文件保留两处既有 non-null assertion warning。diff --check 通过。

浏览器视觉验收由主代理在 5286 合并预览进行；本组不把单元测试当截图/手感完成。

## 未在本批施工
装配目标自动跟随、完整Reader媒体/分组接入、Atlas组织/合并拆分、工作流区域入口与轻预览、Work View异步竞态和恢复入口、T7缺caller仍按全量清单后续推进。图片缩放跨重开持久化没有新增。

## 本组原32项覆盖索引
1装配四来源/分页；2装配瀑布流/预览；3装配当前目标；4装配Drop回执；5集合跨视图取用；6窗口owner；7动态避让；8窄屏多窗；9Reader身份/返回；10真缩放；11双Reader页签；12阅读位；13媒体种类；14引用归属；15Context子现场；16光幕层级；17Atlas分页搜索；18Atlas组织焦点；19集合旧卡样式；20集合编辑动作；21时间轨真实数据；22时间轨范围/重试；23Workflow与Main入口；24手牌空白收起；25卡池分页；26卡预览/进入；27当前会话取用；28多卡密度；29Work View生产链；30会话竞态/恢复；31结果归档；32Portal/T7专业入口。

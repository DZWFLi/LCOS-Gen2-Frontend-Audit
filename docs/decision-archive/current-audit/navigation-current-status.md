# 导航与近场当前状态 · 2026-09-26

本表是施工后的现状，原始 `inventory-navigation.md/json` 不改。23 项均逐条收口，但不能把组件通过、真实浏览器通过、仍缺 producer 混成一个“完成”。

**采用顺序**：最终九面 + 04 共享组件 + 13 增量；旧页保留细节，原 T2/T3/T4 决定交互；最终纠正优先。

**本代理直接验证**：导航前三批18文件70项；Arc最初3文件26项；新增Drop及Arc合并回归10文件65项，tsc与diff检查通过（与前批有重叠，不累加）。根代理Launcher/HUD结果单独标明。

## 当前最该继续补的

- NAV20通用Drop：空白复制/普通集合缺canonical producer，跨空间矩阵未齐。
- NAV23项目系统能力入口仍缺生产caller。
- NAV18/19整个Composer接收面、跨宿主草稿、语音正式通道需继续。
- NAV12/14/15/16浮标高密/自定义与真实Rail数据持久验收。
- NAV17小缩放原生连接handle与Glyth碰撞。

## 23 项逐条状态

### NAV-01 · 项目启动器：真实项目封面、最近/全部/归档

**部分已修；根代理浏览器验收**

已落地：
- 启动器接真实项目预览；无图时保留诚实占位；长标题和卡片比例已调整。

尚未完成 / 尚未实证：
- 归档设计入口尚未出现；需核实真实归档 API 后接，不能用假分组代替。
- 空库/读取失败/持久重载本代理未重跑。

设计状态：读取中、空项目库、正常列表、搜索结果、无结果、最近、全部、归档、长标题、读取失败/重试、进入项目。

采用节点：[5388:3652](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-3652)、[5122:1806](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5122-1806)、[5046:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-49)、[5046:50](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-50)。

证据：[launcher-1440.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/launcher-1440.png)。

### NAV-02 · 项目创建/打开、键盘与焦点

**主要入口已修；根代理浏览器验收**

已落地：
- 创建/打开用原能力；焦点锁定/返回、Esc、Enter、disabled提交和320px弹窗已由根代理验证。

尚未完成 / 尚未实证：
- 目录权限失败、恢复分支仍需真实桌面环境补验。

设计状态：创建弹窗、打开目录、提交中、路径/名称错误、取消、焦点、disabled、recovery。

采用节点：[5388:3652](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-3652)、[5046:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-49)、[5046:72](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-72)。

证据：[launcher-dialog-320.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/launcher-dialog-320.png)。

### NAV-03 · 主画布/上下文/工作流共享壳与材质

**部分已修；多域共同验收**

已落地：
- 三面保持同一个Shell；项目身份簇24px、截断标题、装配入口及底部Dock继续沿现有owner。

尚未完成 / 尚未实证：
- 整套Context/Workflow及源窗视觉采用由对应域报告负责，导航修复不等于九面已统一。
- 浏览器200%与系统高对比度仍待验。

设计状态：主画布、上下文、工作流、场景切换、空场景、加载/错误、悬浮窗并存、不同屏幕宽度。

采用节点：[5388:96](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-96)、[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696)、[5386:211](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-211)、[5386:286](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-286)、[5386:361](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-361)、[5235:50](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5235-50)。

证据：[navigation-1440.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-1440.png)、[hud-narrow-390.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/hud-narrow-390.png)。

### NAV-04 · HUD缩放、resize、窗口避让

**已修核心冲突；浏览器通过**

已落地：
- useHudViewport订阅resize；搜索/Where/Pin和相机复用HUD几何；自由窗使用原occupiedRect；HUD之间同一avoidSelector避让。
- 根代理补320/390/640/1440搜索岛和底Dock真实点击。

尚未完成 / 尚未实证：
- 所有安全区同时被占满时的退让/不可见提示尚未专项验收。
- 浏览器200%未完成。

设计状态：resize、浏览器缩放、自由窗口、贴边窗口、左右停靠、底部操作区、窄屏。

采用节点：[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696)、[5386:211](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-211)、[5051:3599](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5051-3599)、[5051:3776](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5051-3776)。

证据：[navigation-1024.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-1024.png)、[navigation-search-window-avoidance.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-search-window-avoidance.png)、[hud-narrow-390.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/hud-narrow-390.png)。

### NAV-05 · 底部常驻三视图 Dock

**已修；浏览器通过**

已落地：
- Main/Context/Workflow三常驻与左Rail分离；保留真实switchWorksite；窄屏避开右下空间按钮。

尚未完成 / 尚未实证：
- 跨子现场三面返回链全组合仍需矩阵验收。

设计状态：主画布active、上下文active、工作流active、hover提示、keyboard focus、停靠避让。

采用节点：[5386:211](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-211)、[5386:286](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-286)、[5386:361](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-361)、[5137:61](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5137-61)、[5137:81](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5137-81)、[5137:99](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5137-99)。

证据：[hud-narrow-390.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/hud-narrow-390.png)、[navigation-main-atlas-root.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-main-atlas-root.png)。

### NAV-06 · 灵动岛：静息、按Pin增长、搜索展开

**主要结构已修；浏览器+组件通过**

已落地：
- 无Pin仅52×48搜索键；有Pin随数量增长，按空间折入+N；不常驻创建+号。
- 搜索/Where/Pin共用一个presentation槽，401/402px设计按窄屏可用宽适配。

尚未完成 / 尚未实证：
- 原设计增长/收拢连续变形的运动细节仍未全量匹配。
- loading/error/degraded逐态视觉尚非全覆盖。

设计状态：无Pin52×48、一个/多个Pin、搜索402×48、折叠、Pin溢出、hover、pressed、focus、disabled、loading、error、degraded、selected。

采用节点：[5384:247](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-247)、[5384:306](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-306)、[5384:366](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-366)、[5139:1571](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5139-1571)。

证据：[navigation-1440.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-1440.png)、[navigation-1024.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-1024.png)。

### NAV-07 · 搜索→位置解析→子现场/多投影

**已接准确位置；部分浏览器、复杂情况仅测试**

已落地：
- Core Search保留真实entity/view；完整SqliteBindingStore.list + workspaces形成位置候选；不使用locationRefs[0]猜位置。
- childworkspace identity与exact spatialId/canvasId贯穿switchWorksite和locate。
- CoreSearch没有cursor/offset/nextCursor；按truncated展示还有结果并建议缩小范围，不伪造分页。

尚未完成 / 尚未实证：
- 真实fixture尚无多处投影+嵌套child实例，现有测试证明传参与分流，不冒称端到端。
- 不可访问/结果删除中途失效需实测。

设计状态：空查询、加载、命中本地、命中远端、多个occurrence、子现场、无位置、不可访问、过期结果、失败重试。

采用节点：[5046:57](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5046-57)、[5101:590](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-590)、[5139:1571](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5139-1571)。

证据：[navigation-third-batch-qa.json](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-third-batch-qa.json)、[navigation-main-atlas-root.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-main-atlas-root.png)。

### NAV-08 · 搜索键盘和局部查找归属

**已修；组件+浏览器通过**

已落地：
- 全局Ctrl/Cmd+F尊重编辑器/阅读器局部查找；IME composition不误提交；方向键/Enter和combobox语义已接。
- Esc仅关闭当前导航层，保留已有窗口和选择。

尚未完成 / 尚未实证：
- 真实IME输入法与辅助技术读屏仍需设备验收。

设计状态：Ctrl/Cmd+F、输入中文、方向键候选、Enter、Esc、结果焦点、读源局部搜索。

采用节点：[5384:366](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-366)、[5295:2982](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5295-2982)、[5304:3646](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5304-3646)。

证据：[navigation-search-window-avoidance.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-search-window-avoidance.png)。

### NAV-09 · 已知对象的在哪里/聚焦

**已修精确身份；复杂场景仅组件测试**

已落地：
- Where与Search共用位置解析；真实child不归根，root普通目标不伪造子现场返回链。
- locate支持preserveSelection，不偷换选择。

尚未完成 / 尚未实证：
- 真实多投影/子现场返回到发起处仍需可用fixture补测。

设计状态：当前投影、同场多个投影、其他根面、子现场、无空间位置、loading/error、返回发起处。

采用节点：[5101:724](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-724)、[5153:774](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-774)、[5164:831](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5164-831)。

证据：[navigation-main-atlas-root.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-main-atlas-root.png)、[navigation-third-batch-qa.json](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-third-batch-qa.json)。

### NAV-10 · Search/Where/Pin同槽和Esc栈

**同槽已修；已验常用Esc路径**

已落地：
- NavigationHudSlot只仲裁none/search/where/pin；原业务owner不变；More先Esc，其他层检查defaultPrevented。

尚未完成 / 尚未实证：
- 所有专业窗口内搜索、嵌套Tooltip/More/Composer组合仍未穷举。

设计状态：none、search、focus/where、pin、嵌套more、返回上一层。

采用节点：[5384:367](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-367)、[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696)、[5139:1571](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5139-1571)、[5187:683](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-683)。

证据：[navigation-search-window-avoidance.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-search-window-avoidance.png)、[arc-more-open-qa.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-more-open-qa.png)。

### NAV-11 · ColorPin分组、节点本地角标、身份连续

**主要接口已修；浏览器+组件通过**

已落地：
- 节点角标由节点组接existing membershipsByTargetKey/definitions；岛和离屏定位同一个精确target key。
- Pin成员用live image真实投影缩略图；缺图用类型glyph，不猜Asset URL、不把view改成entity。

尚未完成 / 尚未实证：
- 跨全部节点物种、多Pin、删除中途失效与自定义形状持久化尚未完整验收。

设计状态：创建/命名、选择颜色、加入/移出、多Pin对象、无成员、成员失效、本地角标、远端定位。

采用节点：[5101:456](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-456)、[5153:540](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-540)、[5204:13457](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-13457)、[5384:306](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5384-306)。

证据：[navigation-pin-real-preview.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-pin-real-preview.png)、[navigation-locator-offscreen.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-locator-offscreen.png)。

### NAV-12 · 画外动态浮标：出现、变形、点击直达、到达

**真实可点击已修；运动形态仍有差距**

已落地：
- 从真实Pin membership+当前RF几何派生离屏目标；浮标可主动点击，单击沿existing locate直达且保留选择。
- local时节点角标承担身份，近边/边缘/到达和reduced-motion沿现有导航机。

尚未完成 / 尚未实证：
- 高密多浮标碰撞、可自定义精致轮廓、贴物种的到达辉光仍需视觉补齐。
- 不能把现有圆形到达环称为全物种轮廓实现。

设计状态：LOCAL、NEAR_EDGE、EDGE、TRAVELLING、ARRIVING、HIDDEN、UNAVAILABLE、reduced-motion。

采用节点：[5101:724](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-724)、[5153:774](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-774)、[5164:831](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5164-831)、[5204:14182](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5204-14182)。

证据：[navigation-locator-offscreen.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-locator-offscreen.png)、[navigation-locator-arrived.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-locator-arrived.png)。

### NAV-13 · 相机胶囊、适配视野、100%与减弱运动

**核心相机已修；浏览器通过**

已落地：
- 100%保持当前世界中心，实测中心漂移0.00039world units；fit使用真实节点bounds与安全区域；减弱运动服从系统设置。
- 折叠/展开入口和现有相机动作共用原RF实例。

尚未完成 / 尚未实证：
- 网格/锁定/小地图等原设计项不因此宣称齐全；Pass4 MiniMap仍明确排除。
- 全遮挡情况下fit反馈未专项实现。

设计状态：折叠、展开、放大、缩小、100%、适配内容、网格、锁定、小地图开关。

采用节点：[5386:274](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-274)、[5191:1292](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5191-1292)、[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696)。

证据：[navigation-fit-window-safe.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-fit-window-safe.png)、[navigation-window-avoidance.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-window-avoidance.png)。

### NAV-14 · Railway长度、图标底座、溢出、身份

**代码已接；Rail真数据浏览器缺证**

已落地：
- Rail按显式canonical orderedRefs数量hug；+N溢出；图标小底座与底HUD分开。
- 接收者使用现有Glyth头像+中文真实协作状态，沿共享SSE更新。

尚未完成 / 尚未实证：
- 当前fixture无显式Rail orderedRefs/接收者绑定；未造数据刷截图，0/1/4/20真实数据矩阵仍待验。
- 自定义glyph/形状持久化未全补。

设计状态：0/1/4/20成员、active、hover、+N、管理、接收者、glyph/颜色身份。

采用节点：[5385:255](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5385-255)、[5385:282](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5385-282)、[5101:189](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-189)、[5106:1715](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5106-1715)、[5163:843](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-843)、[5163:863](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-863)、[5163:881](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-881)、[5163:895](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-895)、[5163:909](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-909)。

证据：[navigation-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-implementation.md)。

### NAV-15 · Railway悬停真预览、可进入操作区

**代码+组件通过；真Rail浏览器缺证**

已落地：
- 真Peek复用useSpacePreviewScene→只读SVG，不新建Canvas；loading/stale/error/unavailable如实呈现。
- Peek不被Rail滚动clip，hover延迟让指针进入，键盘可打开管理。

尚未完成 / 尚未实证：
- 真实混合媒体场景preview质量、stale更新与键盘跨区域仍缺浏览器证据。

设计状态：rest、peek loading、真空间预览、stale、partial、unavailable、指针跨入peek、keyboard focus。

采用节点：[5101:189](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-189)、[5153:309](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5153-309)、[5163:843](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5163-843)。

证据：[navigation-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-implementation.md)。

### NAV-16 · Railway接收、排序、管理的可操作性

**代码+组件通过；真实失败部分已补**

已落地：
- 主轨与+N菜单同等管理/移除/上下移；继续现有canonicalCAS，409重读后再解锁。
- drop接收仍经Assembly；共享SSE和focus/visibility刷新，没有第二EventSource。
- NAV21已补逐项回执+失败子集重试。

尚未完成 / 尚未实证：
- 无真实Rail排序数据，本批只能说明handler/CAS/SSE组件回归，不声明已持久验收。

设计状态：拖动接收、允许/拒绝、提交中、失败、排序、冲突重读、移除、键盘上移下移。

采用节点：[5101:322](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5101-322)、[5106:1715](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5106-1715)、[5187:179](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-179)、[5347:1089](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5347-1089)。

证据：[navigation-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-implementation.md)、[navigation-third-batch-qa.json](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-third-batch-qa.json)。

### NAV-17 · Arc角包、更多菜单与多窗口共存

**已修核心命中与初载；浏览器+组件通过**

已落地：
- Arc与专业窗口共存；透明82×82空隙click-through；可点热区44px，视觉orb30px；More独立同anchor浮层。
- 局部最多48px避邻近真实控件；实测原More压Glyth→上移41px留4.29px空隙；开More不改相机。
- disabled真实Tooltip+aria-description；初次binding未就绪时不挂Arc/右键入口；ready空表允许自由节点。

尚未完成 / 尚未实证：
- 360px缩放下原生创建连接节点handle仍可能盖住Glyth（已报根代理，不属Arc修复）。
- 嵌套节点、混合未支持native节点的全命令尚未完全对齐。

设计状态：单选、多选、hover、3个主操作/最多4、more、上下文菜单、对象锁定、窗口并存、安全区翻转。

采用节点：[5202:58](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5202-58)、[5226:1128](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5226-1128)、[5186:49](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-49)、[5186:312](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5186-312)、[5187:683](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-683)。

证据：[arc-hit-avoidance-qa.json](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-hit-avoidance-qa.json)、[arc-after-local-avoidance.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-after-local-avoidance.png)、[arc-more-open-qa.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-more-open-qa.png)、[arc-360-more.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-360-more.png)、[arc-glyth-real-open.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-glyth-real-open.png)。

### NAV-18 · Composer引用条和工具按钮生产接线

**根代理在修；部分已验**

已落地：
- 真实图片引用、单项移除、@选择、附件打开原Assembly、接收者身份已接生产Host；13项@键盘回归由根代理通过。

尚未完成 / 尚未实证：
- Composer整个气泡的Drop命中仍需确认；此前生产target只注册textarea。
- 不可用引用、长文滚动、跨窗口promote后草稿连续需根代理最终矩阵。

设计状态：空草稿、2-4行增长、长文滚动、引用缩略图、预览、移除单引用、不可用引用、附件、receiver、提交中、失败恢复、窄屏、键盘。

采用节点：[5043:102](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5043-102)、[5229:1489](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5229-1489)、[5229:1753](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5229-1753)、[5283:890](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5283-890)、[5289:6378](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5289-6378)、[5295:2982](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5295-2982)、[5304:3646](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5304-3646)。

证据：[drop-real-reference-receipt.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/drop-real-reference-receipt.png)。

### NAV-19 · 近场输入定位、多窗口、语音状态

**近场归属已修；语音仍缺真实owner**

已落地：
- 只对实际拥有同一Composer intent的可见窗口让位，普通Assembly/Reader不再把近场输入整体隐藏。
- Glyth Drop通过真实target几何/RF反算近场anchor，去掉0,0硬编码。

尚未完成 / 尚未实证：
- Core语音转写生产入口未落；不能把Web Speech helper当成正式能力。
- 同草稿跨宿主提升/降回和窗口关闭边界由根代理继续验收。

设计状态：被动草稿、活跃输入、提升工作窗、返回近场、点击外部、Esc、录音/转写/错误。

采用节点：[5246:59](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5246-59)、[5280:669](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5280-669)、[5295:2982](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5295-2982)、[5300:3632](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5300-3632)。

证据：[drop-real-reference-receipt.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/drop-real-reference-receipt.png)。

### NAV-20 · 通用Drop来源：画布节点、右拖携带、装配

**基础已接；通用覆盖远未齐全**

已落地：
- 根代理接node-carry/左拖给予入口：原源不移动、原生移动保留；右键未越阈值仍是右键菜单。
- 已真实右拖现有节点到Glyth，引用进入原Composer；Assembly来源继续真实canonical ref。

尚未完成 / 尚未实证：
- 空白处新occurrence、普通集合接收的真实canonical producer缺口未补，当前明确拒绝，不伪造复制。
- 物理跨空间、集合/Portal/skill全部目标矩阵尚未齐全。

设计状态：原生移动、左拖给予、右拖携带、远端给予、物理跨空间、取消、无效目标、跨窗口。

采用节点：[5187:179](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-179)、[5187:431](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-431)、[5188:1132](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-1132)、[5347:1089](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5347-1089)。

证据：[drop-real-reference-preview.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/drop-real-reference-preview.png)、[drop-real-reference-receipt.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/drop-real-reference-receipt.png)。

### NAV-21 · Drop接收反馈、真实回执、Glyth输入锚点

**回执已修；HTTP+caller测试，部分真实浏览器**

已落地：
- 原Bug已坐实并修：HTTP200不再等于全部成功；逐项applied/already/failed/unsupported显示。
- 只重试明确failed且非unsupported的原sourceRef；保留原target/placement；多次重试累积显示已成功结果，绝不回滚/重跑成功项。
- 未知回执/网络异常不盲重试；旧transaction不覆盖新手势；换项目清理本次反馈。
- 同Host显示轻量提交/结果反馈，真实Glyth引用投放已截图。

尚未完成 / 尚未实证：
- 真实fixture缺可自然触发多项partial的交互路径，本次partial/重试为真实HTTP facade+production component模拟，不是后端实录。
- 全物种接收材质/到达回弹仍不是完整实现。

设计状态：候选目标、允许/拒绝、commit中、accepted、partial、failed、取消、到达回弹、减弱运动。

采用节点：[5187:431](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5187-431)、[5188:1132](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5188-1132)、[5262:551](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-551)、[5262:807](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-807)、[5262:1078](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-1078)、[5353:2263](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5353-2263)。

证据：[drop-real-reference-preview.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/drop-real-reference-preview.png)、[drop-real-reference-receipt.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/drop-real-reference-receipt.png)、[navigation-drop-receipt-implementation.md](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-drop-receipt-implementation.md)。

### NAV-22 · 共享反馈、disabled、长文与运动族

**局部已修；跨族待统一**

已落地：
- 导航/Drop玻璃轻反馈、原Rail工程文字、真实disabled原因、常用keyboard focus和减弱运动已局部统一。

尚未完成 / 尚未实证：
- 各页loading/empty/error/recovery全态未全部拍实证。
- 不宣称已做全套动态材质/每种节点轮廓的focus或运行辉光。

设计状态：loading、empty、normal、focus、disabled、error、recovery、motion-reduced。

采用节点：[5391:322](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-322)、[5391:327](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-327)、[5391:332](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-332)、[5391:337](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-337)、[5391:342](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-342)、[5391:347](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-347)、[5391:352](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5391-352)、[5262:551](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-551)、[5262:807](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-807)、[5262:1078](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5262-1078)。

证据：[arc-more-open-qa.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/arc-more-open-qa.png)、[navigation-pin-real-preview.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-pin-real-preview.png)。

### NAV-23 · 项目级系统入口与能力不被视觉隐藏

**仍有明确入口缺口**

已落地：
- 退出到项目库、三面切换、接收者现有入口保留；Main Atlas root/child分流已经修正。

尚未完成 / 尚未实证：
- 项目系统菜单/RuntimeDoctor/CurrentReceiver等5306设计尚未找到完整生产caller；ProfessionalStage部分工具仍此工具当前不可用。
- 应核实能力后接到既有工具，不能为视觉补空壳按钮。

设计状态：项目菜单、设置/运行诊断入口、当前接收者、退出到项目库、工作现场返回。

采用节点：[5306:4074](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5306-4074)、[5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696)。

证据：[navigation-main-atlas-root.png](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/navigation-main-atlas-root.png)。

## 验证边界

- 当前隔离fixture没有显式Rail orderedRefs或activeReceiver绑定，没有为通过测试造canonical数据。
- 搜索接口没有cursor；已显示truncated，不造“下一页”。
- Pass4 MiniMap遵循原排除范围。
- 未改Core后端、未引入第二套Canvas/Camera/Navigation状态、未自动push。
- 多种离线/权限/跨项目真实异常仍需最终验收；本表保留缺口，不把截图和data-figma标签当完成凭证。

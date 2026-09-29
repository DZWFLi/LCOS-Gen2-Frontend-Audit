# Reader 近场工具与正文层级施工回传（2026-09-29）

结论：Reader 已把缩放/版本切换收进正文前的紧凑工具区，阅读内容仍占主视觉；引用、摘录、对比和回来源留在正文后，贴近设计底部动作位。没有改 Assembly，因为当前源码已有真媒体预览与响应式瀑布流，现有证据不足以证明需要改布局；缺的是仓库真实材料下的视觉验收，不该靠造素材“补图”。

依据：采用版 Reader 主视觉 **Figma 5388:27411**、规格 **5392:6127**（[统一交付说明](</E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_Figma_全设计包_20260913/LCOS_Figma_九面视觉统一收口交付_20260913.md>)；[Reader设计图](</E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/reader-verified.png>)）。设计图把双组标签放在正文上方，把“合回同一窗口/拆出这一组”放在正文底部；窄宽规格也要求正文不被压扁。旧实测图 [Reader修改前](</E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/surfaces-reader-image.png>) 显示 Reader controls 堆在媒体后，和文本缩放/历史 revision 的位置关系不清晰。

改动：
- [ArtifactReaderBody.tsx](</E:/TRAE项目/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/professional/ArtifactReaderBody.tsx:469>)：将正文缩放和 revision 切换组合进正文前工具区；正文之后保留“加入引用/摘录/对比/回到来源”，不改变其 owner、语义或请求身份。
- [professional-reading.css](</E:/TRAE项目/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/professional/professional-reading.css:83>)：增加工具区分隔、间距和 revision 行限高/滚动，让密集版本仍留在 Reader 近场，不挤正文。

Assembly 源码核验：`AssemblyBody` → `AssemblyMasonryView` 当前以真实 preview URL/aspect ratio 渲染卡片；样式有 248px 瀑布列、间距和窄屏单列，素材卡复用既有 Context/Workflow/文档视图。未观察到明确生产 GUI 差距，因此没有为满足“有改动”而调整密度。真实仓库材料可读性、素材占比、应用回执仍缺浏览器现场验收。

验证：仅运行 `npx vitest run src/lcos/professional/ArtifactReaderBody.test.tsx`，25/25 通过。它验证组件行为，不代表浏览器视觉实测。

截图边界：暂无修改后截图。T6/T7 确认其 Node REPL 没有可复用 page/context，Chrome 也没有 9222/9223 CDP 监听；按“不另启服务/浏览器”约束，本次不伪造 after 图。旧截图只作为修改前佐证，修改后视觉仍待用现有真实页面验收。

剩余：Reader 修改后窄高窗口下正文与底部动作是否同时可达；真实 Reader 文本/媒体、Assembly 实材密度与 apply receipt 浏览器验收。未把组件测试当实测。

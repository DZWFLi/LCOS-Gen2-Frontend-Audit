# 音频中景波形与旧 Note 宿主间距修复 · 20260927

结论：音频首次中景终于使用真实解码波形，近景回来不会凭空多出一截内容；文本与音频也不再被旧 Note 宿主四边8px挤小。本项经过真实浏览器复现后修复，未修改相机、原节点几何、Core或导航。

## 原始要求与裁决

- 原件 `E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/core_plans/MD1_画布与对象基础层_源码对应审计_20260903.md` §T5 明确“音频像波形…保留无法替代的形态差异”。
- T1 原件 `references/original_route_cards/T1/LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md` §14.2 保持唯一 LOD owner。没有找到 summary 应只剩播放条的原件要求，因此没有保留一度试写的“隐藏缓存波形”方案。
- Figma `nFUdroLvI5qJZuYTW8h2rF`，Main 5388:96，音频5388:121–185、文本5388:102；已查看 `.../_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/main-final.png`。

## 两个确证问题

1. **波形取决于缩放历史**：真实生产 AudioSourceMorphology，使用项目中真实38秒WAV。首次summary有0条波形，播放控件Y=220；进入working解码后返回summary有64条、控件Y=270。相同density相同材料，布局相差50px。
2. **祖先旧壳吞掉真实面积**：NoteNode无条件套 `NOTE_CONTENT_HOST_CLASS='flex flex-col rounded p-2'`。文本presentation为385×142、实际body369×126；音频171×96、实际155×80。之前只看species-body的padding:0遗漏了更外祖先，旧报告已明确纠正。

## 实际改动

- 非mark音频通过 Huabu 现有 `useDeferredHydration` 排队后解码，summary与working/reading共享原peaks与原audio元素；mark不发起解码。Canvas现有 `onlyRenderVisibleElements` 保留，未遍历全画布或建立第二加载系统。
- 非mark预留波形槽；高度按当前世界高度扣除真实播放控件和caption行高，最高仍50px。没有制造任何声波，实际解码失败仍保留真实播放器。
- NoteNode仅在 `chromeMode==='lcos' && BodyOverride!==undefined` 时去掉旧p-2。当前生产唯一resolver为 createLcosNodePresentationSeam；同样测试了非LCOS的其它override仍保留原padding。原生Milkdown/offscreen测高共享常量未改。
- 音频控件加明确group语义，真实播放/进度/事件隔离保持。

## 验证

- 冷启动真实Main页面：summary已解码64条，native metadata为38秒，实际源为同一项目WAV，无Figma示意波形灌入。
- 真实组件独立浏览器往返：首次summary和working→summary均64条，控件Y均270，布局一致。这里使用真实媒体，不是AudioContext mock。
- 原生生产测量：文本body恢复385×142，音频恢复171×96，祖先padding均0，音频caption完全位于宿主边界内。
- 4文件13项针对性单测通过：音频mark不解码、summary首次解码、往返只解码一次且保留播放器；原生播放与失败重试；NoteNode LCOS接管/非LCOS override/原生正文回退；TextNode既有三路径。
- 测试中的解码函数为模拟，只验证调度与复用；真实WAV由浏览器验证补齐。不以模拟测试冒充外部provider或媒体生产测试。

## 六字段

- READ_SOURCE：以上原始MD/T1/Figma与 AudioSourceMorphology、AudioSourceView、NoteNode、nodeBodySlot、chromeModeSlot、nodeHydrationScheduler、Canvas.tsx:onlyRenderVisibleElements。
- ADOPTED：Huabu既有hydration调度 → AudioSourceMorphology；既有LCOS BodyOverride / chromeMode → NoteNode无卡壳内容宿主 → LcosSpeciesBodies真实source caller。
- VISUAL_SOURCE：Main5388:96、音频5388:121、文本5388:102。
- RETIRED：summary仅等待曾访问近景才拿波形；LCOS接管后仍套原生p-2。原生note样式和owner未退役。
- VERIFIED：真实Main与真实音频组件往返、尺寸测量、13项回归；见以下截图。
- UNRESOLVED：大型长音频首次summary仍需整文件解码（现有decodeAudioData边界），本次没有增加后端波形服务或持久波形缓存；大量同屏长音频的解码并发/内存尚未压力验证。现有fixture样本几乎静音，所以真实波形接近平线，不拿宣传波形伪装。mark的独立声音物种标记与更完整可访问性仍非本项全量验收。

## 改动与证据

- `huabu/apps/web/src/lcos/nodes/source/AudioSourceMorphology.tsx`
- `huabu/apps/web/src/lcos/ui/source/AudioSourceView.tsx`
- `huabu/apps/web/src/components/Nodes/note/NoteNode.tsx`
- `huabu/apps/web/src/lcos/nodes/source/SourceMediaBehavior.test.tsx`
- `huabu/apps/web/src/components/Nodes/note/NoteNode.lcosBody.test.tsx`
- [初次summary修前](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/audio-summary-cold-before.png)
- [近景后summary修前](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/audio-summary-warm-before.png)
- [修后相同布局](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/audio-summary-stable-fixed.png)
- [修后实际Main](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/audio-summary-production-fixed.png)

未commit/push；不是整套Figma视觉闭环声明。
补充检查：本批5个改动源码/测试文件 ESLint 0 errors（18条既有/测试非空断言 warnings）；最终事件隔离调整后4文件13测试再次通过；git diff --check通过。未单独运行全量tsc，由根任务汇总验证。

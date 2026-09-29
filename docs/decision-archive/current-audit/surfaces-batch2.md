# 专业窗口、上下文、工作流：第二批实修

日期：2026-09-26。工作树：`LCOS_GEN2_GUI_RECOVERY_20260926`。本批在已盘点的真实 caller 上修正入口与交互，未改 Core、backend 或 canonical store，也没有新增窗口、导航、会话 owner。

## 已修

| 功能 | 实际变化 | 主要源码 |
|---|---|---|
| 子现场时间轨 | 仅子现场显示；读取失败可重试同一目标；旧子现场响应不能覆盖新目标 | `surfaces/context/ContextWorksite.tsx`、`TemporalRail.tsx` |
| 工作流手牌预览 | 近场预览分开「用于当前会话」「打开工作流现场」「续接原会话」「返回手牌」；Escape 返回；保留原 Enter/双击进入语义 | `ui/workflow/WorkflowTaskCardView.tsx`、`surfaces/workflow/WorkflowCardPool.tsx` |
| 真实来源约束 | 取用沿用当前真实 receiver；数据没有原会话 ID 时，续接保持不可用并说明原因，没有借当前会话伪造来源 | 同上 |
| Reader 媒体 | 按选定 revision 的真实 FileRecord 字节生成 Blob URL；复用 Huabu PDF/视频渲染及节点组实际音频播放器；历史版本不会误用当前画布缩略图；离开时回收 URL | `professional/ArtifactReaderBody.tsx`、`ui/professional/ReaderContentView.tsx` |
| Reader 只读 | PDF 不传画布 nodeId 或写回函数，关闭有画布写入能力的 header slot；Markdown 保留实际缩放；媒体使用各自成熟播放器 | 同上 |
| 专业窗口切换 | body 按 projectId+windowId 区分，避免组内切换复用上一个窗口的局部状态 | `professional/ProfessionalWindowStage.tsx` |
| Work View 异步与恢复 | 切换会话取消诊断读取并忽略旧响应；真实可执行恢复操作直接显示在主区，诊断区不再重复 | `professional/ConversationWorkViewBody.tsx` |
| 等待用户输入 | 请求失败可重试；切换会话取消旧读取、清空旧问题；旧提交结果不能回写新会话；重复提交受限；选择状态有 aria-pressed | `professional/WaitingInputSection.tsx` |

## 验证

- 第二批相关 6 文件曾完整通过 49 项测试；随后修正与真实 TypeScript contract 不一致的 3 处测试/筛选类型，受影响的 3 文件 30 项再次通过。
- 完整 `pnpm exec tsc --noEmit --pretty false`：通过，无报错。
- 第一批此前通过 6 文件 41 项；包括真实分页、搜索/重试、当前 receiver、选区引用、实际缩放、窗口窄屏与拖动避让。
- `git diff --check` 无 whitespace error。浏览器视觉/动效和多媒体实际加载仍由根任务隔离预览统一验收；本报告不把单元测试当作已完成视觉验收。

## 未宣称完成

- 工作流区域进入仍依赖当前已有唯一子现场映射，完整区域解析需要继续接原 owner；无 origin ID 的原会话续接不伪造。
- 装配当前目标跟随、ReaderGroup 生产接入、阅读位置跨关闭持久化、上下文真实组织字段、集合完整编辑/drop 命令、高数量手牌布局仍在全量盘点待办。
- PDF/音视频组件复用了真实渲染，但其跨宿主联动与完整浏览器行为尚未作截图/录屏验收。
- P1 桌面捕获/运行能力依设计属于预留项，没有为填满画面增设 Web 假能力。

## 设计覆盖补证

另见 `inventory-surfaces-coverage-supplement.json`：71 个待关联顶层 Frame 已逐个核对本地导出结构并关联功能项；保留历史稿、后续纠正、待实现、数据缺失和桌面预留的区别。全局采纳说明 `5409:2` 由根任务合并。页 13 的引用/替换/提交状态跨 Composer，交由唯一 owner 统一处理。

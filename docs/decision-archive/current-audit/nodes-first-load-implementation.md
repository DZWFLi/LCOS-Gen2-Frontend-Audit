# 节点首屏投影加载修复

日期：2026-09-26。工作树：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926`。只处理现有前端呈现缓存生命周期，不改Core、数据库绑定真值、画布几何或相机。

## 结论

原生白卡闪现不是样式没加载，而是Huabu节点先出现、真实ProjectionBinding后出现。实测两者差158ms。现在在唯一CanvasHostBoundary接原有skeleton：首次身份未返回时遮住该Canvas；身份一到立即放开，已经确认身份但描述未到的材料显示节点骨架。原生自由节点在成功空列表后立即恢复，不会被永久假装成LCOS材料。

这批不等于N01–N41全完成。逐项结果在[nodes-current-status.md](./nodes-current-status.md)及对应JSON。

## 根因与原路径

- `LcosWorksiteStage`等Huabu canvasStore载入后挂`CanvasHostBoundary`。
- `useLcosCanvasProps`原来直到reconcile、listNodeBindings全完成才逐项写nodeEntityRefs；此前seam把全部节点当未绑定自由节点走native fallback。
- 网络与描述读取并非原子；CSS或固定延时无法判断谁是真正自由节点。
- 修复前实际10节点：1123ms全native；1281ms真实身份可用；1688ms描述可用。158ms是这次样本间隔，不宣称固定常数。

## 实际改动

1. `useLcosCanvasProps.tsx`：先沿已有`host.bindings.list()`读取canonical身份；过滤精确project/canvas/spatialKind。原reconcile随后继续完整描述和真实字节落成。两段均以当前runtime、project、canvas和effect active检查迟到结果；重试取消旧effect写入，不串项目。
2. `lcosReferenceState.ts`：在原呈现缓存新增读取阶段、当前canvas、首次身份成功标志和重试版本。早读只保留同entityType/entityId的旧descriptor；最终列表原子替换，删除/重投影不会残留旧映射。没有新增第二业务owner或持久contract。
3. `CanvasHostBoundary.tsx`：仅首次身份未成功时显示原skeleton，Canvas保持挂载和测量；该层visibility隐藏、opacity归零、inert且shortcutsDisabled。ReactFlow部分子元素显式visibility:visible，因此不能仅靠父层visibility。未增加延时遮罩。
4. 读取失败使用明确原因与“重新读取”，不会转回错误的原生编辑。当前Canvas没有能覆盖全部命令的只读prop，因此不伪称一个锁就是完整只读；用户可以重试或切换现场。
5. `BoundNodeLoadingBody.tsx`及seam：只有已确认artifact/scope身份而无descriptor才显示对象骨架；失败/最终仍缺描述给出对象内容暂不可用和同owner重试。未绑定节点仍回原生renderer。
6. 原`Loading.tsx`的SkeletonLoadingIndicator函数原样拆到同目录共享文件，避免节点骨架静态引入lottie-web。原Loading对外行为不变。

## 验证

- 身份/生命周期/接缝/材料caller回归：原4文件22项通过；边界新增5项通过；后补工作流无canvas/错scope1项通过（相关合计28项）。
- 首屏边界覆盖：挂载但未暴露；成功空列表释放原生；失败无永转圈且重试；描述重试不重新盖住已确认canvas；切canvas拒收旧响应；Huabu chrome不受LCOS门控。
- 工作流真实caller补证：exact scope过滤、多workspace显式选择、目标sourceNodeId保留、无canvas禁用并说明原因，不偷跳其它scope。
- Web `npm run typecheck`已通过。Lint仅修本批import顺序；测试非空断言warning保留，未压制行为检查。
- 自然首屏逐帧：1592ms为加载层，原生可见0；1809ms卸加载层，9材料骨架+Glyth；2253ms为8真实材料+Glyth。完整记录见[逐帧JSON](./nodes-first-load-frame-proof.json)。不把前后总时间不同包装成性能提升。
- 受控只读失败验证：独立浏览器abort真实binding GET，错误UI出现；解除拦截点“重新读取”，8材料恢复、cover数量0。故意制造的网络error/warning不计入干净正常态。
- 为截取短暂等待状态，另一回合用Promise挂住真实GET，截图后立刻释放；这是测试，不是生产代码延时。真实逐帧数据来自未拦截回合。

## 截图

- [首次身份读取中（受控GET等待）](./nodes-first-load-pending-identity.png)
- [真实身份已确认、材料描述未到（自然首屏）](./nodes-first-load-bound-skeletons.png)
- [真实材料就绪](./nodes-first-load-ready-fixed.png)
- [读取失败与重试](./nodes-first-load-error.png)

旧文件`nodes-first-load-initial-cover.png`实际拍到的是身份确认后的节点骨架，不能把它称作首次整屏加载层；已另存准确名称。

## 尚需合并处理

- Arc使用portal，因此不受Canvas父层inert控制。受控等待截图发现旧选中节点Arc会露出原生展开/删除动作；已交根代理在现有eligible条件对当前project/canvas的`bindingIdentitiesReady`做判定，身份到后立即开放，不等descriptor全部完成。根代理接完需复测。
- 新投影在reconcile期间才首次产生，以及更多项目/大规模节点的时序未全部覆盖；不能用当前10节点样本代表所有实时投影情形。
- 上游文档preview最多160字的限制仍在，和本次首屏加载修复无关；详见LOD报告。

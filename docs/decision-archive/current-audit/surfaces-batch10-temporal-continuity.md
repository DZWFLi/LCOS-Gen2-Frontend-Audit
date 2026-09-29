# Context 时间轨：真实子现场边界与预览连续性

日期：2026-09-27。结论：修复时间轨目标不可用说明、跨画布旧绑定误用、同画布绑定更新后的失效高亮。真实 Context 子现场浏览器验证仍缺合法现成数据，没有用根现场或假域数据补算。

## READ_SOURCE

- 最终语义：`_cabin/06_Figma/LCOS_GEN2_Figma设计合同轻包_仅MD_20260914__unzipped/03_ContextWorkflow产品语义裁决.md` §3.3、§4–6；配套 `04_ContextWorkflow已有成果纠正.md`。
- 原 T5 三视图裁决与 V3 的时间轨部分按最终语义降级使用；来源详见[第9批完整索引](surfaces-batch9-context-layers.md)。右侧、局部密度、hover临时凸起、wheel窗口、多目标定位保留；Episode/五档score不是新领域合同。
- 真实调用链：`LcosProjectRoute → LcosProjectShell → ContextWorksite(isChildWorksite) → TemporalRail → createLcosCoreSession().temporal.getIndex → CoreTemporalClient → GET /projects/:id/temporal-index`。定位走原 `requestLocate`，预览走原 `useTemporalPreviewStore`，真实节点绑定来自原 `useLcosReferenceStore`。
- 已读生产 `temporal-index` route、`temporal-index-projector.ts` 与合同，仅核来源未修改。索引按 Workspace.scopeId 从已有 durable facts 生成，API允许读根Workspace，不等于根现场可以冒充child显示时间轨。

## ADOPTED

| 失败场景 | 前端修改 | 保留的唯一owner |
|---|---|---|
| 已有时间事实，但本时间窗口所有目标尚未投影；只有灰刻度无解释 | 显示真实原因：当前子现场无画布 / 当前对象绑定未就绪 / N组目标未投影；绑定到达后恢复原按钮 | 不生成目标，不改Core索引 |
| 同一个子现场恢复为新canvas，引用映射还属于旧canvas | `bindingCanvasId` 必须等于当前canvasId才参与时间目标投影，旧nodeId不允许发往新画布 | 原绑定缓存、原requestLocate |
| canvas变化时旧hover本地态及部分定位回执残留 | scopeKey纳入原project/workspace/canvas预览身份；地址变化清旧回执和预览 | 原TemporalRail状态与预览store |
| 同canvas、同时间组ID仍存在，但真实节点映射node-a→node-b或完全移除 | View保存当前预览item的局部ref；producer item变更后清失效预览和凸起，新hover读取新目标 | 仅既有View局部ref，不新增store/hash/拓扑 |

生产修改：

- `huabu/apps/web/src/lcos/surfaces/context/TemporalRail.tsx`
- `huabu/apps/web/src/lcos/ui/context/TemporalRailView.tsx`
- 新行为回归：`huabu/apps/web/src/lcos/surfaces/context/TemporalRail.continuity.test.tsx`

工作树：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926`。没有改Core、S20、S11、光幕或导航owner。

## VISUAL_SOURCE

- 最终稿 `5388:25701`，说明 `5392:6043`，Figma文件 `nFUdroLvI5qJZuYTW8h2rF`。
- `5392:6046`：Context child右侧局部仪表；`5392:6048`：固定节距与空间不足缩短窗口；`5392:6049`：disabled真实不可用、error重试、recovery数量说明；`5392:6050–6051`：Esc清预览、leave恢复、reduced-motion保留真实对应组高亮。
- 本地 `E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/unification/specs/temporal.json`；源稿 `5156:504/1871/3249`。
- 本批是状态与身份连续性修复，没有凭静态图发明新的时间分组或永久黑游标。

## RETIRED

- `.e2e-data/probe-temporal.mjs` 与旧 `temporal-durable-index-context.png` 不能再证明“真实Context子现场”：脚本地址是 `/context?workspaceId=workspace-real-context`，该Workspace实际属于root。
- `workspaceId` 参数存在即child的错误路由判定已交导航支线修复；见[独立路由报告](root-workspace-route-20260927.md)。本域没有越界改Route/Shell。
- 旧“37张＝20workflow＋17skill”压力证据已退役。S25/S27/S28按[Workflow专项最终追加](workflow-near-preview-spatial-fix.md)更新为workflow专属源与20workflow呈现模拟，不把它写成真实业务规模。

## VERIFIED

### 只读真实数据盘点

[脚本](surfaces-temporal-data-audit.cjs)、[结果](surfaces-temporal-real-data.json)。使用当前前端已有Core认证经 `/lcos-core` GET读取；没有保存认证值，没有写项目事实。

唯一项目 `lcos-gen2-dev` 现有6个Workspace：

- 3个root，分别Main/Context/Workflow，有canvas。
- 3个非root，均scope.kind=workflow且preferredSurface=workflow，全部缺canvas。
- 根Context现有16个durable facts、1个mid group；**没有真实Context child**。因此浏览器缺证原因是目标数据不存在，不能通过强加URL参数或换名字解决。

导航支线真实浏览器验证（引用，非本域重复执行）：旧根URL归一到 `/context`，Temporal计数0、无返回来源按钮；未知Workspace保持明确不可用。该证据只验证根/未知边界，不证明child功能完成。

### 行为回归

串行执行11文件43项全部通过：

```text
pnpm exec vitest run --maxWorkers=1 
  src/lcos/surfaces/context/TemporalRail.continuity.test.tsx
  src/lcos/surfaces/context/TemporalRail.request.test.tsx
  src/lcos/surfaces/context/temporalPreviewState.test.ts
  src/lcos/surfaces/context/temporalTargetProjection.test.ts
  src/lcos/surfaces/context/temporalWindow.test.ts
  src/lcos/ui/context
  src/lcos/ui/spatial/Stage6Presentation.test.tsx
```

新增4项在真实TemporalRail＋真实TemporalRailView组件上验证：无投影→绑定到达恢复、同child换canvas拒旧nodeId、同canvas节点替换/移除清高亮、地址撤除清旧partial回执。测试输入仅存在内存，不是新canonical数据。

三份修改文件 ESLint 0错误0警告；本批限定diff检查通过。全Web tsc在最后一处hover补修之前通过，最终合并类型复核交根任务统一串行执行，不把前一次结果冒称最新全量结果。

## UNRESOLVED

1. 真Context child→真实时间索引→hover多节点轮廓→wheel→定位→返回的完整浏览器回合仍需现有合法child数据；本批未创建、不伪造。
2. 真实索引当前只有1个mid group，无法作为多时间窗口压力证据；window/wheel与多目标仍以单测为证。
3. 当前Core已有mid/far投影和前端私有长度分档，不等于最终语义确认了Episode领域实体、三层或五档合同。本轮没有扩这些模型，也没有抹掉这个设计待确认项。
4. 目标部分缺失后的定位实际回执、复杂窗口碰撞与真实多时间组手感，仍不能从本轮43项测试推断全部完成。

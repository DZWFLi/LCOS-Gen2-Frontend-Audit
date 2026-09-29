# Gen1 Node Core Completeness Ledger v1

## 目的

Gen1 不作为视觉终点，只作为功能与状态覆盖下限。Gen2 可以替换其技术身体，但不能在“简化”时丢掉已经存在的用户能力。

## 1. GitHub 已确认的 Gen1 资产

来源：`DZWFLi/LCOS-local-creativeOS` → `a24-to-phasea-20260901`。

### Pure semantic / policy

- `documentSemanticZoom.ts`
- `glythSemanticLod.ts`
- `pointerInteractionLanguage.ts`
- `semanticDrop.ts`
- `semanticRightDrop.ts`
- `projectRelationEndpoint.ts`
- `visualFamily.ts`
- `presentationHierarchy.ts`
- `mindMapLayout.ts`

### Mature implementation worth lifting

- `visual/LcosGlyth.tsx`
- `visual/glythBloub.ts`
- `visual/glythMotion.ts`
- `visual/bloub/*`
- Pin / Marker / Beacon / Centered Index 的 derived policy 与测试。

### Legacy mechanics not to migrate

- `SpatialCanvas.tsx` 作为第二 canvas runtime；
- camera/pointer/selection/DOM hit-test owner；
- old overlay stack；
- generic SurfaceObject shell；
- 与 Huabu NodeWrapper/Frame/Preview 重复的实现。

## 2. Species coverage floor

| 能力 | Gen1 下限 | Gen2 要求 |
|---|---|---|
| Image | 内容 body、resize、preview | Huabu native + Spatial morphology |
| PDF | 页预览、页/区域操作 | Huabu PDF + fragment/source locator |
| PPT/Office | 当前页/slide preview | Huabu Office + slide-level note/fragment |
| Web | 网页/reader preview | Huabu live/reader + LCOS provenance |
| Text/Markdown | 直接阅读/编辑 | same entity multi-face |
| Outline | canonical Markdown 派生 | 不创建第二 truth |
| Mind Map | same content projection | specialist Work View，不做第二 graph |
| Collection | expanded/collapsed/membership | Huabu Frame + Spatial stack |
| Colony | group field / peel / rescope | derived-only，不写第二 canonical object |
| Glyth | living identity / LOD / active critical state | Grok/Bloub + Huabu takeover |
| Skill | 可识别、可打开、可构建 | Skill Builder |
| Run/Result | lifecycle + review | T4/T6 canonical state |

## 3. Interaction coverage floor

不能丢：

```text
hover
select
multi-select
continuous resize
left drag move
right/modifier/handle/direct semantic triggers
Reference 与 Selection 分离
Relation
Semantic Give
Action Arc
Composer
Pin / Marker / Focus
Preview
Work View
Archive / Restore
```

Gen1 `pointerInteractionLanguage` 的核心冻结继续保留：

```text
Shift        = additive Selection
Cmd/Ctrl     = this-run Reference
```

不能让 Reference 偷写 Selection truth。

## 4. Document completeness floor

Gen1 已有：

```text
full    zoom >= .72
outline .36 <= zoom < .72
title   zoom < .36
```

且 selected/expanded 强制 full；Outline 从 canonical Markdown heading 派生。

迁移裁决：数值作为测试向量而非最终视觉 token。Huabu current 机械层以 screen-width 150px + hysteresis 10px 驱动 minimal；T5 必须合并成一个 resolver，不能让 camera zoom 与 screen width 两套状态互相打架。

## 5. Glyth completeness floor

Gen1 已有四档：

```text
normal       zoom >= .9
mid          .6 <= zoom < .9
far          .35 <= zoom < .6
extreme-far  zoom < .35
```

critical Glyth 包括 selected、focused、active conversation；extreme-far 非关键 Glyth 可以 96px screen cell 聚合，且聚合只做 ephemeral projection，不写 Core/Relation/Marker。

迁移裁决：保留 critical identity 与 ephemeral cluster 规则；机械实现优先并入 Huabu takeover，禁止第二套 zoom store。

## 6. AI-native completeness floor

Gen2 不得退回“Agent 只给建议”。必须表现：

```text
Agent move node
Agent group
Agent relation
Agent modify
pending-review
keep / revert
keep all / revert all
view before
```

当前 Huabu 已有 Agent/Question/preview/change-review 相关能力，但 LCOS canonical Run/Revision/Checkpoint 仍是 authority。T5 负责轻 pending-review visual，不新造 AI badge 污染内容。

## 7. Deep-work floor

至少覆盖：

- Image/PDF/Office/Web/Video/Note Preview；
- Markdown Document / Outline / Mind Map 同源切换（不由 lightweight TextNode 承担）；
- Conversation Scene；
- Assembly target/source browsing；
- Context / Workflow / Skill / Run professional bodies；
- Archive browsing 与 Restore；
- Preview/Work View 的 float/dock/split/close/restore。

这些不要求 Phase 1 全部施工，但 Phase 1 species contract 必须预留 promotion/deep-view seam。

## 8. Gen2 的“2×”验收方式

不是按钮数量翻倍，而是六轴均不低于 Gen1：

```text
Species coverage
State coverage
Direct manipulation
Deep work
AI-native operation
Spatial choreography
```

其中至少三轴必须明显超过 Gen1：

- Spatial choreography：达到 Spatial 的连续性；
- species morphology：内容本体优先、无 generic card；
- micro-state fidelity：hover/selected/receptive/working/review/LOD 完整。

## 9. 当前结论

Gen1 完整度下限已恢复到可用于 Gate A 验收的颗粒度。下一步不再继续抽象总结，而是把 ledger 条目逐项落到 `11_NodeSpecies_State_Donor_HostSeam_Matrix_v1.md` 的 construction cards 与 browser acceptance。

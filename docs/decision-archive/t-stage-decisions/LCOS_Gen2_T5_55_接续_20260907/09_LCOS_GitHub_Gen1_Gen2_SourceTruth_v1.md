# LCOS GitHub Gen1 / Gen2 Source Truth v1

## 核验范围

仓库：`https://github.com/DZWFLi/LCOS-local-creativeOS`

本轮直接检查远端分支与 tree，重点包括：

- `a24-to-phasea-20260901`
- `feat/spatial-component-foundation`
- `research/huabu-gap-audit-20260811`
- `main`

## 1. Gen1 / v0.15 真实存在的资产

`a24-to-phasea-20260901` 中已确认：

### Canvas mechanics / UX semantics

```text
SpatialCanvas.tsx
spatialInteractionMachine.ts
semanticDrop.ts
semanticRightDrop.ts
pointerInteractionLanguage.ts
projectMaterialRelationGesture.tsx
projectRelationEndpoint.ts
spatialCamera.ts
spatialLod.ts
```

### Presentation / navigation

```text
visualFamily.ts
presentationHierarchy.ts
mindMapLayout.ts
contextStrands.ts
CenteredSpatialIndex.tsx
CanvasEdgePinLayer.tsx
ColorPin*.tsx
SpatialBeaconLayer.tsx
SpatialMarkerLayer.tsx
```

### Glyth / Bloub implementation

```text
LcosGlyth.tsx
glythBloub.ts
glythMotion.ts
bloub/engine.ts
bloub/expressions.ts
bloub/eyefit.ts
bloub/face.ts
bloub/profiles.ts
bloub/shape.ts
bloub/skins.ts
bloub/states.ts
```

所以 Gen1 不是只有历史截图；其 interaction grammar、pure policies、Bloub renderer 与测试向量都能直接从 GitHub 分支回收。

## 2. Projection truth

已推送分支中存在：

```text
apps/web/src/runtime/projectionAdapters.ts
apps/web/src/features/entities/projectEntityProjection.ts
apps/web/src/state/projectionLayoutState.ts
apps/local-core/src/companion-projection-service.ts
apps/local-core/src/process-projection-service.ts
apps/local-core/src/presentation-application-service.ts
packages/contracts/src/companion-projection.ts
packages/contracts/src/presentations.ts
```

但本轮没有在已推送分支找到：

```text
projectionBinding.ts
projectToSpaceProjection.ts
```

因此当前正确裁决是：

- `ProjectionBinding` 作为 Gen2 目标 contract / adapter 概念成立；
- 但指定文件名尚不是 GitHub current implementation；
- 不允许再在 Gate A 报告中写成 `FOUND_CODE`；
- 后续施工必须选择：在既有 `projectionAdapters.ts` / presentation services 上扩展，或经批准新增 exact file。

## 3. Huabu 与 LCOS 的 source boundary

```text
Huabu current main
→ node mechanics / renderer host / LOD / takeover / Frame / Text body

LCOS a24 / Gen1
→ semantic intent / species policy / Glyth / navigation / projection semantics

Gen2 target adapter
→ 将 LCOS canonical truth 投到 Huabu mechanics
```

这三层不能再用“Huabu/Gen2 current”一个词混过去。

## 4. 可迁白名单

- semanticDrop trigger grammar；
- modifier 与 selection/reference 区分；
- relation receptor policy；
- document semantic zoom tests；
- Glyth LOD / critical identity；
- visualFamily 分类；
- presentation hierarchy / mind-map pure logic；
- Bloub renderer 的可复用实现与状态表；
- navigation equality / marker / safe-zone policies。

## 5. 不迁的 Gen1 mechanics

- 第二套 canvas runtime；
- 旧 pointer/camera/selection owner；
- DOM hit-test owner；
- generic card shell；
- 旧 overlay stack；
- 与 Huabu NodeWrapper/Frame/LOD 重复的实现。

## 6. Gate A 影响

Gen1 completeness ledger 可以从 GitHub branch 直接补，不再依赖聊天引用。Gen2 adapter 仍是明确 gap，但它不阻塞 morphology、Spatial choreography、Grok/Bloub state mapping；它只阻塞最终 exact host wiring 与 T1 direct construction PASS。


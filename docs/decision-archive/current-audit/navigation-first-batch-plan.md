# 导航首批最小修复方案

状态：2026-09-26，只读准备；等待主代理合并总盘点后开始施工。

## 采用设计

- 共享导航族 `5384:367`：静息 `5384:247` 52×48；3个Pin `5384:306` 184×48；搜索 `5384:366` 402×48。36px控件、19px搜索图标、22pxPin、左右8/上下6、间距8、胶囊圆角。无Pin仅搜索；当前常驻加号移回管理/作者入口。
- Rail `5385:255/282`：一项52×52，四项52×178；36px项、8px内边距、6px间距。只显示真实显式目的地，根面仍归底部三键。
- Shell `5386:211/286/361`、最终HUD `5388:27696`：共同safeRect、24px边缘呼吸；不能窗口一开就让整片HUD消失。
- 浮标 `5153:774` / 到达 `5164:831`，沿T2原卡 LOCAL→NEAR_EDGE→EDGE→TRAVELLING→ARRIVING，点击只向现有相机命令发请求。

## 最小代码边界

1. 新 `navigation/useHudViewport.ts`：纯呈现hook订阅resize/visualViewport变化，给现有`lcosHudEdgeOffsets`真实尺寸。不是相机/窗口/导航owner。先替换Search、Where、ColorPin、SurfaceDock；Rail由主代理协调同样替换。把hook调用放在任何conditional return之前。
2. `navigation/LcosNavigatorIsland.tsx`：Search继续现有CoreSearchClient；命中后向已有`requestFocusWhere`交实体身份，不继续用legacy locationRefs当完整位置。输入焦点与异步错误分开，结果保留。去静息常驻+；Pin增长和溢出在现有纯view处理，不重新造大导航。
3. `navigation/LcosFocusWhere.tsx`：保留SqliteBindingStore，合并真实项目workspaces的canvasId→workspaceId/preferredSurface映射。每行保留exact canvasId/spatialId；不以surface替代目标。现有`waitForProjectedEntity`增加可选exact nodeId过滤，避免同实体多个投影时定位第一项。
4. 子现场切换最稳方式是扩展既有 `app/useLcosWorksiteNav.ts` 的`switchWorksite`接受显式workspace/canvas目标，继续唯一switchCanvas+existing route。此文件不在初始独占范围，先请主代理确认。不要再写一套导航controller。已有目标的binding证明canvas，不能为“定位”偷偷创建新canvas。
5. `pin/ColorPinHud.tsx`：使用新viewport hook；保留usedDefinitions和Core成员owner；实体仍走Where。workspace surfaceRef应先保留exact workspace再切换，不能优先surfaceKind导致子现场拍平。创建颜色组仍在Arc/菜单/成员管理可达，不靠静息常驻+。
6. 新 `navigation/LcosPersistentLocatorOverlay.tsx`（若主代理确认）：只投影既有真实目标身份，复用RF absolute position、`computeLocatorGeometry`、`placeLocatorAnchorOutsideObstacles`，点击`requestLocate`。不创建PinPositionStore或另存世界坐标；无真实身份/隐藏节点不画。候选范围按原卡/实际selected与Pin语义核对，不为所有节点塞一圈永久浮标。
7. `LcosCanvasCommands.tsx`由主代理统一：挂载上述纯overlay，并避免同target和当前travel cue画两份；保留现有飞行完成promise、取消、arrival流程。该文件本子代理不直接改，除非主代理重新分派。
8. Rail现在已有动态高度和+N真实overflow，保留。需主代理协调 `shell/LcosRailway.tsx`：用viewport hook、传glyph，零可见目的地不画空壳。`ui/families/LcosRailwayView.tsx`处理Peek overflow裁切；不得为省事移除接收/重排。

## 需要协调的共享文件

- `ui/families/LcosNavigatorIslandView.tsx`、其family CSS：导航宽度/溢出和各态；目前不在独占范围。
- `shell/LcosRailway.tsx`、`ui/families/LcosRailwayView.tsx`：响应式、glyph、溢出。
- `app/useLcosWorksiteNav.ts`：已有导航owner的exact workspace参数扩展。
- `navigation/LcosCanvasCommands.tsx`：父代理持有；新浮标挂载与travel cue合并。
- 本批可不碰 `LcosProjectShell.tsx`；如需透传新workspace ensure回调再与父代理协调，优先不增加此依赖。

## 可复用机制

`SqliteBindingStore.list()`、`session.projects.getWorkspaces(projectId)`、现有`useLcosWorksiteNav`、`useCanvasStore.switchCanvas()`、既有`?workspaceId=`路由、`waitForProjectedEntity`订阅、`requestFocusWhere`/`requestLocate`、`computeLocatorGeometry`、`placeLocatorAnchorOutsideObstacles`、Core Pin membership与Rail orderedRefs。

## 验证

- 1440→1024→1440不刷新，HUD仍在safeRect；打开/resize窗口不移动相机。
- 0/1/3/20Pin：无Pin静息52；多Pin可操作且不挤没搜索；reduced-motion。
- 搜索同实体的根现场、两个同surface子现场及同画布两个投影：最终canvas/workspace/node均exact，不取第一项猜。
- 旧请求晚回、Esc取消、项目切换、目标被删或权限失效，不错误到达。
- 本地→近边→画外，点击真实浮标触发唯一requestLocate；用户手势可取消；窗口变化只改浮标位置。
- Rail0/1/4/20项增长，保留+N、接收、重排；本批不扩大MiniMap内部审查。

本方案没有源代码改动。最终实际施工与测试结果另归档，不把计划写成完成。

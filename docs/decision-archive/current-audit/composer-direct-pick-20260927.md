# Composer 直接点取引用：生产入口恢复

日期：2026-09-27。工作树：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926`。

## 发现与修复

原 T3 明确要求 Composer 引用按钮进入 Pick，再点击真实绑定节点切换引用；Ctrl/Cmd-click 只是同一路径的快捷方式。此前 @ 只打开对象列表，普通鼠标点击仍改 Selection，主操作路径缺失。

现在 @ 进入/退出画布点取。点已有绑定节点通过原识别器、原 toggleNodeReference、原 ReferenceController 切换本条消息引用；不移动节点、不改 Selection、关系或接收会话、不发送。Shift 仍归多选，触控/笔保持原手势；进入点取后可用次级列表进行键盘/触屏取用。

仅在既有 lcosReferenceState 增加当前点取 owner 的临时 UI 字段，不保存另一份引用；关闭、换目标、换项目、提交或卸载后清理。列表 Esc → 回点取；点取 Esc → 回 Composer 输入；再次 Esc → 关闭 Composer。引用和草稿保留。

## 六字段

READ_SOURCE:
- `E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T3/LCOS_Gen2_T3_C1-S3B_ExactFileCards_Composer_Reference_Voice_Receiver_Run_20260906.md` §2.1–2.3：主路径、快捷方式、Shift、Esc、Selection≠Reference。
- 同目录 `LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md` 局部浮层关闭层级；当前 referenceController、ProjectionBinding派生的nodeEntityRefs、lcosRecognizers、referenceClickSuppressor、ComposerHost、DropdownMenu。
- Figma get_design_context 在线读取 5388:324，保留 Oreo 近场输入、@ 图标、Tag 和现有视觉资产。

ADOPTED: 已有 Huabu 指针路由 → 原 LCOS createReferencePickRecognizer → 原 toggleNodeReference → ReferenceController。点击尾事件仍用原 referenceClickSuppressor，原 DropdownMenu 保留次级列表。Huabu donor：microsoft/Huabu@a3c411e1f655191344285141f08c4738fa6015f7，MIT；未引入新donor代码。

VISUAL_SOURCE: Figma Main/Composer 5388:324；已有 at.svg、Oreo IconButton 与 Tag 不重绘。点取期间使用既有反馈行和pressed状态；只有此时显示次级列表入口，没有常驻大弹窗。

RETIRED: @ 主按钮只能列表选引用；不按修饰键无法直接从画布点取的旧行为。原列表仍保留作为次级方式。

VERIFIED:
- 4文件29测试通过：原Ctrl/Cmd、Shift优先、无绑定拒绝、拖动阈值、提交快照、列表键盘；新增普通点取、项目切换取消、Esc退出保留引用和草稿。
- 完整Web TypeScript通过；本批ESLint无错误，既有测试non-null assertion一条warning；diff --check通过。
- 真实Main：选中施工纪律后开Composer，@激活，普通点击真实图片；引用条出现该图片，Selection仍仅原施工纪律节点。
- 再次真实点击可取消引用，0→1→0；未触发业务发送。
- 列表Esc后menu=0、pick=true、Composer=1；第二次退出pick，第三次关闭Composer。
- 390px列表可达；未修改相机、节点几何和项目内容。
- 首次浏览器尝试碰到并行HMR导致Arc卸载，超时；刷新稳定后重测通过，不以强制click绕过。

UNRESOLVED: 不代表全类型引用发送完成；旧式Note、集合展开、多模态支持仍见Glyth报告。鼠标模式已验证；触控和笔仍用原手势，可从次级列表取用，未宣称直接触控点取已实现。大量节点列表虚拟化与所有选择手势组合不在本批验收范围。

## 文件

均相对工作树：
- `huabu/apps/web/src/lcos/lcosReferenceState.ts`
- `huabu/apps/web/src/lcos/lcosRecognizers.ts`
- `huabu/apps/web/src/lcos/lcosRecognizers.test.ts`
- `huabu/apps/web/src/lcos/composer/LcosComposerHost.tsx`
- `huabu/apps/web/src/lcos/composer/LcosComposerHost.references.test.tsx`
- `huabu/apps/web/src/lcos/composer/ComposerReferencePicker.tsx`
- `huabu/apps/web/src/lcos/ui/nearfield/nearfield.css`

[真实画布点取](composer-direct-pick.png) · [390px次级列表](composer-direct-pick-list-390.png)。未提交、未推送。

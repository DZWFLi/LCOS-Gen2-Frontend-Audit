# LCOS Gen2 · T4 / 442 · Round 6

> **基线更正（2026-09-07）**：当前施工基线为 `LCOS_Gen2/main@232b2ca5...` + Huabu `a3c411e1...`。Assembly/Local Core/contracts 在两个版本间无非 `huabu/` 源码变化，本报告结论可继承。

## Assembly 全链当前源码复核与施工校正

- 日期：2026-09-07
- 当前源码：`DZWFLi/LCOS_Gen2@c2ff890a867922a1256572199458438572eb0a8c`
- 对照对象：`LCOS_Gen2_T4_C1-3_Assembly_ExactSourcePlan_20260906.md`
- 工作性质：只读源码普查、旧计划复核；未修改仓库代码
- 结论状态：`CENSUS_COMPLETE / PLAN_REQUIRES_CORRECTION_BEFORE_BUILD`

---

## 1. 一句话结论

旧 C1-3 的架构方向基本成立：Assembly 应是项目级、无第二套 truth 的入口，并复用 Warehouse、Capture、Presentation、Workspace Membership、Relation 等既有 canonical 服务；但它不能原样进入施工。当前源码确认有 2 个 P0 语义缺口、3 个 P1 接口/呈现缺口，必须先纳入实施范围和验收测试。

颗粒度判断：**现在已经足够继续施工设计与拆票；在修正下列 P0 前，不足以直接按旧 C1-3 写 UI。**

---

## 2. 旧 C1-3 重新定级

| 项目 | 复核结论 |
|---|---|
| Assembly 不拥有新的业务 truth | `VERIFIED` |
| 一个 Project 一份共享 Assembly 入口 | `PRODUCT_DECISION_VERIFIED`，前端 owner 尚未实现 |
| source + target 统一 apply | `VERIFIED_BACKEND` |
| Warehouse / Capture / Resource / Skill 可分别读取 | `BACKEND_AVAILABLE`，web-gen2 clients 缺失 |
| 逐 source 结果，允许 partial | `VERIFIED` |
| path projectId 与 body projectId fail-fast | `NOT_IMPLEMENTED_SERVER_SIDE` |
| unsupported 能如实阻止整体成功 | `CONTRACT_IMPLEMENTATION_CONFLICT` |
| placement 失败可观察 | `NOT_TRUE`，当前被静默降级 |
| resource 解析 canonical view | `PARTIAL`，实际取无排序 SQL 结果的第一个 view |
| Context / Workflow / Collection 是 scope 兼容迁移 | `VERIFIED`，不可误写成新 canonical ownership |
| Skill 可直接装配 | `NOT_SUPPORTED`，当前明示只读 |

因此，旧文件应继续保留为 `PREVIOUS_CONSTRUCTION_HYPOTHESIS`，本报告是进入下一步 Assembly 施工设计时的校正层。

---

## 3. 当前真实全链

```text
web-gen2（当前无 Assembly 专用 client / store / UI）
  ↓ 未来调用
POST /projects/:pathProjectId/assembly/apply
  ↓ routes/f6-assembly.ts
AssemblyApplyService.apply(body)
  ├─ capture → CaptureSpaceService.materializeToProject
  │              └─ canonical Artifact / Revision / View / Resource
  ├─ artifactView/resource → workspace or scene
  │              └─ MutationSafetyService.addWorkspaceMember
  ├─ artifactView/resource/note/aggregate → main/context/workflow
  │              └─ Presentation + CurationCommandService.applyPatch
  └─ compatible source → conversation
                 └─ conversation_context Relation + ChangeSet
```

Assembly 本身没有独立持久化表、membership 表或 relation 表。这一点正确，必须保持。

---

## 4. P0：开工前必须修正

### P0-A · 路由项目与请求体项目没有一致性校验

证据：

- `routes/f6-assembly.ts:60-61` 只校验 URL 中的 `projectId` 存在；
- `routes/f6-assembly.ts:72` 直接将 body 传给 `assemblyApply.apply(...)`；
- `assembly-apply-service.ts:67-68` 只使用并校验 body 内的 `request.projectId`。

因此，请求：

```text
POST /projects/A/assembly/apply
body.projectId = B
```

会先通过 A 的路由校验，随后实际对 B 执行。旧计划只在 web client 做 fail-fast 不够，因为后端仍可被其他调用者绕过。

施工校正：

1. 路由必须验证 `input.projectId === pathProjectId`；
2. 不一致返回明确 `400 INVALID_ARGUMENT` 或项目既定的等价错误；
3. 增加真实 HTTP 测试，证明 B 没有 mutation；
4. 前端仍可保留同一校验，但它只能是 UX 防错，不是安全边界。

### P0-B · `allApplied` 会把 unsupported 当成全部成功

证据：

- `assembly-apply-service.ts:85-89`：unsupported 返回 `status: skipped, channel: unsupported`；
- `assembly-apply-service.ts:79`：`applied` 或任意 `skipped` 都计为 `allApplied=true`；
- `contracts/src/assembly.ts:129-130` 的注释要求 fail-close / partial 如实表达；
- 现有 Skill 测试只断言 item 是 unsupported，没有断言 `allApplied`。

后果：仅拖入 Skill、conversation source 或服务未配置时，结果可以是“一个都没写入，但整体成功”。如果前端依赖 `allApplied` 收起面板或发成功 toast，会制造假成功。

施工校正：

1. 先冻结整体结果语义；建议 `allApplied` 仅允许 `applied` 与 `already-member`；
2. `unsupported` 不得计作 applied；
3. 最稳妥是补充显式 summary（applied / alreadyMember / unsupported / failed），UI 由 item 结果渲染；
4. 补齐 unsupported-only、mixed applied+unsupported、already-member-only、failed-only 四类测试。

---

## 5. P1：需要纳入第一轮实现

### P1-A · web-gen2 缺完整接入层

`apps/web-gen2/src/backend/` 当前只有 artifacts、projects、relations、search 等基础 client；没有：

- `assembly.ts`
- `warehouse.ts`
- `capture.ts`
- `resources.ts`
- `skills.ts`

既有 `HttpClient`、`coreRequest`、`CoreApiError` 可复用。新 client 应直接引用 contracts 类型，避免前端复制 union。

### P1-B · Warehouse 的 `usedHereTarget` 契约大于 HTTP 与实现

- Contract 允许 `workspace | scope | conversation`；
- HTTP parser 只接受 `workspace:<id>`；
- WarehouseService 也只对 workspace membership 投影 `usedHere`。

因此 Assembly V1 UI 若展示“Used Here”，只能对 Workspace/Scene 宣称真实支持。Context/Workflow/Conversation 不得先画成可用筛选。

### P1-C · placement-only 失败被吞掉

`assembly-apply-service.ts:377-395` 中，already-member 的纯位置更新遇到 CAS 冲突会 catch 后直接返回 false；上层仍可能以 already-member 成功结束。

这可以作为 membership 不阻塞策略，但 UI 必须能知道“成员已存在、位置未应用”。当前返回结构没有失败原因。至少需要：

- 增加 placement outcome / warning，或
- 明确前端把 `placementApplied !== true` 视作未确认位置，并允许重试。

不能在 UI 上把它展示成完整落位成功。

---

## 6. 需保持但不可扩大解释的能力

### Capture

`CaptureSpaceService.materializeToProject` 已实现同项目 resolved item 的幂等复用，并保留 artifactId/viewId 回链；跨项目 resolved 或缺少回链时 fail-close。Capture → surface 是“先 materialize，再 membership”的两阶段链，失败后可凭回链安全重试。

限制：materialize 先进入 root scope；后续目标 membership 才表达 Assembly 目的地。不能把它描述成 Capture 原生直接属于 Context/Workflow。

### Resource

Resource 通过 descriptor.artifactId 转到 ArtifactView，方向正确。但 `getArtifactViews(artifactId)[0]` 的 SQL 没有 `ORDER BY`，也没有“canonical view”标志；它只是取数据库返回的第一项。

施工建议：短期至少冻结确定性选择规则并加测试；长期不应把“数组第一项”宣传为 canonical identity。

### Main / Context / Workflow

这些目标通过 Presentation membership 写入。Context / Workflow 仍由旧 Scope kind 做兼容定位，符合 D21 的迁移裁决，但不代表 Scope 重新成为新模型 owner。

### Scene / Workspace

ArtifactView 进入 Scene 走 Workspace membership；Note 进入 Scene 走 entity membership。两者是不同 canonical 通道，UI 可以统一成 drop 动作，但结果必须展示真实 channel。

### Conversation

写入的是 `conversation_context` Relation，且依赖 connected conversation 已绑定 session、session 已有 conversation artifact endpoint。未连通时 fail-close。

### Skill

SkillCatalog 是只读来源；AssemblyApply 明确返回 unsupported。第一轮 UI 可以浏览/识别 Skill，但不能提供会让人误以为已绑定的 drop 成功态。

---

## 7. 现有测试覆盖与缺口

### 已覆盖

- ArtifactView → Workspace membership 与跨项目目标失败；
- Capture materialize 一次、重复调用复用；
- Skill 返回 unsupported；
- Warehouse 基础查询、搜索、分页、workspace used-here；
- aggregate kinds、Note、Resource → presentation；
- Presentation membership ChangeSet 与 placement-only 不记 semantic ChangeSet；
- Scene / Note 等补洞路径。

### 未覆盖或不足

1. URL projectId 与 body projectId 不一致；
2. unsupported-only 的 `allApplied`；
3. mixed partial 的 summary / UI 行为；
4. placement CAS 冲突的可观察性；
5. Resource 多 View 时的确定性选择；
6. web-gen2 typed clients 与错误归一化；
7. Assembly UI reducer 的 stale request、逐 source retry、跨 Project session reset；
8. Context/Workflow/Conversation used-here 未支持时的 UI 禁用状态。

---

## 8. 修正后的施工顺序

```text
A0 语义护栏
  ├─ path/body project guard
  ├─ allApplied / summary 语义修正
  ├─ placement warning 可观察
  └─ 对应 Local Core + HTTP tests

A1 web-gen2 typed clients
  ├─ warehouse
  ├─ assembly
  ├─ capture
  ├─ resources
  └─ skills

A2 presentation state（仅 UI state）
  ├─ 当前 project session
  ├─ targetRef
  ├─ source rows + per-item outcome
  ├─ loading/error/stale request
  └─ 不持久化第二套 membership truth

A3 Professional Window 内的项目共享 Assembly 区域
  ├─ Source Bay
  ├─ Target
  ├─ truthful partial result
  └─ retry only failed/unsupported-after-change

A4 集成验收
  ├─ capture → target
  ├─ artifact/resource → surface
  ├─ note/aggregate → supported target
  ├─ conversation relation
  ├─ unsupported skill
  ├─ partial result
  └─ project switch / restart truth reload
```

---

## 9. 文件级施工边界（建议）

### 必改 / 新增

- `apps/local-core/src/routes/f6-assembly.ts`
- `apps/local-core/src/assembly-apply-service.ts`
- `packages/contracts/src/assembly.ts`（若冻结 summary / placement warning）
- `apps/local-core/tests/assembly-apply-f6-b3.test.ts`
- Assembly 相关 HTTP 测试文件
- `apps/web-gen2/src/backend/assembly.ts`
- `apps/web-gen2/src/backend/warehouse.ts`
- `apps/web-gen2/src/backend/capture.ts`
- `apps/web-gen2/src/backend/resources.ts`
- `apps/web-gen2/src/backend/skills.ts`
- 后续获批的 `apps/web-gen2/src/lcos/assembly/*`

### 不应新增

- Assembly domain truth store；
- Assembly membership 数据表；
- Assembly 自己的 Relation；
- 把 Project truth 放进 localStorage；
- 为了 UI 方便复制 contracts union；
- 在本 Sprint 顺手实现 Skill binding。

---

## 10. 验收门槛

1. path/body 项目不一致时 0 mutation；
2. unsupported-only 不得显示全部成功；
3. mixed 结果逐 source 可见，且可只重试未成功项；
4. already-member 与 newly-applied 有明确区分；
5. placement 未应用不得伪装成完整成功；
6. 每个写入结果都能指出真实 canonical channel；
7. 切换 Project 后 Assembly UI 不泄漏上一项目 source / target / status；
8. 刷新后由 Core truth 重建，不依赖前端本地业务缓存；
9. Skill 在未支持期间始终呈明确只读 / unsupported；
10. lint → typecheck → unit → build → smoke 全链真实通过后才可称 DONE。

---

## 11. 当前决定

- M2 Assembly 当前源码普查：`COMPLETE`
- 旧 C1-3：`SUPPORTED_WITH_MATERIAL_CORRECTIONS`
- 颗粒度：`ENOUGH_FOR_IMPLEMENTATION_SCOPING`
- 可直接按旧稿施工：`NO`
- 可按本报告修正后进入 A0 / A1：`YES, AFTER SPRINT APPROVAL`
- 当前未修改任何仓库文件，符合 dirty-worktree 停止规则。

下一轮建议转入 M3 Context Atlas 的 current-source census；如果先施工 Assembly，则应先把 A0 作为独立、可审查的小 Sprint 提请批准。

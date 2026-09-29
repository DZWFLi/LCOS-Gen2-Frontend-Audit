# 专业窗口第六批：拆组修复与测试纠正

结论：原窗口A与B合组后，激活A再拆出原先会无效；已修复。S11完整双组仍未接通，状态见独立方案。

## 修复

`lcosShellStore.ts`原ungroup逻辑将原宿主region ID误判成撞号。现在拆出窗口保留原窗口身份，剩余组用其活动窗口身份；保留几何、window对象、active、revision、阅读位置与未发送草稿。没有新store，也没有改Core。

## 验证

- shell与Stage：2文件37测试。覆盖A拆出、B拆出、重复点击、反复合拆、第三窗不变；390px实际省略菜单拆/合/再拆及1440恢复。
- 浏览器：`surfaces-window-regroup-qa.cjs`。真实fixture图片和文字打开两Reader，4状态0pageerror；390单窗展示但两身份保留，1440恢复两独立窗口。JSON与PNG同目录`surfaces-window-*`。
- 请求日志`nonGetRequests`全部是现有RFS/query只读查询，不是Core创建/Run执行；脚本未执行业务创建。
- 旧Reader测试由查pre改为读取真实逐行DOM，新增img/onerror/javascript链接/iframe原样可见且不执行；plain text仍保留换行。
- 旧Workflow import/JSX字符串测试改为生产容器调用：唯一画布、准确project/origin、进入成功收牌，装配卡面使用原onUse且不伪造已执行。
- 本域合并：30文件188测试通过。少量原有mock向localhost:3000连接产生ECONNREFUSED stderr，不影响结果。
- 节点代理已有NodeMaterialCaller 5项：真实Workflow scope、多目标显式选择、错scope与无canvas禁用；不再重复以源码import判断接通。

## 仍需明确

完整S11分组模型未写；两次自动审批拒绝store迁移，已停止。已准备12项纯helper/旧session测试，兼容读取后4文件52测试通过。它们不等于双组产品已经完成。

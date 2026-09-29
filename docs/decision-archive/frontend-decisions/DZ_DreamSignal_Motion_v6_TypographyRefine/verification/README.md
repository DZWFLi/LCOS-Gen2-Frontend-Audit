# 本轮验证记录

最终主流程结果在 `final/desktop.json`、`final/mobile.json`；平面动效真实时间采样在 `motion/motion.json`。本轮合计 132 项浏览器检查通过。

`first-pass/` 是开发中的首次结果，只作问题追踪，不能当作当前结果。旧版 Candy Signal 验收稿在根目录 history 中，不能作为 v4 测试。

## 复验

应用构建和单元测试无需联网：

```sh
npm run check
npm test
npm run build
```

浏览器脚本需要已安装的 Python Playwright、Chromium，以及本轮采用的 Linux Xvfb 环境。未把这些环境工具打包成应用依赖。可设置 `CHROMIUM_PATH`、`DZ_PROJECT_DIR`、`DZ_QA_DIR`，输出默认在系统临时目录，不改源码。

```sh
xvfb-run -a python verification/acceptance.py desktop
xvfb-run -a python verification/acceptance.py mobile
xvfb-run -a python verification/motion_proof.py
```

脚本加载完整自包含 HTML；使用真实鼠标、滚轮、触摸、按钮及已有 review 状态定位。其环境不代表所有用户设备的原生 file:// / Safari / Edge 行为。

截图是实际浏览器渲染。没有生成概念图充当成品截图。

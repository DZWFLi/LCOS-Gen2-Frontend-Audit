// TemporalRail — Context 子现场右侧局部时间轨（Figma temporal 5388:25701：右 24、宽 65）。
// 固定视觉密度 / Episode 聚合由 T6 时间分组 producer 提供（Wave 8 绑定真实 Run/事件时间）；
// 当前为诚实空态骨架：不画虚假刻度，无 producer 时显示原因，hover 鱼眼/wheel 窗口 Wave 8。

import { TemporalRailView } from '../../ui/context/TemporalRailView';

export function TemporalRail(): React.JSX.Element {
  return (
    <TemporalRailView
      items={[]}
      reason="暂无时间记录"
    />
  );
}

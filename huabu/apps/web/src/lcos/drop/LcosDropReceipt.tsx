import { Check, LoaderCircle, RotateCcw, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useHudViewport } from '../navigation/useHudViewport';
import { Button } from '@/components/Common/Button';
import useCanvasStore from '@/store/canvasStore';
import { useLcosDropStore } from '../lcosDropState';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { lcosGlassStyle } from '../ui/lcosTokens';
import { dropSourceKey } from './dropAssemblyReceipt';
import type { AssemblyApplyItemResultV1 } from '@local-creative-os/contracts';
import '../ui/nearfield/drop-feedback.css';

const itemStatus = (item: AssemblyApplyItemResultV1): string => item.channel === 'unsupported' ? '不支持'
  : item.status === 'failed' ? '失败' : item.status === 'applied' ? '已加入'
    : item.channel === 'already-member' ? '已在目标中' : '未应用';

/** One near-field receipt for the existing gesture. No new window, no second mutation owner. */
export function LcosDropReceipt(): React.JSX.Element | null {
  const state = useLcosDropStore((s) => s.state);
  const feedback = useLcosDropStore((s) => s.feedback);
  const dismiss = useLcosDropStore((s) => s.dismissFeedback);
  const retry = useLcosDropStore((s) => s.retryFailed);
  const bindings = useLcosReferenceStore((s) => s.nodeEntityRefs);
  const wrapper = useCanvasStore((s) => s.canvasWrapper);
  const viewport = useHudViewport();
  const panel = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState(64);
  const busy = state.status === 'committing';
  const receipt = feedback?.receipt;
  useEffect(() => {
    if (busy || receipt?.status !== 'success') return;
    const timer = window.setTimeout(() => {
      if (useLcosDropStore.getState().feedback?.receipt.transactionId === receipt.transactionId) dismiss();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [busy, receipt, dismiss]);
  useLayoutEffect(() => {
    const element = panel.current;
    if (!element) return;
    const update = () => { const measured = element.getBoundingClientRect().height; if (measured > 0) setHeight(measured); };
    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [busy, receipt, viewport]);
  if (!busy && feedback === null) return null;
  const attempt = busy ? state : feedback?.attempt;
  if (!attempt || attempt.status !== 'committing') return null;
  const target = useLcosDropStore.getState().targets().find((item) => item.targetId === attempt.destination.targetId);
  const rect = wrapper?.getBoundingClientRect();
  const targetRect = target?.readRect?.() ?? target?.rect;
  const availableWidth = rect?.width ?? viewport.width;
  const availableHeight = rect?.height ?? viewport.height;
  const width = Math.min(receipt?.assemblyItems ? 340 : 280, availableWidth - 24);
  const anchorX = target?.kind !== 'canvas' && targetRect ? targetRect.left - (rect?.left ?? 0) : attempt.destination.previewPoint.x;
  const anchorY = target?.kind !== 'canvas' && targetRect ? targetRect.top - (rect?.top ?? 0) : attempt.destination.previewPoint.y;
  const title = busy ? '正在投放…' : receipt?.message ?? (receipt?.status === 'success' ? '投放完成' : '投放未完成');
  const success = receipt?.status === 'success';
  return <section ref={panel} data-lcos-drop-receipt data-status={busy ? 'committing' : receipt?.status}
    className="lcos-drop-receipt" aria-label="投放结果"
    style={{ ...lcosGlassStyle, width, maxHeight: Math.min(280, availableHeight - 24), left: Math.max(12, Math.min(anchorX - width - 12, availableWidth - width - 12)),
      top: Math.max(12, Math.min(anchorY - height - 12, availableHeight - height - 12)) }}
    onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}
    onKeyDown={(event) => { if (event.key === 'Escape' && !busy) { event.preventDefault(); event.stopPropagation(); dismiss(); } }}>
    <div className="lcos-drop-receipt-heading" role={busy || success ? 'status' : 'alert'}>
      {busy ? <LoaderCircle size={17} className="lcos-drop-spinner" aria-hidden /> : success ? <Check size={17} aria-hidden /> : <span aria-hidden>!</span>}
      <span><strong>{title}</strong>{target && <small>{target.label}</small>}</span>
      {!busy && <Button variant="ghost" iconOnly title="关闭投放结果" aria-label="关闭投放结果" onClick={dismiss}><X size={16} /></Button>}
    </div>
    {!busy && receipt?.assemblyItems && <ul aria-label="逐项投放结果">
      {receipt.assemblyItems.map((item, index) => {
        const ref = [...bindings.values()].find((candidate) => item.sourceRef.kind === 'artifactView'
          ? candidate.entityType === 'view' && candidate.entityId === item.sourceRef.id
          : candidate.entityId === item.sourceRef.id && candidate.entityType === item.sourceRef.kind);
        const label = ref?.descriptor?.title || `材料 ${index + 1}`;
        return <li key={dropSourceKey(item.sourceRef)} data-outcome={itemStatus(item)}>
          <span><strong>{label}</strong>{item.message && <small>{item.message}</small>}</span><em>{itemStatus(item)}</em>
        </li>;
      })}
    </ul>}
    {!busy && Boolean(receipt?.retrySourceRefs?.length) && <Button variant="ghost" onClick={() => retry(crypto.randomUUID())}>
      <RotateCcw size={14} aria-hidden />只重试失败项（{receipt?.retrySourceRefs?.length}）
    </Button>}
  </section>;
}

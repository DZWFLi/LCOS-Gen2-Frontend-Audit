import { Check, FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { DropdownMenu, DropdownMenuItem } from '@/components/Common/DropdownMenu';
import useCanvasStore from '@/store/canvasStore';

import { referenceImageSource } from './referenceImageSource';
import { useLcosReferenceStore } from '../lcosReferenceState';
import { LcosNearfieldGlyph } from '../ui/nearfield/LcosNearfieldGlyph';
import { LcosIconButton } from '../ui/primitives/LcosIconButton';

import type { CoreEntityRefLike } from '../referenceBridge';

export function ComposerReferencePicker({ open, onOpenChange, disabled, onPicked, listOnly = false }: {
  readonly listOnly?: boolean;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly disabled: boolean;
  readonly onPicked: () => void;
}): React.JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const menu = menuRef.current;
      (menu?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? menu)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);
  const nodes = useCanvasStore((state) => state.nodes);
  const canvasId = useCanvasStore((state) => state.canvasId);
  const bindings = useLcosReferenceStore((state) => state.nodeEntityRefs);
  const references = useLcosReferenceStore((state) => state.draft.orderedEntityRefs);
  const candidates = new Map<string, { ref: CoreEntityRefLike; title: string; image?: string }>();
  for (const node of nodes) {
    const ref = bindings.get(node.id);
    if (!ref) continue;
    const data = node.data as Record<string, unknown>;
    const title = ref.descriptor?.title ?? data.label ?? data.title;
    candidates.set(ref.entityType + ':' + ref.entityId, {
      ref, title: typeof title === 'string' && title.trim() ? title : '未命名对象',
      ...(node.type === 'image' ? { image: referenceImageSource(data, canvasId ?? undefined) } : {}),
    });
  }
  return <DropdownMenu dismissOnEscape={false} open={open} onOpenChange={onOpenChange} align="top-left"
    className="lcos-composer-reference-picker"
    trigger={<LcosIconButton appearance="oreo" variant="secondary" className="lcos-composer-tool-hit"
      disabled={disabled} aria-haspopup="menu" aria-label={listOnly ? '从列表选择引用' : '引用画布对象'} title={listOnly ? '从列表选择引用' : '引用画布对象'}>
      <LcosNearfieldGlyph name={listOnly ? 'more' : 'at'} />
    </LcosIconButton>}>
    <div ref={menuRef} role="menu" aria-label="画布引用" tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onOpenChange(false);
          onPicked();
          return;
        }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')];
        if (!items.length) return;
        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }}>
    {candidates.size === 0 ? <p className="px-3 py-2 text-xs">当前画布还没有可引用的对象</p>
      : [...candidates].map(([key, item]) => {
        const included = references.some((ref) => ref.entityType === item.ref.entityType && ref.entityId === item.ref.entityId);
        return <DropdownMenuItem key={key} disabled={disabled || included}
          icon={item.image ? <img src={item.image} alt="" className="h-8 w-10 rounded-md object-cover" /> : <FileText size={20} />}
          trailing={included ? <Check size={14} aria-label="已引用" /> : undefined}
          onClick={() => {
            useLcosReferenceStore.getState().addEntityToDraft(item.ref);
            onOpenChange(false);
            onPicked();
          }}>
          <span className="block max-w-52 truncate">{item.title}</span>
        </DropdownMenuItem>;
      })}
    </div>
  </DropdownMenu>;
}

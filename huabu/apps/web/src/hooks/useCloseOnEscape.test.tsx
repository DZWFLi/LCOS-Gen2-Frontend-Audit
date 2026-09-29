import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { useCloseOnEscape } from './useCloseOnEscape';

function DismissLayer({ label, onClose }: { label: string; onClose: () => void }): React.JSX.Element {
  useCloseOnEscape(true, onClose);
  return <div data-layer={label} />;
}

let host: HTMLDivElement;
let rootA: Root;
let rootB: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  rootA = createRoot(host.appendChild(document.createElement('div')));
  rootB = createRoot(host.appendChild(document.createElement('div')));
});
afterEach(async () => {
  await act(async () => { rootB.unmount(); rootA.unmount(); });
  host.remove();
});

it('Escape dismisses only the most recently opened overlay, then the underlying one', async () => {
  const closeA = vi.fn();
  const closeB = vi.fn();
  await act(async () => rootA.render(<DismissLayer label="under" onClose={closeA} />));
  await act(async () => rootB.render(<DismissLayer label="top" onClose={closeB} />));

  const first = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  await act(async () => document.dispatchEvent(first));
  expect(first.defaultPrevented).toBe(true);
  expect(closeB).toHaveBeenCalledTimes(1);
  expect(closeA).not.toHaveBeenCalled();

  await act(async () => rootB.render(null));
  const second = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  await act(async () => document.dispatchEvent(second));
  expect(closeA).toHaveBeenCalledTimes(1);
});

it('leaves an Escape consumed by a deeper interaction untouched', async () => {
  const close = vi.fn();
  await act(async () => rootA.render(<DismissLayer label="under" onClose={close} />));
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  event.preventDefault();
  await act(async () => document.dispatchEvent(event));
  expect(close).not.toHaveBeenCalled();
});

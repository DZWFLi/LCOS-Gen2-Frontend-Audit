import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { LcosNavigatorIsland } from './LcosNavigatorIsland';
const search = vi.hoisted(() => vi.fn());
const where = vi.hoisted(() => vi.fn());
vi.mock('@local-creative-os/web-gen2', async (original) => ({ ...await original<typeof import('@local-creative-os/web-gen2')>(), CoreSearchClient: class { searchProject = search; } }));
vi.mock('../app/lcosCoreClient', () => ({ createLcosCoreSession: () => ({ http: {} }) }));
vi.mock('../shell/lcosShellStore', () => ({ useLcosShellStore: (select: (state: unknown) => unknown) => select({ windowEnvironment: null, requestFocusWhere: where }) }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { for (const root of roots.splice(0)) act(() => root.unmount()); document.body.replaceChildren(); vi.useRealTimers(); vi.clearAllMocks(); });
async function render() {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container); roots.push(root);
  await act(async () => root.render(<LcosNavigatorIsland projectId="p" canvasBySurface={{}} ensureCanvas={async () => undefined} />));
  return container;
}
async function query(container: HTMLElement, text = '材料') {
  await act(async () => container.querySelector<HTMLButtonElement>('button')?.click());
  const input = container.querySelector('input')!;
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text); input.dispatchEvent(new Event('input', { bubbles: true })); });
  await act(async () => vi.advanceTimersByTime(250));
  return input;
}
it('hands entity identity to full Where, never navigates to the first bounded search location', async () => {
  vi.useFakeTimers();
  search.mockResolvedValue({ hits: [{ entityType: 'artifact', entityId: 'a', title: '素材', locationRefs: [{ id: 'wrong-first' }] }] });
  const container = await render(); await query(container);
  await act(async () => container.querySelector<HTMLButtonElement>('[role="option"]')!.click());
  expect(where).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ entityId: 'a', entityType: 'artifact', title: '素材' }));
  expect(container.querySelector('input')).toBeNull();
});
it('keeps input mounted after failure and supports real retry', async () => {
  vi.useFakeTimers(); search.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ hits: [] });
  const container = await render(); const input = await query(container);
  expect(container.querySelector('input')).toBe(input); expect(input.value).toBe('材料');
  expect(container.textContent).toContain('搜索失败');
  await act(async () => container.querySelector<HTMLButtonElement>('[role="alert"] button')!.click());
  await act(async () => vi.advanceTimersByTime(250));
  expect(container.textContent).toContain('没有匹配');
});
it('supports arrow and Enter without choosing during IME composition', async () => {
  vi.useFakeTimers(); search.mockResolvedValue({ hits: [{ entityType: 'artifact', entityId: 'a' }, { entityType: 'artifact', entityId: 'b' }] });
  const container = await render(); const input = await query(container);
  await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
  await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
  expect(where).not.toHaveBeenCalled();
  await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  expect(where).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'b' }));
});
it('does not steal local editor Find and closes search on one Escape', async () => {
  const container = await render(); const editor = document.createElement('textarea'); document.body.append(editor);
  await act(async () => editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })));
  expect(container.querySelector('input')).toBeNull();
  await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, cancelable: true })));
  expect(container.querySelector('input')).not.toBeNull();
  await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  expect(container.querySelector('input')).toBeNull();
});
it('reacts to a resize without an unrelated state change', async () => {
  const original = window.innerWidth;
  const container = await render();
  await act(async () => { Object.defineProperty(window, 'innerWidth', { configurable: true, value: 640 }); window.dispatchEvent(new Event('resize')); });
  expect(parseFloat(container.querySelector<HTMLElement>('[data-lcos-navigator-island]')!.style.left) + 52 / 2).toBe(320);
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: original });
});

it('consumes Escape before a separate window bubble listener can close the underlying window', async () => {
  const container = await render();
  const closeWindow = vi.fn(); window.addEventListener('keydown', closeWindow);
  try {
    await act(async () => container.querySelector<HTMLButtonElement>('button')!.click());
    await act(async () => container.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    expect(container.querySelector('input')).toBeNull(); expect(closeWindow).not.toHaveBeenCalled();
  } finally { window.removeEventListener('keydown', closeWindow); }
});


it('uses the server truncated flag even when fewer than the client limit are returned', async () => {
  vi.useFakeTimers(); search.mockResolvedValue({ hits: [{ entityType: 'artifact', entityId: 'a' }], truncated: true });
  const container = await render(); await query(container);
  expect(container.textContent).toContain('还有匹配结果');
  expect(search).toHaveBeenCalledWith('p', expect.objectContaining({ limit: 50 }));
});
it('does not invent pagination or a truncation warning for a complete 50-result response', async () => {
  vi.useFakeTimers(); search.mockResolvedValue({ hits: Array.from({ length: 50 }, (_, i) => ({ entityType: 'artifact', entityId: String(i) })), truncated: false });
  const container = await render(); await query(container);
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(50);
  expect(container.textContent).not.toContain('还有匹配结果');
});

it('explains why a hit matched and reports only the server full location count', async () => {
  vi.useFakeTimers();
  search.mockResolvedValue({ hits: [{
    entityType: 'artifact', entityId: 'a', title: '材料', snippet: '包含风险评估',
    matchReason: 'body', locationCount: 7,
    locationRefs: Array.from({ length: 5 }, (_, index) => ({ kind: 'workspace', id: `legacy-${index}` })),
  }] });
  const container = await render(); await query(container);
  expect(container.querySelector('[data-lcos-search-match-reason]')?.textContent).toBe('正文匹配');
  expect(container.querySelector('[data-lcos-search-location-count]')?.textContent).toBe('出现在 7 个位置');
  expect(container.textContent).not.toContain('legacy-');
  expect(container.textContent).not.toMatch(/vector|FTS|embedding|score/i);
});

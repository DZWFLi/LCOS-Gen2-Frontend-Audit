import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { LcosPersistentLocatorOverlay } from './LcosPersistentLocatorOverlay';
const m = vi.hoisted(() => ({ requestLocate: vi.fn(), width: 1000, height: 800, x: 1800, viewport: { x: 0, y: 0, zoom: 1 }, nodes: [{ id: 'node', selected: true }],
  refs: new Map([['node', { entityId: 'a', entityType: 'artifact', displayLabel: '目标' }]]) }));
vi.mock('@xyflow/react', () => ({ useReactFlow: () => ({ getInternalNode: () => ({ measured: { width: 100, height: 100 }, internals: { positionAbsolute: { x: m.x, y: 300 } } }) }), useViewport: () => m.viewport }));
vi.mock('@/store/canvasStore', () => ({ default: (select: (s: unknown) => unknown) => select({ nodes: m.nodes, canvasId: 'canvas' }) }));
vi.mock('../lcosReferenceState', () => ({ useLcosReferenceStore: (select: (s: unknown) => unknown) => select({ nodeEntityRefs: m.refs }) }));
vi.mock('../pin/LcosColorPinProvider', () => ({ useOptionalLcosColorPins: () => null }));
vi.mock('../shell/lcosShellStore', () => ({ useLcosShellStore: (select: (s: unknown) => unknown) => select({ windowEnvironment: null, activeSurface: 'main', locateRequest: null, requestLocate: m.requestLocate }) }));
vi.mock('../ui/motion/useReducedSpatialMotion', () => ({ useReducedSpatialMotion: () => true }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { for (const root of roots.splice(0)) act(() => root.unmount()); document.body.replaceChildren(); vi.clearAllMocks(); m.x = 1800; m.width = 1000; m.height = 800; m.nodes = [{ id: 'node', selected: true }]; });
async function render() {
  const flow = document.createElement('div'); flow.className = 'react-flow'; document.body.append(flow);
  flow.getBoundingClientRect = () => new DOMRect(0, 0, m.width, m.height);
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container); roots.push(root);
  await act(async () => root.render(<LcosPersistentLocatorOverlay />)); return container;
}
it('renders a clickable real offscreen target and routes once to the existing camera request', async () => {
  const container = await render(); const button = container.querySelector<HTMLButtonElement>('[data-lcos-persistent-locator]');
  expect(button).not.toBeNull(); expect(button?.getAttribute('data-lcos-locator-kind')).toBe('selection');
  await act(async () => button!.click());
  expect(m.requestLocate).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ nodeId: 'node', canvasId: 'canvas', preserveSelection: true }));
});
it('does not duplicate the node-owned local marker inside the comfortable canvas area', async () => {
  m.x = 400; const container = await render(); expect(container.querySelector('button')).toBeNull();
});

it('keeps 24 same-ray production buttons individually clickable outside actual HUD bounds and reflows on resize', async () => {
  m.nodes=Array.from({length:24},(_,i)=>({id:`dense-${i}`,selected:true}));
  m.refs=new Map(m.nodes.map((n,i)=>[n.id,{entityId:`a-${i}`,entityType:'artifact',displayLabel:`测试材料 ${i+1}`}]));
  const hud=document.createElement('div');hud.setAttribute('data-lcos-nav-view','');document.body.append(hud);
  hud.getBoundingClientRect=()=>new DOMRect(m.width-190,200,190,210);
  const container=await render();
  const inspect=()=>{
    const buttons=[...container.querySelectorAll<HTMLButtonElement>('[data-lcos-persistent-locator]')];expect(buttons).toHaveLength(24);
    const rects=buttons.map(b=>({left:parseFloat(b.style.left)-parseFloat(b.style.width)/2,right:parseFloat(b.style.left)+parseFloat(b.style.width)/2,top:parseFloat(b.style.top)-22,bottom:parseFloat(b.style.top)+22}));
    const obstacle={left:m.width-190,right:m.width,top:200,bottom:410};
    for(const [i,a] of rects.entries())for(const b of [obstacle,...rects.slice(0,i)])expect(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top).toBe(false);
    for(const button of buttons)expect(button.firstElementChild?.getAttribute('style')).toContain('transition: none');
    return buttons;
  };
  for(const button of inspect())await act(async()=>button.click());
  expect(m.requestLocate.mock.calls.map(call=>call[0].nodeId)).toEqual(m.nodes.map(n=>n.id));
  expect(m.requestLocate.mock.calls.every(call=>call[0].canvasId==='canvas'&&call[0].preserveSelection)).toBe(true);
  m.width=390;m.height=844;
  Object.defineProperty(window,'innerWidth',{configurable:true,value:390});
  await act(async()=>{window.dispatchEvent(new Event('resize'));});
  inspect();
});

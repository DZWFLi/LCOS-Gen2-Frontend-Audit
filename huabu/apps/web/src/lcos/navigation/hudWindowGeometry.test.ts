import { expect, it } from 'vitest';
import { rectsOverlapV1 } from '@local-creative-os/web-gen2';
import { avoidHudWindows, cameraFitRect, cameraFitInsets } from './hudWindowGeometry';
const viewport = { x: 0, y: 0, width: 1024, height: 768 };
it('keeps preferred HUD positions when unobscured and moves their whole rectangle out of two windows', () => {
  const hud = { x: 420, y: 24, width: 184, height: 48 };
  expect(avoidHudWindows(hud, null, viewport)).toEqual(hud);
  const occupiedRects = [{ x: 350, y: 10, width: 300, height: 240 }, { x: 20, y: 10, width: 300, height: 300 }];
  const result = avoidHudWindows(hud, { safeRect: viewport, occupiedRects, activeRegionId: undefined }, viewport);
  expect(occupiedRects.some((rect) => rectsOverlapV1(result, rect))).toBe(false);
  expect(result.x).toBeGreaterThanOrEqual(8); expect(result.y).toBeGreaterThanOrEqual(8);
});
it('fits inside the real docked safe rect and avoids a floating window', () => {
  const environment = { safeRect: { ...viewport, width: 700 }, occupiedRects: [{ x: 490, y: 280, width: 200, height: 400 }], activeRegionId: undefined };
  const fit = cameraFitRect(viewport, environment)!;
  expect(fit.x + fit.width).toBeLessThanOrEqual(700);
  expect(rectsOverlapV1(fit, environment.occupiedRects[0]!)).toBe(false);
  const inset = cameraFitInsets(viewport, environment)!;
  expect(inset.left + fit.width + inset.right).toBe(1024);
});
it('does not fabricate a fit destination when windows cover all available canvas space', () => {
  expect(cameraFitRect(viewport, { safeRect: viewport, occupiedRects: [viewport], activeRegionId: undefined })).toBeNull();
});

it('keeps the narrow search island clear of the project capsule without moving the canvas', () => {
  const narrow = { width: 390, height: 844 };
  const capsule = { x: 24, y: 24, width: 256, height: 44 };
  const result = avoidHudWindows({ x: 147, y: 24, width: 96, height: 48 }, null, narrow, [capsule]);
  expect(rectsOverlapV1(result, capsule)).toBe(false);
  expect(result.x).toBeGreaterThanOrEqual(8);
  expect(result.x + result.width).toBeLessThanOrEqual(382);
});
it('lets the expanded spatial navigator and secondary tools clear the permanent Surface Dock', () => {
  const narrow = { width: 360, height: 800 };
  const dock = { x: 91, y: 718, width: 178, height: 58 };
  const camera = avoidHudWindows({ x: 24, y: 524, width: 232, height: 252 }, null, narrow, [dock]);
  const tools = avoidHudWindows({ x: 232, y: 728, width: 104, height: 48 }, null, narrow, [dock, camera]);
  expect(rectsOverlapV1(camera, dock)).toBe(false);
  expect(rectsOverlapV1(tools, dock)).toBe(false);
  expect(rectsOverlapV1(tools, camera)).toBe(false);
});

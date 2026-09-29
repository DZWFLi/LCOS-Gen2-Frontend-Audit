import { useLayoutEffect, useState } from 'react';

import { createWindowRegion, normalizeWindowRegion, windowIdsForRegion } from '../shell/windowRegionTopology';
import { needsCompactProfessionalStageV1, professionalFloatingBoundsV1 } from './professionalWindowStageLayout';

import type { ProfessionalRectV1 } from '@local-creative-os/web-gen2';
import type { LcosWindow } from '../shell/lcosShellStore';
import type { WindowRegionInput } from '../shell/windowRegionTopology';

export function currentProfessionalViewport(): ProfessionalRectV1 {
  if (typeof window === 'undefined') return { x: 0, y: 0, width: 0, height: 0 };
  return {
    x: 0,
    y: 0,
    width: window.innerWidth || document.documentElement.clientWidth || 0,
    height: window.innerHeight || document.documentElement.clientHeight || 0,
  };
}

/** Shared viewport source and resize lifecycle for Stage and its overlay callers. */
export function useProfessionalViewport(): ProfessionalRectV1 {
  const [viewport, setViewport] = useState(currentProfessionalViewport);
  useLayoutEffect(() => {
    const updateViewport = (): void => {
      const next = currentProfessionalViewport();
      setViewport((previous) => previous.width === next.width && previous.height === next.height ? previous : next);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  return viewport;
}

function preferredWidthFor(window: LcosWindow): number {
  return window.bodyKey === 'reader' ? 1120 : window.bodyKey === 'assembly' ? 640 : 520;
}

/**
 * The single visibility projection used by both ProfessionalWindowStage and
 * canvas-local overlay owners. It mirrors Stage's synthesized singleton
 * regions for windows that predate/are not yet assigned to a saved region.
 */
export function visibleWindowIdsForStage(
  windows: readonly LcosWindow[],
  regions: readonly WindowRegionInput[],
  viewport: ProfessionalRectV1,
): { readonly compact: boolean; readonly windowIds: readonly string[] } {
  const windowsById = new Map(windows.map((window) => [window.id, window]));
  const assignedIds = new Set(regions.flatMap(windowIdsForRegion));
  const effectiveRegions = [
    ...regions.map(normalizeWindowRegion),
    ...windows
      .filter((window) => !assignedIds.has(window.id))
      .map((window) => createWindowRegion(`region-${window.id}`, [window.id], window.id)),
  ];

  const regionEntries = effectiveRegions.flatMap((region) => region.groups.flatMap((group) => {
    const groupWindows = group.windowIds
      .map((windowId) => windowsById.get(windowId))
      .filter((window): window is LcosWindow => window !== undefined);
    const activeWindow = groupWindows.find((window) => window.id === group.activeWindowId)
      ?? groupWindows[groupWindows.length - 1];
    return activeWindow === undefined ? [] : [{ region, activeWindow, preferredWidth: preferredWidthFor(activeWindow) }];
  }));
  const layoutEntries = effectiveRegions.flatMap((region) => {
    const groups = regionEntries.filter((entry) => entry.region.id === region.id);
    if (groups.length === 0) return [];
    const preferredWidth = Math.max(...groups.map((entry) => entry.preferredWidth),
      region.splitDirection === 'vertical' ? 720 : 0);
    return [{
      regionId: region.id,
      layout: region.layout,
      preferredWidth,
      ...(region.dockWidth === undefined ? {} : { dockWidth: region.dockWidth }),
    }];
  });
  const compact = effectiveRegions.some((region) => {
    if (region.splitDirection === undefined) return false;
    const bounds = region.layout === 'docked-right' ? viewport : professionalFloatingBoundsV1(viewport);
    const width = Math.min(bounds.width,
      region.layout === 'docked-right' ? region.dockWidth ?? bounds.width : region.rect?.width ?? bounds.width);
    const height = Math.min(bounds.height, region.layout === 'floating' ? region.rect?.height ?? bounds.height : bounds.height);
    // A split is still one physical region. The multi-region capacity check
    // cannot detect two unreadable columns inside a single narrow window.
    return region.splitDirection === 'vertical' ? width < 720 : height < 560;
  }) || needsCompactProfessionalStageV1(viewport, layoutEntries);

  if (compact) {
    const activeWindow = windows.find((window) => window.active) ?? windows[windows.length - 1];
    return { compact, windowIds: activeWindow === undefined ? [] : [activeWindow.id] };
  }
  return { compact, windowIds: regionEntries.map(({ activeWindow }) => activeWindow.id) };
}

import type { Node } from '@xyflow/react';
import type { CanvasNodeGeometryUpdate } from '@huabu/shared';

export interface CollectionLayoutRect {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const overlaps = (a: CollectionLayoutRect, b: CollectionLayoutRect, gap = 18): boolean =>
  a.x < b.x + b.width + gap && a.x + a.width + gap > b.x
  && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;

/** Gen1 Collection fan-out adapted to Huabu geometry commands: preserve each
 * member's measured size, place columns to the right, and walk down around
 * unrelated nodes. It returns geometry only; it never changes membership. */
export function layoutCollectionMembers(
  container: CollectionLayoutRect,
  members: readonly CollectionLayoutRect[],
  obstacles: readonly CollectionLayoutRect[],
): CanvasNodeGeometryUpdate[] {
  const gapX = 42;
  const gapY = 24;
  const columnGap = 30;
  const maxColumns = 3;
  const ordered = [...members].sort((a, b) =>
    Math.abs(a.y - container.y) - Math.abs(b.y - container.y) || a.y - b.y || a.x - b.x);
  const placed: CollectionLayoutRect[] = [];
  const updates: CanvasNodeGeometryUpdate[] = [];
  let column = 0;
  let x = container.x + container.width + gapX;
  let y = container.y;
  let columnWidth = 0;
  const columnStartY = y;
  const maxColumnHeight = Math.max(560, container.height * 3.2);

  for (const member of ordered) {
    if (y > columnStartY + maxColumnHeight && column + 1 < maxColumns) {
      column += 1;
      x += columnWidth + columnGap;
      y = columnStartY;
      columnWidth = 0;
    }
    let candidate = { ...member, x, y };
    let attempts = 0;
    while ((placed.some((other) => overlaps(candidate, other)) || obstacles.some((other) => overlaps(candidate, other))) && attempts < 30) {
      candidate = { ...candidate, y: candidate.y + Math.max(28, gapY) };
      attempts += 1;
      if (candidate.y > columnStartY + maxColumnHeight && column + 1 < maxColumns) {
        column += 1;
        x += Math.max(columnWidth, member.width) + columnGap;
        candidate = { ...candidate, x, y: columnStartY };
        columnWidth = 0;
      }
    }
    updates.push({ nodeId: member.id as CanvasNodeGeometryUpdate['nodeId'], position: { x: candidate.x, y: candidate.y } });
    placed.push(candidate);
    columnWidth = Math.max(columnWidth, member.width);
    y = candidate.y + member.height + gapY;
  }
  return updates;
}

function nodeRect(node: Node): CollectionLayoutRect {
  const style = node.style ?? {};
  const width = node.measured?.width ?? node.width ?? (typeof style.width === 'number' ? style.width : 0);
  const height = node.measured?.height ?? node.height ?? (typeof style.height === 'number' ? style.height : 0);
  return { id: node.id, x: node.position.x, y: node.position.y, width, height };
}

export function collectionExpansionGeometry(
  nodes: readonly Node[],
  containerId: string,
  memberIds: readonly string[],
  additionalObstacleIds: readonly string[] = [],
): CanvasNodeGeometryUpdate[] {
  const container = nodes.find((node) => node.id === containerId);
  if (!container) return [];
  const members = nodes.filter((node) => memberIds.includes(node.id) && !node.parentId).map(nodeRect);
  if (members.length === 0) return [];
  const included = new Set([containerId, ...memberIds]);
  const extraObstacles = new Set(additionalObstacleIds);
  const obstacles = nodes.filter((node) => !included.has(node.id) && (!node.parentId || extraObstacles.has(node.id))).map(nodeRect);
  return layoutCollectionMembers(nodeRect(container), members, obstacles);
}

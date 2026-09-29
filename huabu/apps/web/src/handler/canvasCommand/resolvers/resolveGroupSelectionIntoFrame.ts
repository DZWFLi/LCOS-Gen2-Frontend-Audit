// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createId, type CanvasCommand, type CanvasNodeId } from '@huabu/shared';
import { frameNodes, type NestableNode } from '@huabu/shared/canvas-engine';

import { getSelectedNodeIds } from '../utils';

import type {
  CanvasUiIntent,
  UiIntentResolution,
  UiResolverState,
} from '../uiIntent';

export default function resolveGroupSelectionIntoFrame(
  _intent: Extract<CanvasUiIntent, { type: 'GROUP_SELECTION_INTO_FRAME' }>,
  ui: UiResolverState,
): UiIntentResolution {
  const selectedIds = getSelectedNodeIds(ui.nodes);
  const commands: CanvasCommand[] = [];

  if (selectedIds.length < (_intent.collectionId ? 1 : 2)) {
    return { commands, trace: [] };
  }

  const frameId = createId('node');
  const frameLabel = _intent.frameLabel?.trim() || 'Frame';
  const geometryById = new Map((_intent.geometryUpdates ?? []).map((item) => [item.nodeId, item]));
  const layoutNodes = ui.nodes.map((node) => {
    const update = geometryById.get(node.id as CanvasNodeId);
    return update?.position ? { ...node, position: update.position } : node;
  });
  const result = frameNodes(layoutNodes as NestableNode[], selectedIds, {
    frameId,
    label: frameLabel,
  });

  if (_intent.geometryUpdates?.length) {
    commands.push({ type: 'SET_NODE_GEOMETRY', items: [..._intent.geometryUpdates] });
  }

  const frameNode = result.nodes.find((n) => n.id === frameId);
  if (frameNode) {
    commands.push({
      type: 'CREATE_NODES',
      nodes: [
        {
          id: frameId as CanvasNodeId,
          nodeType: 'frame',
          data: { label: frameLabel, origin: { type: 'user-created' }, ...(_intent.collectionId ? { lcosCollectionId: _intent.collectionId } : {}), ...(_intent.collectionNodeId ? { lcosCollectionNodeId: _intent.collectionNodeId } : {}) } as never,
          position: frameNode.position,
          size: {
            width: (frameNode.style as Record<string, number>)?.width ?? 400,
            height: (frameNode.style as Record<string, number>)?.height ?? 300,
          },
        },
      ],
    });
  }

  commands.push({
    type: 'SET_NODE_PARENT',
    nodeIds: selectedIds as CanvasNodeId[],
    parentId: frameId as CanvasNodeId,
  });

  commands.push({
    type: 'SET_NODE_SELECTION',
    nodeIds: [_intent.collectionNodeId ? _intent.collectionNodeId as CanvasNodeId : frameId as CanvasNodeId],
  });

  return {
    commands,
    trace: [
      {
        action: 'node_created' as const,
        nodes: [{ id: frameId, type: 'frame' as const, label: frameLabel }],
      },
    ],
  };
}

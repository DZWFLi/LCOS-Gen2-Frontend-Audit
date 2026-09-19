// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Thin server-to-server control facade for LCOS continuation.
 *
 * The agentlet daemon still owns the `/api/acp/agent` WebSocket and sends
 * `agentlet/hello`. This route is the Huabu Host owner for Local Core: it
 * delegates to the mounted in-process AgentletGateway and never creates a
 * second gateway, socket, or session registry.
 */

import { getAgentletGateway } from '@agenetes/agentlet-host';

import type { AgentletConnection } from '@agenetes/agentlet-host';
import type { SpawnParams } from '@agentlet/protocol';
import type { FastifyPluginAsync } from 'fastify';

interface AgentletParams {
  agentletId: string;
}

interface SessionParams extends AgentletParams {
  sessionId: string;
}

interface SpawnBody {
  readonly appId?: unknown;
  readonly sessionId?: unknown;
  readonly sessionSpec?: unknown;
}

interface ContinuationErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

function errorBody(code: string, message: string): ContinuationErrorBody {
  return { error: { code, message } };
}

function connectedGateway(
  agentletId: string,
):
  | { ok: true; gateway: NonNullable<ReturnType<typeof getAgentletGateway>> }
  | { ok: false; status: 503; body: ContinuationErrorBody } {
  const gateway = getAgentletGateway();
  if (gateway === null) {
    return {
      ok: false,
      status: 503,
      body: errorBody(
        'bridge_not_mounted',
        'Huabu Agentlet Gateway is not mounted.',
      ),
    };
  }
  const agentlet = gateway.getAgentlet(agentletId);
  if (agentlet === undefined || agentlet.status !== 'connected') {
    return {
      ok: false,
      status: 503,
      body: errorBody(
        'placement_unavailable',
        `Agentlet ${agentletId} is not connected.`,
      ),
    };
  }
  return { ok: true, gateway };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asSpawnParams(body: SpawnBody): SpawnParams | undefined {
  if (typeof body.appId !== 'string' || body.appId.trim() === '')
    return undefined;
  if (!isRecord(body.sessionSpec)) return undefined;
  if (body.sessionId !== undefined && typeof body.sessionId !== 'string')
    return undefined;
  return {
    appId: body.appId,
    ...(body.sessionId === undefined ? {} : { sessionId: body.sessionId }),
    // The protocol owns the exact SessionSpec shape. The route only checks
    // that it received an object and leaves agent-team variants intact.
    sessionSpec: body.sessionSpec as SpawnParams['sessionSpec'],
  };
}

function projectSession(connection: AgentletConnection): {
  readonly agentletId: string;
  readonly sessionId: string;
  readonly appId?: string;
  readonly pid?: number;
  readonly cwd?: string;
  readonly status: string;
} {
  const profile = connection.sessionProfile;
  return {
    agentletId: connection.agentletId,
    sessionId: connection.sessionId,
    ...(typeof profile?.appId === 'string' ? { appId: profile.appId } : {}),
    ...(profile?.agent === undefined
      ? {}
      : { pid: profile.agent.pid, cwd: profile.agent.cwd }),
    status: connection.status,
  };
}

const continuationTransportRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: AgentletParams }>(
    '/continuation/agentlets/:agentletId/sessions',
    async (request, reply) => {
      const target = connectedGateway(request.params.agentletId);
      if (!target.ok) return reply.status(target.status).send(target.body);
      try {
        const result = await target.gateway.listOnAgentlet(
          request.params.agentletId,
        );
        return { agentletId: request.params.agentletId, agents: result.agents };
      } catch (error: unknown) {
        return reply
          .status(503)
          .send(
            errorBody(
              'gateway_list_failed',
              error instanceof Error ? error.message : String(error),
            ),
          );
      }
    },
  );

  app.post<{ Params: AgentletParams; Body: SpawnBody }>(
    '/continuation/agentlets/:agentletId/sessions',
    async (request, reply) => {
      const input = asSpawnParams(request.body ?? {});
      if (input === undefined) {
        return reply
          .status(400)
          .send(
            errorBody(
              'invalid_spawn_request',
              'appId and sessionSpec are required.',
            ),
          );
      }
      const target = connectedGateway(request.params.agentletId);
      if (!target.ok) return reply.status(target.status).send(target.body);
      try {
        const result = await target.gateway.spawnOnAgentlet(
          request.params.agentletId,
          input,
        );
        return { agentletId: request.params.agentletId, ...result };
      } catch (error: unknown) {
        return reply
          .status(503)
          .send(
            errorBody(
              'gateway_spawn_failed',
              error instanceof Error ? error.message : String(error),
            ),
          );
      }
    },
  );

  app.get<{ Params: SessionParams }>(
    '/continuation/agentlets/:agentletId/sessions/:sessionId',
    async (request, reply) => {
      const target = connectedGateway(request.params.agentletId);
      if (!target.ok) return reply.status(target.status).send(target.body);
      const session = target.gateway.getSession(
        request.params.agentletId,
        request.params.sessionId,
      );
      if (session === undefined) {
        return reply
          .status(404)
          .send(
            errorBody('session_not_found', 'Agentlet session was not found.'),
          );
      }
      return projectSession(session);
    },
  );

  app.post<{ Params: SessionParams }>(
    '/continuation/agentlets/:agentletId/sessions/:sessionId/stop',
    async (request, reply) => {
      const target = connectedGateway(request.params.agentletId);
      if (!target.ok) return reply.status(target.status).send(target.body);
      try {
        const result = await target.gateway.stopOnAgentlet(
          request.params.agentletId,
          { sessionId: request.params.sessionId },
        );
        return {
          agentletId: request.params.agentletId,
          sessionId: request.params.sessionId,
          ...result,
        };
      } catch (error: unknown) {
        return reply
          .status(503)
          .send(
            errorBody(
              'gateway_stop_failed',
              error instanceof Error ? error.message : String(error),
            ),
          );
      }
    },
  );
};

export default continuationTransportRoutes;

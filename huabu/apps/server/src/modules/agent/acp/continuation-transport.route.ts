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

import {
  acpSessionRegistry,
  ensureAcpSession,
  promptExistingAcpSession,
} from '@agenetes/acp-driver';
import { getAgentletGateway } from '@agenetes/agentlet-host';

import {
  forwardAcpPermissionRequestToCore,
  type LcosRunCorrelation,
} from './provider-run-event-sink.js';
import {
  answerProviderRunInput,
  registerProviderRunInput,
  removeProviderRunInput,
} from './provider-run-input-registry.js';

import type { PermissionNotifier } from '@agenetes/acp-driver';
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
  readonly externalSessionId?: unknown;
  readonly sessionSpec?: unknown;
  readonly threadId?: unknown;
  readonly runtimeScope?: unknown;
}

interface PromptBody {
  readonly threadId?: unknown;
  readonly externalSessionId?: unknown;
  readonly text?: unknown;
  readonly runtimeScope?: unknown;
  readonly runCorrelation?: unknown;
}

interface AnswerProviderInputBody {
  readonly correlation?: unknown;
  readonly requestId?: unknown;
  readonly selectedOptions?: unknown;
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
  if (
    body.externalSessionId !== undefined &&
    typeof body.externalSessionId !== 'string'
  )
    return undefined;
  return {
    appId: body.appId,
    ...(body.sessionId === undefined ? {} : { sessionId: body.sessionId }),
    // The protocol owns the exact SessionSpec shape. The route only checks
    // that it received an object and leaves agent-team variants intact.
    sessionSpec: body.sessionSpec as SpawnParams['sessionSpec'],
  };
}

function asThreadId(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

function asPromptBody(body: PromptBody):
  | {
      readonly threadId: string;
      readonly externalSessionId: string;
      readonly text: string;
      readonly runtimeScope?: string;
      readonly runCorrelation?: LcosRunCorrelation;
    }
  | undefined {
  const threadId = asThreadId(body.threadId);
  const externalSessionId = asThreadId(body.externalSessionId);
  if (
    threadId === undefined ||
    externalSessionId === undefined ||
    typeof body.text !== 'string' ||
    body.text.trim() === ''
  )
    return undefined;
  if (
    body.runCorrelation !== undefined &&
    (!isRecord(body.runCorrelation) ||
      typeof body.runCorrelation.lcosRunId !== 'string' ||
      body.runCorrelation.lcosRunId.trim() === '' ||
      typeof body.runCorrelation.externalTaskId !== 'string' ||
      body.runCorrelation.externalTaskId.trim() === '' ||
      Object.keys(body.runCorrelation).some(
        (key) => !['lcosRunId', 'externalTaskId'].includes(key),
      ))
  ) {
    return undefined;
  }
  return {
    threadId,
    externalSessionId,
    text: body.text,
    ...(typeof body.runtimeScope === 'string' && body.runtimeScope.trim() !== ''
      ? { runtimeScope: body.runtimeScope.trim() }
      : {}),
    ...(isRecord(body.runCorrelation) &&
    typeof body.runCorrelation.lcosRunId === 'string' &&
    body.runCorrelation.lcosRunId.trim() !== '' &&
    typeof body.runCorrelation.externalTaskId === 'string' &&
    body.runCorrelation.externalTaskId.trim() !== ''
      ? {
          runCorrelation: {
            lcosRunId: body.runCorrelation.lcosRunId.trim(),
            externalTaskId: body.runCorrelation.externalTaskId.trim(),
          },
        }
      : {}),
  };
}

async function ensureContinuationOwner(
  app: Parameters<FastifyPluginAsync>[0],
  agentletId: string,
  threadId: string,
  sessionSpec: Extract<SpawnParams['sessionSpec'], { command?: string }>,
  runtimeScope: string | undefined,
  priorSessionId?: string,
) {
  const command = sessionSpec.command;
  if (typeof command !== 'string' || command.trim() === '')
    throw new Error('Continuation ACP owner requires an ACP command.');
  return ensureAcpSession({
    agentletId,
    threadId,
    binding: {
      alias: 'LCOS continuation',
      profileId: `continuation:${threadId}`,
    },
    cwd: sessionSpec.cwd,
    recipe: {
      command,
      cwd: sessionSpec.cwd,
      autoRestart: true,
      alias: 'LCOS continuation',
    },
    namespace: { name: runtimeScope ?? threadId },
    ...(priorSessionId === undefined ? {} : { priorSessionId }),
    logger: app.log,
  });
}

function projectSession(connection: AgentletConnection): {
  readonly agentletId: string;
  readonly sessionId: string;
  readonly externalSessionId?: string;
  readonly transportSessionId: string;
  readonly appId?: string;
  readonly pid?: number;
  readonly cwd?: string;
  readonly status: string;
  readonly threadId?: string;
} {
  const profile = connection.sessionProfile;
  const threadId = asThreadId(profile?.appId);
  const owner =
    threadId === undefined
      ? undefined
      : acpSessionRegistry.get(connection.agentletId, threadId);
  return {
    agentletId: connection.agentletId,
    sessionId: connection.sessionId,
    transportSessionId: connection.sessionId,
    ...(owner === undefined ? {} : { externalSessionId: owner.sessionId }),
    ...(typeof profile?.appId === 'string' ? { appId: profile.appId } : {}),
    ...(profile?.agent === undefined
      ? {}
      : { pid: profile.agent.pid, cwd: profile.agent.cwd }),
    status: connection.status,
    ...(threadId === undefined ? {} : { threadId }),
  };
}

const continuationTransportRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: AnswerProviderInputBody }>(
    '/continuation/input-request',
    async (request, reply) => {
      const body = request.body ?? {};
      const correlation = isRecord(body.correlation)
        ? body.correlation
        : undefined;
      if (
        correlation === undefined ||
        typeof correlation.lcosRunId !== 'string' ||
        correlation.lcosRunId.trim() === '' ||
        typeof correlation.externalTaskId !== 'string' ||
        correlation.externalTaskId.trim() === '' ||
        typeof body.requestId !== 'string' ||
        body.requestId.trim() === '' ||
        !Array.isArray(body.selectedOptions) ||
        body.selectedOptions.some((value) => typeof value !== 'string')
      ) {
        return reply
          .status(400)
          .send(
            errorBody(
              'invalid_input_response',
              'Run correlation, requestId and selectedOptions are required.',
            ),
          );
      }
      const result = answerProviderRunInput(
        {
          lcosRunId: correlation.lcosRunId.trim(),
          externalTaskId: correlation.externalTaskId.trim(),
        },
        body.requestId.trim(),
        body.selectedOptions as string[],
      );
      if (result === 'not_found') {
        return reply
          .status(404)
          .send(
            errorBody(
              'provider_input_not_found',
              'No suspended ACP permission request matches this Run correlation.',
            ),
          );
      }
      if (result !== 'answered') {
        return reply
          .status(409)
          .send(
            errorBody(
              result,
              'The selected option cannot resolve this ACP permission request.',
            ),
          );
      }
      return { handled: true };
    },
  );

  app.get<{ Params: AgentletParams }>(
    '/continuation/agentlets/:agentletId/sessions',
    async (request, reply) => {
      const target = connectedGateway(request.params.agentletId);
      if (!target.ok) return reply.status(target.status).send(target.body);
      try {
        const result = await target.gateway.listOnAgentlet(
          request.params.agentletId,
        );
        return {
          agentletId: request.params.agentletId,
          agents: result.agents.map((agent) => {
            const connection = target.gateway.getSession(
              request.params.agentletId,
              agent.sessionId,
            );
            return connection === undefined
              ? agent
              : projectSession(connection);
          }),
        };
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
        const threadId = asThreadId((request.body ?? {}).threadId);
        if (threadId !== undefined) {
          const body = request.body ?? {};
          const owner = await ensureContinuationOwner(
            app,
            request.params.agentletId,
            threadId,
            input.sessionSpec as Extract<
              SpawnParams['sessionSpec'],
              { command?: string }
            >,
            typeof body.runtimeScope === 'string'
              ? body.runtimeScope
              : undefined,
            asThreadId(body.externalSessionId),
          );
          const connection = target.gateway.getSession(
            request.params.agentletId,
            owner.sessionId,
          );
          return {
            agentletId: request.params.agentletId,
            sessionId: owner.sessionId,
            externalSessionId: owner.sessionId,
            transportSessionId: owner.sessionId,
            threadId,
            ...(connection?.sessionProfile?.agent?.pid === undefined
              ? {}
              : { pid: connection.sessionProfile.agent.pid }),
            ...(connection?.sessionProfile?.agent?.cwd === undefined
              ? {}
              : { cwd: connection.sessionProfile.agent.cwd }),
          };
        }
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
        const session = target.gateway.getSession(
          request.params.agentletId,
          request.params.sessionId,
        );
        const threadId = asThreadId(session?.sessionProfile?.appId);
        const result = await target.gateway.stopOnAgentlet(
          request.params.agentletId,
          { sessionId: request.params.sessionId },
        );
        if (threadId !== undefined)
          acpSessionRegistry.remove(request.params.agentletId, threadId);
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

  app.post<{ Params: SessionParams; Body: PromptBody }>(
    '/continuation/agentlets/:agentletId/sessions/:sessionId/prompt',
    async (request, reply) => {
      const target = connectedGateway(request.params.agentletId);
      if (!target.ok) return reply.status(target.status).send(target.body);
      const input = asPromptBody(request.body ?? {});
      if (input === undefined)
        return reply
          .status(400)
          .send(
            errorBody(
              'invalid_prompt_request',
              'threadId, externalSessionId and text are required.',
            ),
          );
      const connection = target.gateway.getSession(
        request.params.agentletId,
        request.params.sessionId,
      );
      if (connection === undefined)
        return reply
          .status(404)
          .send(
            errorBody('session_not_found', 'Agentlet session was not found.'),
          );
      const profileThreadId = asThreadId(connection.sessionProfile?.appId);
      if (profileThreadId !== undefined && profileThreadId !== input.threadId) {
        return reply
          .status(409)
          .send(
            errorBody(
              'thread_session_mismatch',
              'Transport session is bound to another Core thread.',
            ),
          );
      }
      const owner = acpSessionRegistry.get(
        request.params.agentletId,
        input.threadId,
      );
      if (owner === undefined || owner.client.isClosed) {
        return reply
          .status(409)
          .send(
            errorBody(
              'acp_owner_not_found',
              'No live Huabu ACP owner exists for this Core thread.',
            ),
          );
      }
      if (owner.sessionId !== input.externalSessionId) {
        return reply
          .status(409)
          .send(
            errorBody(
              'acp_session_mismatch',
              'ACP native session does not match the canonical owner.',
            ),
          );
      }
      const runCorrelation = input.runCorrelation;
      const registeredRequestIds = new Set<string>();
      try {
        const result = await promptExistingAcpSession(
          owner,
          input.text,
          undefined,
          runCorrelation === undefined
            ? undefined
            : (permissionRequest: Parameters<PermissionNotifier>[0]) => {
                const coreBaseUrl = process.env.LCOS_CORE_URL;
                const coreApiToken = process.env.LOCAL_CORE_API_TOKEN;
                if (
                  coreBaseUrl === undefined ||
                  coreBaseUrl.trim() === '' ||
                  coreApiToken === undefined ||
                  coreApiToken.trim() === ''
                ) {
                  app.log.error(
                    'LCOS_CORE_URL and LOCAL_CORE_API_TOKEN are required to forward a correlated ACP permission request.',
                  );
                  owner.client.resolvePermission(permissionRequest.requestId, {
                    cancelled: true,
                  });
                  return;
                }
                registerProviderRunInput(
                  runCorrelation,
                  permissionRequest.requestId,
                  permissionRequest.options.map((option) => option.optionId),
                  owner,
                );
                registeredRequestIds.add(permissionRequest.requestId);
                void forwardAcpPermissionRequestToCore(
                  coreBaseUrl,
                  coreApiToken,
                  runCorrelation,
                  permissionRequest,
                ).catch((error: unknown) => {
                  removeProviderRunInput(
                    runCorrelation,
                    permissionRequest.requestId,
                  );
                  registeredRequestIds.delete(permissionRequest.requestId);
                  app.log.error(
                    { err: error },
                    'Failed to forward ACP permission request to Local Core.',
                  );
                  // A mismatched or unavailable Core never becomes implicit
                  // approval. Resolve the exact suspended request as denied.
                  owner.client.resolvePermission(permissionRequest.requestId, {
                    cancelled: true,
                  });
                });
              },
        );
        return {
          threadId: input.threadId,
          externalSessionId: owner.sessionId,
          transportSessionId: connection.sessionId,
          text: result.text,
          stopReason: result.stopReason,
        };
      } catch (error: unknown) {
        return reply
          .status(503)
          .send(
            errorBody(
              'acp_prompt_failed',
              error instanceof Error ? error.message : String(error),
            ),
          );
      } finally {
        if (runCorrelation !== undefined) {
          for (const requestId of registeredRequestIds) {
            removeProviderRunInput(runCorrelation, requestId);
          }
        }
      }
    },
  );
};

export default continuationTransportRoutes;

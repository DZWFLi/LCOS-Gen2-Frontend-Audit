// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  gateway: null as {
    getAgentlet: (
      agentletId: string,
    ) => { status: 'connected' | 'disconnected' } | undefined;
    listOnAgentlet: ReturnType<typeof vi.fn>;
    spawnOnAgentlet: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
    stopOnAgentlet: ReturnType<typeof vi.fn>;
  } | null,
}));

vi.mock('@agenetes/agentlet-host', () => ({
  getAgentletGateway: () => mocks.gateway,
}));

import continuationTransportRoutes from './continuation-transport.route.js';

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
  mocks.gateway = null;
  vi.clearAllMocks();
});

function connectedGateway() {
  const session = {
    sessionId: 'session-1',
    agentletId: 'machine-a',
    role: 'agent-session' as const,
    metadata: {},
    status: 'connected' as const,
    connectedAt: new Date(0),
    sessionProfile: {
      appId: 'run-1',
      agentletId: 'machine-a',
      agent: { pid: 42, cwd: 'E:/work', command: 'codex --acp' },
    },
    agentletProfile: undefined,
    send: () => undefined,
    onMessage: () => undefined,
    onLifecycle: () => undefined,
    disconnect: () => undefined,
  };
  mocks.gateway = {
    getAgentlet: () => ({ status: 'connected' }),
    listOnAgentlet: vi.fn(async () => ({
      agents: [
        {
          sessionId: 'session-1',
          appId: 'run-1',
          pid: 42,
          cwd: 'E:/work',
          status: 'running',
        },
      ],
    })),
    spawnOnAgentlet: vi.fn(async () => ({
      sessionId: 'session-2',
      pid: 43,
      cwd: 'E:/work',
    })),
    getSession: vi.fn(() => session),
    stopOnAgentlet: vi.fn(async () => ({ stopped: true })),
  };
  return mocks.gateway;
}

describe('ACP continuation Host transport facade', () => {
  it('delegates list, spawn, status and stop to the mounted Gateway', async () => {
    const gateway = connectedGateway();
    app = Fastify({ logger: false });
    await app.register(continuationTransportRoutes, { prefix: '/api/acp' });

    const list = await app.inject({
      method: 'GET',
      url: '/api/acp/continuation/agentlets/machine-a/sessions',
    });
    const spawn = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions',
      payload: {
        appId: 'run-2',
        sessionSpec: { command: 'codex --acp', cwd: 'E:/work' },
      },
    });
    const status = await app.inject({
      method: 'GET',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/session-1',
    });
    const stop = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/session-1/stop',
    });

    expect(list.statusCode).toBe(200);
    expect(list.json()).toMatchObject({
      agentletId: 'machine-a',
      agents: [{ sessionId: 'session-1' }],
    });
    expect(spawn.statusCode).toBe(200);
    expect(spawn.json()).toMatchObject({ sessionId: 'session-2', pid: 43 });
    expect(status.statusCode).toBe(200);
    expect(status.json()).toMatchObject({
      sessionId: 'session-1',
      appId: 'run-1',
      pid: 42,
      status: 'connected',
    });
    expect(stop.statusCode).toBe(200);
    expect(stop.json()).toMatchObject({
      sessionId: 'session-1',
      stopped: true,
    });
    expect(gateway.listOnAgentlet).toHaveBeenCalledWith('machine-a');
    expect(gateway.spawnOnAgentlet).toHaveBeenCalledWith('machine-a', {
      appId: 'run-2',
      sessionSpec: { command: 'codex --acp', cwd: 'E:/work' },
    });
    expect(gateway.getSession).toHaveBeenCalledWith('machine-a', 'session-1');
    expect(gateway.stopOnAgentlet).toHaveBeenCalledWith('machine-a', {
      sessionId: 'session-1',
    });
  });

  it('reports unavailable placement and rejects malformed spawn input', async () => {
    app = Fastify({ logger: false });
    await app.register(continuationTransportRoutes, { prefix: '/api/acp' });

    const unavailable = await app.inject({
      method: 'GET',
      url: '/api/acp/continuation/agentlets/machine-a/sessions',
    });
    expect(unavailable.statusCode).toBe(503);
    expect(unavailable.json()).toEqual({
      error: {
        code: 'bridge_not_mounted',
        message: 'Huabu Agentlet Gateway is not mounted.',
      },
    });

    connectedGateway();
    const invalid = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions',
      payload: { appId: 'run-2' },
    });
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json()).toMatchObject({
      error: { code: 'invalid_spawn_request' },
    });
  });

  it('returns 404 for an unknown session without creating a fallback session', async () => {
    const gateway = connectedGateway();
    gateway.getSession.mockReturnValue(undefined);
    app = Fastify({ logger: false });
    await app.register(continuationTransportRoutes, { prefix: '/api/acp' });

    const response = await app.inject({
      method: 'GET',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/missing',
    });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'session_not_found' },
    });
    expect(gateway.spawnOnAgentlet).not.toHaveBeenCalled();
  });
});

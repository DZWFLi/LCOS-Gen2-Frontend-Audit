// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { acpSessionRegistry } from '@agenetes/acp-driver';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import continuationTransportRoutes from './continuation-transport.route.js';
import { clearProviderRunInputsForTests } from './provider-run-input-registry.js';

import type { AcpSessionEntry } from '@agenetes/acp-driver';

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

let app: FastifyInstance | undefined;

afterEach(async () => {
  acpSessionRegistry.remove('machine-a', 'run-1');
  clearProviderRunInputsForTests();
  await app?.close();
  app = undefined;
  mocks.gateway = null;
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
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
    acpSessionRegistry.set('machine-a', 'run-1', {
      agentletId: 'machine-a',
      threadId: 'run-1',
      sessionId: 'native-1',
      client: { isClosed: false, shutdown: vi.fn() },
    } as unknown as AcpSessionEntry);
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
      agents: [
        {
          sessionId: 'session-1',
          externalSessionId: 'native-1',
          transportSessionId: 'session-1',
          threadId: 'run-1',
        },
      ],
    });
    expect(spawn.statusCode).toBe(200);
    expect(spawn.json()).toMatchObject({ sessionId: 'session-2', pid: 43 });
    expect(status.statusCode).toBe(200);
    expect(status.json()).toMatchObject({
      sessionId: 'session-1',
      externalSessionId: 'native-1',
      transportSessionId: 'session-1',
      threadId: 'run-1',
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

  it('registers the prompt facade and rejects an unknown transport session before any owner call', async () => {
    const gateway = connectedGateway();
    gateway.getSession.mockReturnValue(undefined);
    app = Fastify({ logger: false });
    await app.register(continuationTransportRoutes, { prefix: '/api/acp' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/transport-1/prompt',
      payload: {
        threadId: 'thread-1',
        externalSessionId: 'native-1',
        text: '继续',
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'session_not_found' },
    });
    expect(gateway.stopOnAgentlet).not.toHaveBeenCalled();
  });

  it('sends a prompt only through the canonical registered ACP owner', async () => {
    const gateway = connectedGateway();
    gateway.getSession.mockReturnValue({
      sessionId: 'transport-1',
      agentletId: 'machine-a',
      role: 'agent-session',
      metadata: {},
      status: 'connected',
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
    });
    const prompt = vi.fn(
      async (
        _sessionId: string,
        _blocks: unknown[],
        onUpdate: (update: unknown) => void,
      ) => {
        onUpdate({
          sessionUpdate: 'agent_message_chunk',
          content: { type: 'text', text: '继续完成' },
        });
        return { stopReason: 'end_turn' };
      },
    );
    const shutdown = vi.fn();
    const owner = {
      agentletId: 'machine-a',
      threadId: 'run-1',
      sessionId: 'native-1',
      selectionsReplay: Promise.resolve(),
      persistedToDisk: false,
      client: {
        isClosed: false,
        prompt,
        resolvePermission: vi.fn(),
        shutdown,
      },
    } as unknown as AcpSessionEntry;
    acpSessionRegistry.set('machine-a', 'run-1', owner);
    app = Fastify({ logger: false });
    await app.register(continuationTransportRoutes, { prefix: '/api/acp' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/transport-1/prompt',
      payload: {
        threadId: 'run-1',
        externalSessionId: 'native-1',
        text: '继续',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      threadId: 'run-1',
      externalSessionId: 'native-1',
      transportSessionId: 'transport-1',
      text: '继续完成',
      stopReason: 'end_turn',
    });
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(owner.persistedToDisk).toBe(true);

    const malformedCorrelation = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/transport-1/prompt',
      payload: {
        threadId: 'run-1',
        externalSessionId: 'native-1',
        text: '继续',
        runCorrelation: { lcosRunId: 'run-1' },
      },
    });
    expect(malformedCorrelation.statusCode).toBe(400);
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it('forwards the ACP permission_request from the live owner to Local Core with Run correlation', async () => {
    const gateway = connectedGateway();
    gateway.getSession.mockReturnValue({
      sessionId: 'transport-1',
      agentletId: 'machine-a',
      role: 'agent-session',
      metadata: {},
      status: 'connected',
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
    });
    let finishPrompt: (() => void) | undefined;
    const resumed = new Promise<void>((resolve) => {
      finishPrompt = resolve;
    });
    const prompt = vi.fn(async (...args: unknown[]) => {
      const onPermission = args[4] as (request: unknown) => void;
      onPermission({
        requestId: 'permission-1',
        toolCall: { title: 'Approve file write' },
        options: [{ optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' }],
      });
      await resumed;
      return { stopReason: 'end_turn' };
    });
    const resolvePermission = vi.fn(() => {
      finishPrompt?.();
      return true;
    });
    const owner = {
      agentletId: 'machine-a',
      threadId: 'run-1',
      sessionId: 'native-1',
      selectionsReplay: Promise.resolve(),
      persistedToDisk: false,
      client: {
        isClosed: false,
        prompt,
        resolvePermission,
        shutdown: vi.fn(),
      },
    } as unknown as AcpSessionEntry;
    acpSessionRegistry.set('machine-a', 'run-1', owner);
    vi.stubEnv('LCOS_CORE_URL', 'http://127.0.0.1:43121');
    vi.stubEnv('LOCAL_CORE_API_TOKEN', 'core-token');
    const posted: Array<{ url: string; body: unknown }> = [];
    vi.stubGlobal('fetch', vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      posted.push({ url: String(input), body: JSON.parse(String(init?.body)) });
      return new Response('{}', { status: 200 });
    }));
    app = Fastify({ logger: false });
    await app.register(continuationTransportRoutes, { prefix: '/api/acp' });

    const promptResponse = app.inject({
      method: 'POST',
      url: '/api/acp/continuation/agentlets/machine-a/sessions/transport-1/prompt',
      payload: {
        threadId: 'run-1',
        externalSessionId: 'native-1',
        text: '继续',
        runCorrelation: { lcosRunId: 'run-1', externalTaskId: 'task-1' },
      },
    });

    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]).toEqual({
      url: 'http://127.0.0.1:43121/runtime/provider-events',
      body: {
        contractVersion: 'provider-run-event-v1',
        type: 'waiting_input',
        correlation: { lcosRunId: 'run-1', externalTaskId: 'task-1' },
        request: {
          requestId: 'permission-1',
          prompt: 'Approve file write',
          options: ['allow-once'],
          allowFreeText: false,
        },
      },
    });
    const answerResponse = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/input-request',
      payload: {
        correlation: { lcosRunId: 'run-1', externalTaskId: 'task-1' },
        requestId: 'permission-1',
        selectedOptions: ['allow-once'],
      },
    });
    expect(answerResponse.statusCode).toBe(200);
    expect(resolvePermission).toHaveBeenCalledWith('permission-1', {
      optionId: 'allow-once',
    });
    const response = await promptResponse;
    expect(response.statusCode).toBe(200);

    const replay = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/input-request',
      payload: {
        correlation: { lcosRunId: 'run-1', externalTaskId: 'task-1' },
        requestId: 'permission-1',
        selectedOptions: ['allow-once'],
      },
    });
    expect(replay.statusCode).toBe(200);
    expect(resolvePermission).toHaveBeenCalledTimes(1);

    const conflictingReplay = await app.inject({
      method: 'POST',
      url: '/api/acp/continuation/input-request',
      payload: {
        correlation: { lcosRunId: 'run-1', externalTaskId: 'task-1' },
        requestId: 'permission-1',
        selectedOptions: ['deny'],
      },
    });
    expect(conflictingReplay.statusCode).toBe(409);
  });
});

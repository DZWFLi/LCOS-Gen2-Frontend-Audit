// Reusable ACP stdio fixture for the T7 real Host smoke.
// Provenance: adapted from huabu/external/agentlet/packages/local/tests/
// daemon-integration.test.ts; it speaks the required initialize + session/new
// handshake plus one prompt turn and is never used as an agentlet daemon replacement.
const readline = require('node:readline')

const rl = readline.createInterface({ input: process.stdin })
rl.on('line', (line) => {
  let message
  try {
    message = JSON.parse(line)
  } catch {
    return
  }
  if (message.method === 'initialize') {
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: message.id,
      result: {
        protocolVersion: 1,
        agentCapabilities: {},
        agentInfo: { name: 't7-acp-fixture-agent', version: '1.0.0' },
      },
    }) + '\n')
  } else if (message.method === 'session/new') {
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: message.id,
      result: { sessionId: 't7-fixture-session' },
    }) + '\n')
  } else if (message.method === 'session/prompt') {
    const sessionId = message.params?.sessionId ?? 't7-fixture-session'
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'session/update',
      params: {
        sessionId,
        update: {
          sessionUpdate: 'agent_message_chunk',
          content: { type: 'text', text: 'fixture continued' },
        },
      },
    }) + '\n')
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: message.id,
      result: { stopReason: 'end_turn' },
    }) + '\n')
  }
})

process.on('SIGTERM', () => process.exit(0))

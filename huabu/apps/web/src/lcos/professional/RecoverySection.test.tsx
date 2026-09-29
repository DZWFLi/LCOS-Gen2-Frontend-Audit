import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';

import { RecoverySection } from './RecoverySection';

import type { ContinuationRecoveryProjectionV1 } from '@local-creative-os/contracts';
import type { CoreCollaborationClient } from '@local-creative-os/web-gen2';

it('uses the real recover_external action on the existing operation and prevents concurrent recovery', async () => {
  const operation: ContinuationRecoveryProjectionV1 = {
    schemaVersion:1, operationId:'op-existing',projectId:'p',connectedConversationId:'c',
    mode:'continue_existing',contextInheritance:'inherit',checkout:'shared',provider:'test',
    status:'outcome_unknown',steps:{external_create:'outcome_unknown',core_bind:'not_started',attach:'not_started',projection:'not_started'},
    cancel:'none',revision:4,allowedActions:[{action:'recover_external',requiresFreshRead:true},{action:'reconcile',requiresFreshRead:true}],
    createdAt:'2026-09-26T00:00:00Z',updatedAt:'2026-09-26T00:00:00Z',
  };
  let finish!: (result: {ok:boolean})=>void;
  const recover=vi.fn(()=>new Promise<{ok:boolean}>((resolve)=>{finish=resolve;}));
  const readDiagnostics=vi.fn(); const onRefreshed=vi.fn();
  const client={recover,readDiagnostics} as unknown as CoreCollaborationClient;
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
  try {
    await act(async()=>root.render(<RecoverySection collaboration={client} projectId="p" operations={[operation]} onRefreshed={onRefreshed}/>));
    const button=host.querySelector<HTMLButtonElement>('[data-lcos-recovery-action="recover_external"]');
    expect(button?.textContent).toContain('恢复外部会话');
    await act(async()=>button?.click());
    expect(recover).toHaveBeenCalledWith('p',{continuationOperationId:'op-existing',action:'recover_external',expectedRevision:4});
    expect(host.querySelector<HTMLButtonElement>('[data-lcos-recovery-action="reconcile"]')?.disabled).toBe(true);
    await act(async()=>button?.click());expect(recover).toHaveBeenCalledTimes(1);
    await act(async()=>finish({ok:true}));expect(onRefreshed).toHaveBeenCalledWith(operation);
    expect(readDiagnostics).not.toHaveBeenCalled();
  } finally {act(()=>root.unmount());host.remove();}
});

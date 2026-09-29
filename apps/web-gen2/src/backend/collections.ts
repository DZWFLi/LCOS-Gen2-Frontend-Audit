import { HttpClient } from './client.js';
import { coreEnvelope, coreRequest } from './coreTypes.js';

/** Mirrors the Local Core canonical Collection contract (not legacy Scope identity). */
export interface CoreCollectionIdentity {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type CoreCollectionMemberType = 'artifact' | 'note' | 'collection' | 'scope' | 'workspace' | 'conversation' | 'run';
export interface CoreCollectionMemberRef { readonly type: CoreCollectionMemberType; readonly id: string }
export interface CoreCollectionMembership {
  readonly collectionId: string;
  readonly memberRef: CoreCollectionMemberRef;
  readonly relationId: string;
  readonly addedAt: string;
}
export interface CoreCollectionMembersSnapshot { readonly collection: CoreCollectionIdentity; readonly members: readonly CoreCollectionMembership[] }
export interface CoreCollectionMembershipReceipt {
  readonly status: 'applied' | 'already-member' | 'removed' | 'not-member';
  readonly collectionId: string;
  readonly memberRef: CoreCollectionMemberRef;
  readonly relationId?: string;
  readonly changeSetId?: string;
}

/** Durable membership owner. Huabu parentId and Scope compatibility are intentionally absent. */
export class CoreCollectionClient {
  constructor(private readonly http: HttpClient) {}

  list(projectId: string, signal?: AbortSignal): Promise<readonly CoreCollectionIdentity[]> {
    return coreRequest(this.http, 'GET', `/projects/${encodeURIComponent(projectId)}/collections`, { signal });
  }

  create(projectId: string, title: string, signal?: AbortSignal): Promise<{ collection: CoreCollectionIdentity; changeSetId: string }> {
    return coreEnvelope<CoreCollectionIdentity>(this.http, 'POST', `/projects/${encodeURIComponent(projectId)}/collections`, { signal, body: { title } })
      .then((env) => ({ collection: env.value, changeSetId: String((env.meta as { changeSetId?: unknown } | undefined)?.changeSetId ?? '') }));
  }

  members(projectId: string, collectionId: string, signal?: AbortSignal): Promise<CoreCollectionMembersSnapshot> {
    return coreRequest(this.http, 'GET', `/projects/${encodeURIComponent(projectId)}/collections/${encodeURIComponent(collectionId)}/members`, { signal });
  }

  addMember(projectId: string, collectionId: string, memberRef: CoreCollectionMemberRef, signal?: AbortSignal): Promise<CoreCollectionMembershipReceipt> {
    return coreRequest(this.http, 'POST', `/projects/${encodeURIComponent(projectId)}/collections/${encodeURIComponent(collectionId)}/members`, { signal, body: { memberType: memberRef.type, memberId: memberRef.id } });
  }

  removeMember(projectId: string, collectionId: string, memberRef: CoreCollectionMemberRef, signal?: AbortSignal): Promise<CoreCollectionMembershipReceipt> {
    return coreRequest(this.http, 'DELETE', `/projects/${encodeURIComponent(projectId)}/collections/${encodeURIComponent(collectionId)}/members`, { signal, body: { memberType: memberRef.type, memberId: memberRef.id } });
  }
}

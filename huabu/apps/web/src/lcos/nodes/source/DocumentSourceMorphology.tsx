import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useDeferredHydration } from '@/components/Nodes/shared/nodeHydrationScheduler';
import { createLcosCoreSession } from '../../app/lcosCoreClient';
import { DocumentSourceView } from '../../ui/source/DocumentSourceView';
import type { SourceMorphologyProps } from './sourceTypes';
const PdfSourcePreview = lazy(() => import('./PdfSourcePreview'));

/** Read the exact owner-supplied file revision; transient presentation, never a second document store. */
function MarkdownDocumentSource(props: SourceMorphologyProps): React.JSX.Element {
  const client = useMemo(() => createLcosCoreSession().artifacts, []);
  const readable = props.density !== 'mark' && props.projectId !== undefined && props.fileRecordId !== undefined;
  const hydrated = useDeferredHydration(!readable);
  const key = `${props.projectId ?? ''}:${props.fileRecordId ?? ''}`;
  const [content, setContent] = useState<{ key: string; markdown?: string; failed?: boolean }>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!hydrated || !readable || !props.projectId || !props.fileRecordId) return;
    const controller = new AbortController();
    void client.getFileRecordText(props.projectId, props.fileRecordId, controller.signal).then(markdown => {
      if (!controller.signal.aborted) setContent({ key, markdown });
    }).catch(() => {
      if (!controller.signal.aborted) setContent({ key, failed: true });
    });
    return () => controller.abort();
  }, [client, hydrated, readable, key, props.projectId, props.fileRecordId, attempt]);
  const current = content?.key === key ? content : undefined;
  return <DocumentSourceView {...props}
    {...(current?.markdown === undefined ? {} : { canonicalMarkdown: current.markdown })}
    {...(readable && current?.markdown === undefined ? {
      contentStatus: current?.failed ? 'failed' as const : 'loading' as const,
      onRetryContent: () => { setContent(undefined); setAttempt(value => value + 1); },
    } : {})} />;
}

export function DocumentSourceMorphology(props: SourceMorphologyProps): React.JSX.Element {
  const isPdf = props.mimeType?.toLowerCase().split(';', 1)[0].trim() === 'application/pdf' || props.artifactKind === 'pdf';
  if (isPdf && props.mediaSrc && props.density !== 'mark') return <Suspense fallback={<DocumentSourceView {...props} />}>
    <PdfSourcePreview key={props.mediaSrc} {...props} />
  </Suspense>;
  const textDocument = props.artifactKind === 'markdown' || props.mimeType?.toLowerCase().startsWith('text/') === true;
  return textDocument ? <MarkdownDocumentSource {...props} /> : <DocumentSourceView {...props} />;
}

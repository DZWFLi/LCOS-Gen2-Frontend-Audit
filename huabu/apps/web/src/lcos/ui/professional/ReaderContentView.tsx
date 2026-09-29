import { lazy, Suspense } from 'react';

import { PreviewHeaderSlotContext } from '@/components/Nodes/PreviewHeaderSlot';

import { Gen1ImageZoomStage } from './donor/Gen1ImageZoomStage';
import { Gen1TextDocument } from './donor/Gen1TextDocument';
import './donor/gen1-reader.css';
import './professional-reading.css';

import type { ReactNode, Ref, UIEventHandler } from 'react';

const PdfReader = lazy(() => import('@/components/Nodes/pdf/PDFPreview').then((module) => ({ default: module.PDFPreview })));
const AudioReader = lazy(() => import('../../nodes/source/AudioSourceMorphology').then((module) => ({ default: module.AudioSourceMorphology })));
const VideoReader = lazy(() => import('@/components/Nodes/video/VideoPreview').then((module) => ({ default: module.VideoPreview })));
const readOnlyHeader = { el: null };

/** The owning Reader supplies revision bytes. No loading, URL or revision owner lives here. */
export type ReaderVisibleContent =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'image' | 'pdf' | 'video' | 'audio'; readonly url: string; readonly mimeType: string; readonly viewKey?: string }
  | null;

export function readerArtifactKindLabel(kind: string): string {
  switch (kind) {
    case 'markdown': return '文本文档';
    case 'image': return '图片';
    case 'presentation': return '演示文稿';
    case 'pdf': return 'PDF 文档';
    case 'other': return '其他文件';
    default: return '其他材料';
  }
}

export interface ReaderContentViewProps {
  readonly content: ReaderVisibleContent;
  readonly kind: string;
  readonly fileName: string;
  readonly contentRef?: Ref<HTMLDivElement>;
  readonly onScroll?: UIEventHandler<HTMLDivElement>;
  /** The owner keeps the reader's continuity/zoom state; this view only presents it. */
  readonly zoom?: number;
  readonly loading?: boolean;
  readonly error?: string;
  readonly onRetry?: () => void;
  /** Reuse the host's renderer when one is available; never parse or fetch a second copy. */
  readonly renderedText?: ReactNode;
  readonly unavailableGlyph?: ReactNode;
  /** Optional owner-supplied loading/error/recovery presentation. null content is NOT success. */
  readonly feedback?: ReactNode;
}

/** Thin presentation adaptation of GEN1 ArtifactViewerHost's content/fallback junction. */
export function ReaderContentView({
  content,
  kind,
  fileName,
  contentRef,
  onScroll,
  zoom = 100,
  loading = false,
  error,
  onRetry,
  renderedText,
  unavailableGlyph,
  feedback,
}: ReaderContentViewProps): React.JSX.Element {
  if (loading) {
    return (
      <div data-lcos-reader-content="loading" className="lcos-reader-unavailable" aria-live="polite">
        正在读取正文…
      </div>
    );
  }

  if (error !== undefined) {
    return (
      <div data-lcos-reader-content="error" className="lcos-reader-unavailable" role="alert">
        <span>正文读取失败 · {error}</span>
        {onRetry === undefined ? null : (
          <button type="button" data-lcos-reader-retry onClick={onRetry}>重读同一版本</button>
        )}
      </div>
    );
  }

  if (content?.kind === 'text') {
    return (
      <div
        ref={contentRef}
        onScroll={onScroll}
        data-lcos-reader-content="text"
        data-figma-node-id="5388:27484"
        className="lcos-reader-page"
      >
        <div className="lcos-reader-measure">
          {renderedText === undefined ? (
            kind === 'markdown' ? <div data-lcos-reader-text-scale style={{ zoom: zoom / 100 }}><Gen1TextDocument text={content.value} /></div> :
              <pre className="lcos-reader-plaintext" style={{ fontSize: `${0.875 * zoom / 100}rem` }}>{content.value}</pre>
          ) : (
            <div className="lcos-reader-richtext" style={{ zoom: zoom / 100 }}>{renderedText}</div>
          )}
        </div>
        {feedback}
      </div>
    );
  }

  if (content?.kind === 'pdf' || content?.kind === 'video' || content?.kind === 'audio') {
    return <div ref={contentRef} onScroll={onScroll} className="lcos-reader-media-page lcos-reader-document-media" data-lcos-reader-content={content.kind}>
      <Suspense fallback={<div role="status">正在载入预览…</div>}>
        {content.kind === 'pdf'
          ? <PreviewHeaderSlotContext.Provider value={readOnlyHeader}>
              <PdfReader key={content.viewKey ?? content.url} data={{ src: content.url, name: fileName }} readOnly
                {...(content.viewKey === undefined ? {} : { scrollViewKey: content.viewKey })} />
            </PreviewHeaderSlotContext.Provider>
          : content.kind === 'audio' ? <AudioReader key={content.url} family="audio" title={fileName} density="reading" mediaSrc={content.url} />
          : <VideoReader key={content.url} data={{ src: content.url, name: fileName }} readOnly />}
      </Suspense>
      {feedback}
    </div>;
  }

  if (content?.kind === 'image') {
    return (
      <div
        ref={contentRef}
        onScroll={onScroll}
        data-lcos-reader-content="image"
        className="lcos-reader-media-page"
      >
        <figure className="lcos-reader-figure">
          <Gen1ImageZoomStage key={content.url} src={content.url} alt={fileName} />
          <figcaption className="lcos-reader-media-caption">{fileName}</figcaption>
        </figure>
        <span className="lcos-professional-sr-only">{content.mimeType}</span>
        {feedback}
      </div>
    );
  }

  return (
    <div data-lcos-reader-content="unavailable" className="lcos-reader-unavailable">
      {feedback === undefined ? (
        <>
          <span aria-hidden="true" className="lcos-reader-unavailable-glyph">{unavailableGlyph}</span>
          <span>{fileName} · {readerArtifactKindLabel(kind)} · 暂无可用正文读取通道</span>
        </>
      ) : feedback}
    </div>
  );
}

import type { ReactNode, Ref, UIEventHandler } from 'react';

import './professional-reading.css';

/** The owning Reader supplies revision bytes. No loading, URL or revision owner lives here. */
export type ReaderVisibleContent =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'image'; readonly url: string; readonly mimeType: string }
  | null;

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
        正文读取失败 · {error}
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
            <pre className="lcos-reader-plaintext" style={{ fontSize: `${0.875 * zoom / 100}rem` }}>{content.value}</pre>
          ) : (
            <div className="lcos-reader-richtext" style={{ zoom: zoom / 100 }}>{renderedText}</div>
          )}
        </div>
        {feedback}
      </div>
    );
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
          <img
            data-figma-node-id="5388:27490"
            src={content.url}
            alt={fileName}
            className="lcos-reader-image"
            style={{ width: `${zoom}%`, maxWidth: 'none' }}
          />
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
          <span>{fileName} · {kind} 暂无可用正文读取通道</span>
        </>
      ) : feedback}
    </div>
  );
}

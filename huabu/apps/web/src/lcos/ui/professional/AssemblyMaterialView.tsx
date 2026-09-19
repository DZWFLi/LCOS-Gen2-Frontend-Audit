import { useState } from 'react';

import './professional-assembly.css';

import type { ReactNode } from 'react';
export interface AssemblyMaterialViewProps {
  readonly title: string;
  readonly familyLabel: string;
  readonly previewUrl?: string;
  readonly fallbackGlyph: ReactNode;
  /** Actual readable preview supplied by its owner, never generated from a title. */
  readonly excerpt?: string;
  readonly feedback?: ReactNode;
}

/**
 * GEN1 WarehouseObject: content + identity + optional references stay separate.
 * Lovart contributes reference-only hierarchy, NOT copied commercial source/assets.
 */
export function AssemblyMaterialView({
  title,
  familyLabel,
  previewUrl,
  fallbackGlyph,
  excerpt,
  feedback,
}: AssemblyMaterialViewProps): React.JSX.Element {
  // Rendering failure only, not a new availability owner. A new URL gets a fresh attempt.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasPreview = previewUrl !== undefined && previewUrl !== '' && failedUrl !== previewUrl;
  return (
    <div
      data-lcos-assembly-material
      aria-label={`${title} · ${familyLabel}`}
      data-preview-available={hasPreview}
      className="lcos-assembly-material-view"
    >
      {hasPreview ? (
        <img
          src={previewUrl}
          alt={title}
          draggable={false}
          decoding="async"
          onError={() => setFailedUrl(previewUrl ?? null)}
          className="lcos-assembly-preview-image"
        />
      ) : excerpt !== undefined && excerpt !== '' ? (
        <p className="lcos-assembly-preview-excerpt">{excerpt}</p>
      ) : (
        <div className="lcos-assembly-preview-unavailable">
          <span aria-hidden="true" className="lcos-assembly-material-glyph">{fallbackGlyph}</span>
          <span className="lcos-assembly-preview-reason">
            <span>{familyLabel}</span>
            <small>{failedUrl === previewUrl && failedUrl !== null ? '预览读取失败，材料身份仍保留' : '暂无真实预览'}</small>
          </span>
        </div>
      )}
      {feedback}
    </div>
  );
}

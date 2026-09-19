import type { ReactNode } from 'react';

import './professional-assembly.css';

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
  return (
    <div
      data-lcos-assembly-material
      data-preview-available={previewUrl !== undefined && previewUrl !== ''}
      className="lcos-assembly-material-view"
    >
      {previewUrl !== undefined && previewUrl !== '' ? (
        <img
          src={previewUrl}
          alt={title}
          draggable={false}
          decoding="async"
          className="lcos-assembly-preview-image"
        />
      ) : excerpt !== undefined && excerpt !== '' ? (
        <p className="lcos-assembly-preview-excerpt">{excerpt}</p>
      ) : (
        <div className="lcos-assembly-preview-unavailable">
          <span aria-hidden="true" className="lcos-assembly-material-glyph">{fallbackGlyph}</span>
          <span className="lcos-assembly-preview-reason">
            <span>{familyLabel}</span>
            <small>暂无真实预览</small>
          </span>
        </div>
      )}
      {feedback}
    </div>
  );
}

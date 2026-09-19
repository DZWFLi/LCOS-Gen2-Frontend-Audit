import { ComposerReferenceStrip } from './ComposerReferenceStrip';
import { LcosNearfieldGlyph } from './LcosNearfieldGlyph';
import './nearfield.css';

import type { LcosComposerViewProps } from './composerViewTypes';
import type { JSX } from 'react';

/**
 * Figma 5388:324 + 5280:669. Controlled View, no stores, async calls or synthetic
 * progress. The original textarea is still exposed to the host's live drop registry.
 */
export function LcosComposerView(props: LcosComposerViewProps): JSX.Element {
  const busy = props.state === 'resolving'
    || props.state === 'sending' || props.state === 'reconciling';
  return (
    <div
      className="lcos-composer-view"
      data-lcos-composer
      data-lcos-composer-target={props.targetId}
      data-presentation={props.presentation}
      data-ui-state={props.state}
      data-figma-node-id={props.presentation === 'nearfield' ? '5388:324' : '5280:669'}
      aria-busy={busy}
    >
      <div className="lcos-composer-heading">
        {props.identity !== undefined && (
          <span className="lcos-composer-identity" aria-hidden="true">{props.identity}</span>
        )}
        {props.receiverAction ? (
          <button
            type="button"
            className="lcos-composer-receiver"
            disabled={props.receiverAction.disabled}
            title={props.receiverAction.disabledReason ?? props.receiverAction.label}
            onClick={props.receiverAction.onClick}
          >
            {props.title}
          </button>
        ) : <span className="lcos-composer-title" title={props.title}>{props.title}</span>}
        <button
          type="button"
          className="lcos-composer-close"
          aria-label="关闭 Composer"
          title="关闭（草稿保留）"
          onClick={props.onClose}
        >
          <LcosNearfieldGlyph name="close" size={14} />
        </button>
      </div>

      <ComposerReferenceStrip items={props.references} />

      <div className="lcos-composer-editor">
        <textarea
          ref={props.textareaRef}
          data-lcos-composer-input
          value={props.text}
          onChange={props.onTextChange}
          onKeyDown={props.onKeyDown}
          readOnly={props.readOnly}
          rows={3}
          placeholder={props.placeholder ?? '想一起完成什么？'}
          aria-label="Composer 输入"
        />
        <div className="lcos-composer-tools">
          <div className="lcos-composer-tools-start">
            {props.attachAction && (
              <button type="button" className="lcos-composer-tool-hit"
                disabled={props.attachAction.disabled}
                title={props.attachAction.disabledReason ?? props.attachAction.label}
                aria-label={props.attachAction.label}
                onClick={props.attachAction.onClick}>
                <span className="lcos-composer-tool-face"><LcosNearfieldGlyph name="attach" /></span>
              </button>
            )}
            {props.referencePickAction && (
              <button type="button" className="lcos-composer-tool-hit"
                disabled={props.referencePickAction.disabled}
                title={props.referencePickAction.disabledReason ?? props.referencePickAction.label}
                aria-label={props.referencePickAction.label}
                onClick={props.referencePickAction.onClick}>
                <span className="lcos-composer-tool-face"><LcosNearfieldGlyph name="at" /></span>
              </button>
            )}
          </div>
          <button
            type="button"
            className="lcos-composer-tool-hit lcos-composer-submit"
            disabled={!props.canSubmit}
            aria-label="提交"
            title={props.submitTitle}
            onClick={props.onSubmit}
          >
            <span className="lcos-composer-tool-face"><LcosNearfieldGlyph name="send" /></span>
          </button>
        </div>
      </div>
      {(props.feedback !== null && props.feedback !== undefined ||
        props.feedbackAction !== undefined) && (
        <div className="lcos-composer-feedback" aria-live="polite">
          {props.feedback}
          {props.feedbackAction && (
            <button type="button" className="lcos-composer-recovery-action"
              aria-label={props.feedbackAction.label}
              disabled={props.feedbackAction.disabled}
              title={props.feedbackAction.disabledReason ?? props.feedbackAction.label}
              onClick={props.feedbackAction.onClick}>
              {props.feedbackAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

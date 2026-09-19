import type { ReactNode } from 'react';

import './professional-conversation.css';

export interface ConversationEventViewProps {
  readonly kind: string;
  readonly title: string;
  readonly body?: string;
  readonly label: string;
  readonly icon: ReactNode;
  /** Visual emphasis only; the container maps its existing canonical event kind. */
  readonly presentation: 'message' | 'activity';
  readonly tone?: 'neutral' | 'attention' | 'danger';
  readonly children?: ReactNode;
}

/** Figma A10 reading rhythm. Events remain in the owner's order, with untruncated real text. */
export function ConversationEventView({
  kind,
  title,
  body,
  label,
  icon,
  presentation,
  tone = 'neutral',
  children,
}: ConversationEventViewProps): React.JSX.Element {
  return (
    <div
      data-lcos-timeline-item={kind}
      data-event-presentation={presentation}
      data-event-tone={tone}
      className="lcos-conversation-event"
    >
      <span aria-hidden="true" className="lcos-conversation-event-icon">{icon}</span>
      <div className="lcos-conversation-event-content">
        <span className="lcos-conversation-event-label">{label}</span>
        <div className="lcos-conversation-event-title">{title}</div>
        {body === undefined ? null : <div className="lcos-conversation-event-body">{body}</div>}
        {children}
      </div>
    </div>
  );
}

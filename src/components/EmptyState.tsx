import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState(props: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  const Icon = props.icon;
  return (
    <section className="empty-state" aria-label={props.title}>
      <span className="empty-state__icon"><Icon aria-hidden="true" /></span>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
      {props.actionLabel && props.actionTo && (
        <Link className="button button--primary" to={props.actionTo}>
          {props.actionLabel} <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}


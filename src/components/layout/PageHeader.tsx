import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-[14px] text-[var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

import type { ReactNode } from 'react';

import type { CatalogEntry } from './galleryVariants';

interface GallerySectionProps {
  entry: CatalogEntry;
  children: ReactNode;
}

export function GallerySection({ entry, children }: GallerySectionProps) {
  return (
    <section
      id={entry.id}
      aria-labelledby={`${entry.id}-title`}
      className="scroll-mt-6 rounded-card border border-line bg-card p-4 md:p-5"
    >
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${entry.id}-title`} className="text-lg font-bold">
          {entry.name}
        </h3>
        <code className="font-mono text-xs text-muted-foreground">{entry.source}</code>
      </header>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

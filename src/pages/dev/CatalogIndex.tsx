import { useTranslation } from 'react-i18next';

import type { CatalogEntry } from './galleryVariants';

interface CatalogIndexProps {
  primitives: readonly CatalogEntry[];
  league: readonly CatalogEntry[];
}

interface CatalogRowsProps {
  entries: readonly CatalogEntry[];
}

function CatalogRows({ entries }: CatalogRowsProps) {
  return entries.map((entry) => (
    <tr key={entry.id} className="border-t border-line align-top">
      <th scope="row" className="py-2.5 pr-4 text-left font-semibold">
        <a href={`#${entry.id}`} className="text-primary underline-offset-4 hover:underline">
          {entry.name}
        </a>
      </th>
      <td className="py-2.5 pr-4">
        <div className="flex flex-col gap-1.5">
          {entry.axes.map((axis) => (
            <p key={axis.axis} className="flex flex-wrap items-center gap-1.5">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{axis.axis}</span>
              {axis.values.map((value) => (
                <code key={value} className="rounded-tile bg-chip px-1.5 py-0.5 font-mono text-xs">
                  {value}
                </code>
              ))}
            </p>
          ))}
        </div>
      </td>
      <td className="hidden py-2.5 md:table-cell">
        <code className="font-mono text-xs text-muted-foreground">{entry.source}</code>
      </td>
    </tr>
  ));
}

export function CatalogIndex({ primitives, league }: CatalogIndexProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="index-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="index-title" className="text-xl font-bold">
          {t('dev.gallery.index')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('dev.gallery.indexBody')}</p>
      </div>
      <div className="overflow-x-auto rounded-card border border-line bg-card px-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2.5 pr-4 font-medium">
                {t('dev.gallery.colComponent')}
              </th>
              <th scope="col" className="py-2.5 pr-4 font-medium">
                {t('dev.gallery.colAxes')}
              </th>
              <th scope="col" className="hidden py-2.5 font-medium md:table-cell">
                {t('dev.gallery.colSource')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <th
                colSpan={3}
                scope="rowgroup"
                className="py-2 text-left text-xs font-semibold text-text-2"
              >
                {t('dev.gallery.primitives')}
              </th>
            </tr>
            <CatalogRows entries={primitives} />
            <tr className="border-t border-line">
              <th
                colSpan={3}
                scope="rowgroup"
                className="py-2 text-left text-xs font-semibold text-text-2"
              >
                {t('dev.gallery.league')}
              </th>
            </tr>
            <CatalogRows entries={league} />
          </tbody>
        </table>
      </div>
    </section>
  );
}

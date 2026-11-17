import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeToggle } from '@/components/ThemeToggle';

import { CatalogIndex } from './CatalogIndex';
import { LEAGUE_CATALOG, PRIMITIVE_CATALOG } from './galleryVariants';
import { ButtonGallery } from './sections/ButtonGallery';
import { DisplayGallery } from './sections/DisplayGallery';
import { FormGallery } from './sections/FormGallery';
import { LeagueGallery } from './sections/LeagueGallery';
import { OverlayGallery } from './sections/OverlayGallery';

interface GalleryPartProps {
  id: string;
  title: string;
  body: string;
  children: ReactNode;
}

function GalleryPart({ id, title, body, children }: GalleryPartProps) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-xl font-bold">
          {title}
        </h2>
        <p className="font-mono text-xs text-muted-foreground">{body}</p>
      </div>
      {children}
    </section>
  );
}

// Dev-only catalogue of every component and variant, laid out to be checked against the
// "Clean blue theme" component sheet of the MViP League UI design in both themes.
export function ComponentGalleryPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex max-w-332.5 flex-col gap-10 px-4 py-6 md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold">{t('dev.gallery.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dev.gallery.subtitle')}</p>
        </div>
        <ThemeToggle />
      </header>

      <CatalogIndex primitives={PRIMITIVE_CATALOG} league={LEAGUE_CATALOG} />

      <GalleryPart
        id="primitives"
        title={t('dev.gallery.primitives')}
        body={t('dev.gallery.primitivesBody')}
      >
        <ButtonGallery />
        <DisplayGallery />
        <FormGallery />
        <OverlayGallery />
      </GalleryPart>

      <GalleryPart id="league" title={t('dev.gallery.league')} body={t('dev.gallery.leagueBody')}>
        <LeagueGallery />
      </GalleryPart>
    </main>
  );
}

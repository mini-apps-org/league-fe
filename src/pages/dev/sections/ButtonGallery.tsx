import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';

import { GallerySection } from '../GallerySection';
import {
  BUTTON_ICON_SIZES,
  BUTTON_TEXT_SIZES,
  BUTTON_VARIANTS,
  PRIMITIVES,
} from '../galleryVariants';
import { VariantRow } from '../VariantRow';

export function ButtonGallery() {
  const { t } = useTranslation();
  const label = t('dev.gallery.sample.button');

  return (
    <GallerySection entry={PRIMITIVES.button}>
      {BUTTON_VARIANTS.map((variant) => (
        <VariantRow key={variant} name={`variant="${variant}"`}>
          {BUTTON_TEXT_SIZES.map((size) => (
            <span key={size} className="flex flex-col items-start gap-1">
              <Button variant={variant} size={size}>
                <Plus data-icon="inline-start" aria-hidden />
                {label}
              </Button>
              <code className="font-mono text-[11px] text-muted-foreground">{size}</code>
            </span>
          ))}
          <span className="flex flex-col items-start gap-1">
            <Button variant={variant} size="touch" disabled>
              {label}
            </Button>
            <code className="font-mono text-[11px] text-muted-foreground">{'disabled'}</code>
          </span>
        </VariantRow>
      ))}

      {BUTTON_VARIANTS.map((variant) => (
        <VariantRow key={`icon-${variant}`} name={`icon · ${variant}`}>
          {BUTTON_ICON_SIZES.map((size) => (
            <span key={size} className="flex flex-col items-start gap-1">
              <Button variant={variant} size={size} aria-label={label}>
                <Plus aria-hidden />
              </Button>
              <code className="font-mono text-[11px] text-muted-foreground">{size}</code>
            </span>
          ))}
        </VariantRow>
      ))}
    </GallerySection>
  );
}

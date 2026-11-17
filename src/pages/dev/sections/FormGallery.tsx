import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline } from '@/lib/icons';

import { GallerySection } from '../GallerySection';
import {
  FIELD_STATES,
  PRIMITIVES,
  SELECT_SIZES,
  TABS_LIST_VARIANTS,
  TOGGLE_SIZES,
  TOGGLE_VARIANTS,
} from '../galleryVariants';
import { VariantRow } from '../VariantRow';

type FieldState = (typeof FIELD_STATES)[number];

const OPTION_NUMBERS = [1, 2, 3] as const;
const TOGGLE_GROUP_SPACINGS = [0, 2] as const;

interface FieldSampleProps {
  state: FieldState;
  kind: 'input' | 'textarea';
}

function FieldSample({ state, kind }: FieldSampleProps) {
  const { t } = useTranslation();
  const id = useId();
  const fieldProps = {
    id,
    disabled: state === 'disabled',
    'aria-invalid': state === 'invalid' ? true : undefined,
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <Label htmlFor={id}>{t('dev.gallery.sample.label')}</Label>
      {kind === 'input' ? (
        <Input {...fieldProps} placeholder={t('dev.gallery.sample.placeholder')} />
      ) : (
        <Textarea {...fieldProps} placeholder={t('dev.gallery.sample.notes')} />
      )}
    </div>
  );
}

// Every control that takes input: text fields, select, toggles and tabs.
export function FormGallery() {
  const { t } = useTranslation();

  return (
    <>
      <GallerySection entry={PRIMITIVES.input}>
        {FIELD_STATES.map((state) => (
          <VariantRow key={state} name={state}>
            <FieldSample state={state} kind="input" />
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.textarea}>
        {FIELD_STATES.map((state) => (
          <VariantRow key={state} name={state}>
            <FieldSample state={state} kind="textarea" />
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.select}>
        {SELECT_SIZES.map((size) => (
          <VariantRow key={size} name={`size="${size}"`}>
            <Select defaultValue="1">
              <SelectTrigger size={size} aria-label={t('dev.gallery.sample.label')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTION_NUMBERS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {t('dev.gallery.sample.option', { n })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger size={size} aria-label={t('dev.gallery.disabled')}>
                <SelectValue placeholder={t('dev.gallery.disabled')} />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.toggle}>
        {TOGGLE_VARIANTS.flatMap((variant) =>
          TOGGLE_SIZES.map((size) => (
            <VariantRow key={`${variant}-${size}`} name={`${variant} · ${size}`}>
              <Toggle variant={variant} size={size} aria-label={t('dev.gallery.sample.bold')}>
                <Bold aria-hidden />
              </Toggle>
              <Toggle
                variant={variant}
                size={size}
                defaultPressed
                aria-label={t('dev.gallery.sample.italic')}
              >
                <Italic aria-hidden />
              </Toggle>
              <Toggle
                variant={variant}
                size={size}
                disabled
                aria-label={t('dev.gallery.sample.underline')}
              >
                <Underline aria-hidden />
              </Toggle>
            </VariantRow>
          )),
        )}
      </GallerySection>

      <GallerySection entry={PRIMITIVES['toggle-group']}>
        {TOGGLE_VARIANTS.flatMap((variant) =>
          TOGGLE_GROUP_SPACINGS.map((spacing) => (
            <VariantRow key={`${variant}-${spacing}`} name={`${variant} · spacing=${spacing}`}>
              <ToggleGroup
                type="multiple"
                variant={variant}
                spacing={spacing}
                defaultValue={['bold']}
              >
                <ToggleGroupItem value="bold" aria-label={t('dev.gallery.sample.bold')}>
                  <Bold aria-hidden />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label={t('dev.gallery.sample.italic')}>
                  <Italic aria-hidden />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label={t('dev.gallery.sample.underline')}>
                  <Underline aria-hidden />
                </ToggleGroupItem>
              </ToggleGroup>
            </VariantRow>
          )),
        )}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.tabs}>
        {TABS_LIST_VARIANTS.map((variant) => (
          <VariantRow key={variant} name={`variant="${variant}"`}>
            <Tabs defaultValue="1">
              <TabsList variant={variant}>
                {OPTION_NUMBERS.map((n) => (
                  <TabsTrigger key={n} value={String(n)} disabled={n === 3}>
                    {t('dev.gallery.sample.tab', { n })}
                  </TabsTrigger>
                ))}
              </TabsList>
              {OPTION_NUMBERS.map((n) => (
                <TabsContent
                  key={n}
                  value={String(n)}
                  className="pt-2 text-sm text-muted-foreground"
                >
                  {t('dev.gallery.sample.tabPanel', { n })}
                </TabsContent>
              ))}
            </Tabs>
          </VariantRow>
        ))}
      </GallerySection>
    </>
  );
}

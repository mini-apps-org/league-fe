import { useTranslation } from 'react-i18next';

import { Alert, AlertAction, AlertDescription } from '@/components/ui/alert';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TriangleAlert } from '@/lib/icons';

import { GallerySection } from '../GallerySection';
import {
  ALERT_VARIANTS,
  AVATAR_SIZES,
  BADGE_VARIANTS,
  CARD_SIZES,
  PRIMITIVES,
} from '../galleryVariants';
import { VariantRow } from '../VariantRow';

const AVATAR_INITIALS = ['LQ', 'HL', 'VT'] as const;

// Badge, alert, card, avatar and skeleton: the primitives that only display, with no input.
export function DisplayGallery() {
  const { t } = useTranslation();

  return (
    <>
      <GallerySection entry={PRIMITIVES.badge}>
        {BADGE_VARIANTS.map((variant) => (
          <VariantRow key={variant} name={`variant="${variant}"`}>
            <Badge variant={variant}>{t('matchStatus.scheduled')}</Badge>
            <Badge variant={variant}>{t('putUp.reason.would_break_23')}</Badge>
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.alert}>
        {ALERT_VARIANTS.map((variant) => (
          <VariantRow
            key={variant}
            name={`variant="${variant}"`}
            className="flex-col items-stretch"
          >
            <Alert variant={variant}>
              <TriangleAlert aria-hidden />
              <AlertDescription>{t('dev.gallery.sample.alertBody')}</AlertDescription>
            </Alert>
            <Alert variant={variant}>
              <TriangleAlert aria-hidden />
              <AlertDescription>{t('dev.gallery.sample.alertBody')}</AlertDescription>
              <AlertAction>
                <Button variant="outline">{t('common.retry')}</Button>
              </AlertAction>
            </Alert>
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.card}>
        {CARD_SIZES.map((size) => (
          <VariantRow key={size} name={`size="${size}"`} className="items-stretch">
            <Card size={size} className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>{t('dev.gallery.sample.cardTitle')}</CardTitle>
                <CardDescription>{t('dev.gallery.sample.cardDescription')}</CardDescription>
              </CardHeader>
              <CardContent>{t('dev.gallery.sample.cardBody')}</CardContent>
              <CardFooter>
                <Button variant="outline">{t('common.cancel')}</Button>
              </CardFooter>
            </Card>
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.avatar}>
        {AVATAR_SIZES.map((size) => (
          <VariantRow key={size} name={`size="${size}"`}>
            <Avatar size={size}>
              <AvatarFallback>{AVATAR_INITIALS[0]}</AvatarFallback>
            </Avatar>
            <Avatar size={size}>
              <AvatarFallback>{AVATAR_INITIALS[1]}</AvatarFallback>
              <AvatarBadge className="bg-ok" />
            </Avatar>
            <AvatarGroup>
              {AVATAR_INITIALS.map((initials) => (
                <Avatar key={initials} size={size}>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>{'+2'}</AvatarGroupCount>
            </AvatarGroup>
          </VariantRow>
        ))}
      </GallerySection>

      <GallerySection entry={PRIMITIVES.skeleton}>
        <VariantRow name="line">
          <Skeleton className="h-4 w-48" />
        </VariantRow>
        <VariantRow name="pill">
          <Skeleton className="h-5.5 w-22 rounded-chip" />
        </VariantRow>
        <VariantRow name="block">
          <div className="flex h-34 w-full max-w-sm flex-col gap-3.5 rounded-card border border-line bg-card p-4">
            <Skeleton className="h-5.5 w-22 rounded-chip" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[62%]" />
            <Skeleton className="h-3 w-[36%]" />
          </div>
        </VariantRow>
      </GallerySection>
    </>
  );
}

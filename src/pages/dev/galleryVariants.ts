import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import type { Alert } from '@/components/ui/alert';
import type { Avatar } from '@/components/ui/avatar';
import type { badgeVariants } from '@/components/ui/badge';
import type { buttonVariants } from '@/components/ui/button';
import type { Card } from '@/components/ui/card';
import type { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { SelectTrigger } from '@/components/ui/select';
import type { tabsListVariants } from '@/components/ui/tabs';
import type { toggleVariants } from '@/components/ui/toggle';

type Values<T> = Exclude<T, null | undefined>;

export type ButtonVariant = Values<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = Values<VariantProps<typeof buttonVariants>['size']>;
export type BadgeVariant = Values<VariantProps<typeof badgeVariants>['variant']>;
export type AlertVariant = Values<ComponentProps<typeof Alert>['variant']>;
export type ToggleVariant = Values<VariantProps<typeof toggleVariants>['variant']>;
export type ToggleSize = Values<VariantProps<typeof toggleVariants>['size']>;
export type TabsListVariant = Values<VariantProps<typeof tabsListVariants>['variant']>;
export type AvatarSize = Values<ComponentProps<typeof Avatar>['size']>;
export type CardSize = Values<ComponentProps<typeof Card>['size']>;
export type SelectSize = Values<ComponentProps<typeof SelectTrigger>['size']>;
export type MenuItemVariant = Values<ComponentProps<typeof DropdownMenuItem>['variant']>;
export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';
export type ToastKind = 'message' | 'success' | 'info' | 'warning' | 'error' | 'loading';

// A Record keyed by the union fails typecheck when a component gains a variant the gallery
// does not show, which a plain array would not.
function keysOf<T extends string>(record: Record<T, true>): T[] {
  return Object.keys(record).filter((key): key is T => key in record);
}

export const BUTTON_VARIANTS = keysOf<ButtonVariant>({
  default: true,
  secondary: true,
  outline: true,
  ghost: true,
  destructive: true,
  link: true,
});

const ALL_BUTTON_SIZES = keysOf<ButtonSize>({
  xs: true,
  sm: true,
  default: true,
  lg: true,
  'icon-xs': true,
  'icon-sm': true,
  icon: true,
  'icon-lg': true,
});

export const BUTTON_TEXT_SIZES = ALL_BUTTON_SIZES.filter((size) => !size.startsWith('icon'));
export const BUTTON_ICON_SIZES = ALL_BUTTON_SIZES.filter((size) => size.startsWith('icon'));

export const BADGE_VARIANTS = keysOf<BadgeVariant>({
  default: true,
  secondary: true,
  destructive: true,
  outline: true,
  ghost: true,
  link: true,
});
export const ALERT_VARIANTS = keysOf<AlertVariant>({ default: true, destructive: true });
export const TOGGLE_VARIANTS = keysOf<ToggleVariant>({ default: true, outline: true });
export const TOGGLE_SIZES = keysOf<ToggleSize>({ sm: true, default: true, lg: true });
export const TABS_LIST_VARIANTS = keysOf<TabsListVariant>({ default: true, line: true });
export const AVATAR_SIZES = keysOf<AvatarSize>({ sm: true, default: true, lg: true });
export const CARD_SIZES = keysOf<CardSize>({ default: true, sm: true });
export const SELECT_SIZES = keysOf<SelectSize>({ sm: true, default: true });
export const MENU_ITEM_VARIANTS = keysOf<MenuItemVariant>({ default: true, destructive: true });
export const DRAWER_DIRECTIONS = keysOf<DrawerDirection>({
  bottom: true,
  right: true,
  top: true,
  left: true,
});
export const TOAST_KINDS = keysOf<ToastKind>({
  message: true,
  success: true,
  info: true,
  warning: true,
  error: true,
  loading: true,
});

export const FIELD_STATES = ['default', 'disabled', 'invalid'] as const;

export interface CatalogAxis {
  axis: string;
  values: readonly string[];
}

export interface CatalogEntry {
  id: string;
  name: string;
  source: string;
  axes: readonly CatalogAxis[];
}

const UI_DIR = 'components/ui';
const LEAGUE_DIR = 'components/league';

export const PRIMITIVES = {
  button: {
    id: 'button',
    name: 'Button',
    source: `${UI_DIR}/button.tsx`,
    axes: [
      { axis: 'variant', values: BUTTON_VARIANTS },
      { axis: 'size', values: ALL_BUTTON_SIZES },
      { axis: 'state', values: ['enabled', 'disabled'] },
    ],
  },
  badge: {
    id: 'badge',
    name: 'Badge',
    source: `${UI_DIR}/badge.tsx`,
    axes: [{ axis: 'variant', values: BADGE_VARIANTS }],
  },
  alert: {
    id: 'alert',
    name: 'Alert',
    source: `${UI_DIR}/alert.tsx`,
    axes: [{ axis: 'variant', values: ALERT_VARIANTS }],
  },
  card: {
    id: 'card',
    name: 'Card',
    source: `${UI_DIR}/card.tsx`,
    axes: [{ axis: 'size', values: CARD_SIZES }],
  },
  input: {
    id: 'input',
    name: 'Input',
    source: `${UI_DIR}/input.tsx`,
    axes: [{ axis: 'state', values: FIELD_STATES }],
  },
  textarea: {
    id: 'textarea',
    name: 'Textarea',
    source: `${UI_DIR}/textarea.tsx`,
    axes: [{ axis: 'state', values: FIELD_STATES }],
  },
  select: {
    id: 'select',
    name: 'Select',
    source: `${UI_DIR}/select.tsx`,
    axes: [
      { axis: 'size', values: SELECT_SIZES },
      { axis: 'state', values: ['enabled', 'disabled'] },
    ],
  },
  toggle: {
    id: 'toggle',
    name: 'Toggle',
    source: `${UI_DIR}/toggle.tsx`,
    axes: [
      { axis: 'variant', values: TOGGLE_VARIANTS },
      { axis: 'size', values: TOGGLE_SIZES },
      { axis: 'state', values: ['off', 'on', 'disabled'] },
    ],
  },
  'toggle-group': {
    id: 'toggle-group',
    name: 'ToggleGroup',
    source: `${UI_DIR}/toggle-group.tsx`,
    axes: [
      { axis: 'variant', values: TOGGLE_VARIANTS },
      { axis: 'spacing', values: ['0', '2'] },
    ],
  },
  tabs: {
    id: 'tabs',
    name: 'Tabs',
    source: `${UI_DIR}/tabs.tsx`,
    axes: [{ axis: 'variant', values: TABS_LIST_VARIANTS }],
  },
  avatar: {
    id: 'avatar',
    name: 'Avatar',
    source: `${UI_DIR}/avatar.tsx`,
    axes: [
      { axis: 'size', values: AVATAR_SIZES },
      { axis: 'extras', values: ['badge', 'group'] },
    ],
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    source: `${UI_DIR}/skeleton.tsx`,
    axes: [{ axis: 'shape', values: ['line', 'pill', 'block'] }],
  },
  'dropdown-menu': {
    id: 'dropdown-menu',
    name: 'DropdownMenu',
    source: `${UI_DIR}/dropdown-menu.tsx`,
    axes: [
      { axis: 'item variant', values: MENU_ITEM_VARIANTS },
      { axis: 'item kind', values: ['item', 'checkbox', 'radio', 'label', 'separator'] },
    ],
  },
  dialog: {
    id: 'dialog',
    name: 'Dialog',
    source: `${UI_DIR}/dialog.tsx`,
    axes: [{ axis: 'state', values: ['open'] }],
  },
  drawer: {
    id: 'drawer',
    name: 'Drawer',
    source: `${UI_DIR}/drawer.tsx`,
    axes: [{ axis: 'direction', values: DRAWER_DIRECTIONS }],
  },
  toast: {
    id: 'toast',
    name: 'Toast (sonner)',
    source: `${UI_DIR}/sonner.tsx`,
    axes: [{ axis: 'kind', values: TOAST_KINDS }],
  },
} satisfies Record<string, CatalogEntry>;

export const PRIMITIVE_CATALOG: readonly CatalogEntry[] = Object.values(PRIMITIVES);

export const LEAGUE = {
  'skill-level-square': {
    id: 'skill-level-square',
    name: 'SkillLevelSquare',
    source: `${LEAGUE_DIR}/SkillLevelSquare.tsx`,
    axes: [{ axis: 'skillLevel', values: ['1–9'] }],
  },
  'status-badge': {
    id: 'status-badge',
    name: 'StatusBadge',
    source: `${LEAGUE_DIR}/StatusBadge.tsx`,
    axes: [{ axis: 'status', values: ['scheduled', 'in_progress', 'submitted'] }],
  },
  'reason-chip': {
    id: 'reason-chip',
    name: 'ReasonChip',
    source: `${LEAGUE_DIR}/ReasonChip.tsx`,
    axes: [
      {
        axis: 'reason',
        values: ['would_break_23', 'already_put_up', 'not_on_roster', 'side_complete', 'unpaid'],
      },
    ],
  },
  'fixture-card': {
    id: 'fixture-card',
    name: 'FixtureCard',
    source: `${LEAGUE_DIR}/FixtureCard.tsx`,
    axes: [{ axis: 'status', values: ['scheduled', 'in_progress', 'submitted'] }],
  },
  'bye-banner': {
    id: 'bye-banner',
    name: 'ByeBanner',
    source: `${LEAGUE_DIR}/ByeBanner.tsx`,
    axes: [],
  },
  'roster-row': {
    id: 'roster-row',
    name: 'RosterRow',
    source: `${LEAGUE_DIR}/RosterRow.tsx`,
    axes: [
      { axis: 'selection', values: ['none', 'selected'] },
      { axis: 'paid', values: ['paid', 'unpaid'] },
    ],
  },
  'scoresheet-row': {
    id: 'scoresheet-row',
    name: 'ScoresheetRow',
    source: `${LEAGUE_DIR}/ScoresheetRow.tsx`,
    axes: [{ axis: 'state', values: ['played', 'not played'] }],
  },
  stepper: {
    id: 'stepper',
    name: 'Stepper',
    source: `${LEAGUE_DIR}/Stepper.tsx`,
    axes: [{ axis: 'state', values: ['mid', 'at race', 'at zero', 'uncapped'] }],
  },
  'error-banner': {
    id: 'error-banner',
    name: 'ErrorBanner',
    source: `${LEAGUE_DIR}/ErrorBanner.tsx`,
    axes: [{ axis: 'retry', values: ['with', 'without'] }],
  },
  'empty-state': {
    id: 'empty-state',
    name: 'EmptyState',
    source: `${LEAGUE_DIR}/EmptyState.tsx`,
    axes: [{ axis: 'action', values: ['with', 'without'] }],
  },
} satisfies Record<string, CatalogEntry>;

export const LEAGUE_CATALOG: readonly CatalogEntry[] = Object.values(LEAGUE);

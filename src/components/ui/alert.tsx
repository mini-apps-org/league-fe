import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const alertVariants = cva(
  "group/alert flex w-full items-center gap-2.5 rounded-lg py-2.5 pr-2.5 pl-3.5 text-left text-sm font-medium [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: 'border border-line bg-card text-card-foreground',
        warn: 'bg-warn-soft text-foreground [&>svg]:text-warn',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('font-semibold', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('flex-1', className)} {...props} />;
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-action" className={cn('shrink-0', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, AlertAction };

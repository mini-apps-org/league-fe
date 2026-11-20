import type { PropsWithChildren } from 'react';

export const PageTitle = ({ children }: PropsWithChildren) => {
  return (
    <h1 className="sr-only lg:not-sr-only lg:text-[28px] lg:leading-tight lg:font-bold">
      {children}
    </h1>
  );
};

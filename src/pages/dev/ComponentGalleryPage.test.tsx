import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { ComponentGalleryPage } from './ComponentGalleryPage';
import { LEAGUE_CATALOG, PRIMITIVE_CATALOG } from './galleryVariants';

describe('ComponentGalleryPage', () => {
  it.each([...PRIMITIVE_CATALOG, ...LEAGUE_CATALOG])('renders a section for $name', ({ name }) => {
    renderWithProviders(<ComponentGalleryPage />);

    expect(screen.getByRole('region', { name })).toBeInTheDocument();
  });
});

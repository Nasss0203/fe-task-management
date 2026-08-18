import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/shared/ui/badge';

describe('Badge component', () => {
  it('renders the badge with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'default');
  });

  it('renders the badge with a specific variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badge = screen.getByText('Destructive Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });

  it('applies additional class names', () => {
    render(<Badge className="custom-class">Custom Class Badge</Badge>);
    const badge = screen.getByText('Custom Class Badge');
    expect(badge).toHaveClass('custom-class');
  });
});

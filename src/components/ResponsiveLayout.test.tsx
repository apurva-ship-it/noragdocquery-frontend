import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResponsiveLayout from './ResponsiveLayout';

describe('ResponsiveLayout', () => {
  it('renders left pane content', () => {
    render(<ResponsiveLayout left={<span>Left Content</span>} right={<span>Right Content</span>} />);
    expect(screen.getByText('Left Content')).toBeInTheDocument();
  });

  it('renders right pane content', () => {
    render(<ResponsiveLayout left={<span>Left Content</span>} right={<span>Right Content</span>} />);
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });

  it('applies flex-col class for stacked (mobile) layout by default', () => {
    const { container } = render(
      <ResponsiveLayout left={<span>L</span>} right={<span>R</span>} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('flex-col');
  });

  it('applies responsive side-by-side class for wider screens', () => {
    const { container } = render(
      <ResponsiveLayout left={<span>L</span>} right={<span>R</span>} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-[769px]:flex-row');
  });

  it('merges custom className onto the wrapper', () => {
    const { container } = render(
      <ResponsiveLayout left={<span>L</span>} right={<span>R</span>} className="my-custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-custom-class');
  });

  it('renders both panes with equal half-width classes on wide screens', () => {
    const { container } = render(
      <ResponsiveLayout left={<span>L</span>} right={<span>R</span>} />
    );
    const panes = container.firstChild?.childNodes;
    expect(panes).toHaveLength(2);
    (Array.from(panes!) as HTMLElement[]).forEach((pane) => {
      expect(pane.className).toContain('w-full');
      expect(pane.className).toContain('min-[769px]:w-1/2');
    });
  });
});

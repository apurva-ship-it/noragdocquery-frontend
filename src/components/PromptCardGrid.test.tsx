import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PromptCardGrid from './PromptCardGrid';

describe('PromptCardGrid', () => {
  it('renders 8 prompt cards', () => {
    render(<PromptCardGrid />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(8);
  });

  it('renders the responsive grid container', () => {
    render(<PromptCardGrid />);
    const grid = screen.getByTestId('prompt-card-grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-4');
  });

  it('no card is selected initially', () => {
    render(<PromptCardGrid />);
    const cards = screen.getAllByRole('button', { hidden: false }).filter(
      (el) => el.hasAttribute('aria-pressed'),
    );
    cards.forEach((card) => {
      expect(card).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('selects a card when clicked', () => {
    render(<PromptCardGrid />);
    const cards = screen.getAllByRole('button', { hidden: false }).filter(
      (el) => el.hasAttribute('aria-pressed'),
    );
    fireEvent.click(cards[0]);
    expect(cards[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('deselects the previously selected card when another is clicked', () => {
    render(<PromptCardGrid />);
    const cards = screen.getAllByRole('button', { hidden: false }).filter(
      (el) => el.hasAttribute('aria-pressed'),
    );
    fireEvent.click(cards[0]);
    expect(cards[0]).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(cards[1]);
    expect(cards[1]).toHaveAttribute('aria-pressed', 'true');
    expect(cards[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('only one card is selected at a time', () => {
    render(<PromptCardGrid />);
    const cards = screen.getAllByRole('button', { hidden: false }).filter(
      (el) => el.hasAttribute('aria-pressed'),
    );
    fireEvent.click(cards[2]);
    fireEvent.click(cards[5]);

    const selected = cards.filter((c) => c.getAttribute('aria-pressed') === 'true');
    expect(selected).toHaveLength(1);
    expect(cards[5]).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies selected highlight classes to the chosen card', () => {
    render(<PromptCardGrid />);
    const firstCard = screen.getByTestId('prompt-card-1');
    fireEvent.click(firstCard);
    expect(firstCard.className).toContain('border-blue-500');
    expect(firstCard.className).toContain('bg-blue-50');
  });

  it('removes highlight from a card when another is selected', () => {
    render(<PromptCardGrid />);
    const firstCard = screen.getByTestId('prompt-card-1');
    const secondCard = screen.getByTestId('prompt-card-2');

    fireEvent.click(firstCard);
    fireEvent.click(secondCard);

    expect(firstCard.className).toContain('bg-white');
    expect(secondCard.className).toContain('bg-blue-50');
  });
});

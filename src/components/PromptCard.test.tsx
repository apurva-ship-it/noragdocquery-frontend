import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PromptCard from './PromptCard';

const defaultProps = {
  id: '1',
  title: 'Test Title',
  tag: 'General',
  description: 'Test description',
  prompt: 'Full prompt text',
  isSelected: false,
  onSelect: vi.fn(),
};

describe('PromptCard', () => {
  it('renders title, tag, and description', () => {
    render(<PromptCard {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('hides prompt text by default', () => {
    render(<PromptCard {...defaultProps} />);
    expect(screen.queryByText('Full prompt text')).not.toBeInTheDocument();
  });

  it('shows prompt text after clicking Show Prompt', () => {
    render(<PromptCard {...defaultProps} />);
    // Use exact name to avoid matching the outer card div whose accessible name also contains 'Show Prompt'
    fireEvent.click(screen.getByRole('button', { name: 'Show Prompt' }));
    expect(screen.getByText('Full prompt text')).toBeInTheDocument();
  });

  it('hides prompt text after toggling Show then Hide', () => {
    render(<PromptCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Prompt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide Prompt' }));
    expect(screen.queryByText('Full prompt text')).not.toBeInTheDocument();
  });

  it('calls onSelect with card id when the card is clicked', () => {
    const onSelect = vi.fn();
    render(<PromptCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('prompt-card-1'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('applies selected border and background when isSelected is true', () => {
    render(<PromptCard {...defaultProps} isSelected={true} />);
    const card = screen.getByTestId('prompt-card-1');
    expect(card.className).toContain('border-blue-500');
    expect(card.className).toContain('bg-blue-50');
  });

  it('applies unselected border and white background when isSelected is false', () => {
    render(<PromptCard {...defaultProps} isSelected={false} />);
    const card = screen.getByTestId('prompt-card-1');
    expect(card.className).toContain('border-gray-200');
    expect(card.className).toContain('bg-white');
  });

  it('expander button does not trigger card selection', () => {
    const onSelect = vi.fn();
    render(<PromptCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Prompt' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('sets aria-pressed based on isSelected', () => {
    const { rerender } = render(<PromptCard {...defaultProps} isSelected={false} />);
    expect(screen.getByTestId('prompt-card-1')).toHaveAttribute('aria-pressed', 'false');

    rerender(<PromptCard {...defaultProps} isSelected={true} />);
    expect(screen.getByTestId('prompt-card-1')).toHaveAttribute('aria-pressed', 'true');
  });
});

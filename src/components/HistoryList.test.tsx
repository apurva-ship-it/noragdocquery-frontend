import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HistoryList, { HistoryEntry } from './HistoryList';

describe('HistoryList', () => {
  it('renders empty-state message when entries is empty', () => {
    render(<HistoryList entries={[]} />);
    expect(screen.getByText(/ask a question/i)).toBeInTheDocument();
  });

  it('renders question and answer for a completed entry', () => {
    const entries: HistoryEntry[] = [
      { id: '1', question: 'What is RAG?', answer: 'Retrieval-Augmented Generation.', streaming: false },
    ];
    render(<HistoryList entries={entries} />);
    expect(screen.getByText('What is RAG?')).toBeInTheDocument();
    expect(screen.getByText('Retrieval-Augmented Generation.')).toBeInTheDocument();
  });

  it('shows streaming cursor while streaming is true', () => {
    const entries: HistoryEntry[] = [
      { id: '1', question: 'Hello?', answer: 'Hi', streaming: true },
    ];
    const { container } = render(<HistoryList entries={entries} />);
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).toBeInTheDocument();
  });

  it('does not show streaming cursor when streaming is false', () => {
    const entries: HistoryEntry[] = [
      { id: '1', question: 'Hello?', answer: 'Hi', streaming: false },
    ];
    const { container } = render(<HistoryList entries={entries} />);
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).not.toBeInTheDocument();
  });

  it('renders an error alert when entry has an error', () => {
    const entries: HistoryEntry[] = [
      { id: '1', question: 'Will this fail?', answer: '', streaming: false, error: 'Server error 500' },
    ];
    render(<HistoryList entries={entries} />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Server error 500');
  });

  it('renders multiple entries in order', () => {
    const entries: HistoryEntry[] = [
      { id: '1', question: 'First question', answer: 'First answer', streaming: false },
      { id: '2', question: 'Second question', answer: 'Second answer', streaming: false },
    ];
    render(<HistoryList entries={entries} />);
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('Second question')).toBeInTheDocument();
    expect(screen.getByText('First answer')).toBeInTheDocument();
    expect(screen.getByText('Second answer')).toBeInTheDocument();
  });

  it('does not show empty-state when at least one entry exists', () => {
    const entries: HistoryEntry[] = [
      { id: '1', question: 'Q', answer: 'A', streaming: false },
    ];
    render(<HistoryList entries={entries} />);
    expect(screen.queryByText(/ask a question/i)).not.toBeInTheDocument();
  });
});

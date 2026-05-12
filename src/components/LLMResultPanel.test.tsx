import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LLMResultPanel, LLMResult } from './LLMResultPanel';

describe('LLMResultPanel', () => {
  describe('loading state', () => {
    it('renders skeleton with aria-busy when loading is true', () => {
      const results: LLMResult[] = [{ id: 'GPT-4', loading: true }];
      render(<LLMResultPanel results={results} />);
      expect(screen.getByLabelText('Loading result for GPT-4')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading result for GPT-4')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not render error or text content while loading', () => {
      const results: LLMResult[] = [{ id: 'GPT-4', loading: true, text: 'hidden', error: 'hidden' }];
      render(<LLMResultPanel results={results} />);
      expect(screen.queryByText('hidden')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('success state', () => {
    const results: LLMResult[] = [
      { id: 'Claude-3', loading: false, text: 'Hello world response', latency: 420 },
    ];

    it('renders response text', () => {
      render(<LLMResultPanel results={results} />);
      expect(screen.getByText('Hello world response')).toBeInTheDocument();
    });

    it('renders latency in milliseconds', () => {
      render(<LLMResultPanel results={results} />);
      expect(screen.getByText('Latency: 420 ms')).toBeInTheDocument();
    });

    it('renders copy button', () => {
      render(<LLMResultPanel results={results} />);
      expect(screen.getByRole('button', { name: /copy claude-3 result/i })).toBeInTheDocument();
    });

    it('does not render latency when it is absent', () => {
      const noLatency: LLMResult[] = [{ id: 'Claude-3', loading: false, text: 'text' }];
      render(<LLMResultPanel results={noLatency} />);
      expect(screen.queryByText(/latency/i)).not.toBeInTheDocument();
    });

    it('does not render error alert on success', () => {
      render(<LLMResultPanel results={results} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('copy button', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls clipboard.writeText with result text on click', async () => {
      const results: LLMResult[] = [{ id: 'GPT-4', loading: false, text: 'copy me' }];
      render(<LLMResultPanel results={results} />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /copy gpt-4 result/i }));
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
    });

    it('shows "Copied!" feedback after clicking copy', async () => {
      const results: LLMResult[] = [{ id: 'GPT-4', loading: false, text: 'copy me' }];
      render(<LLMResultPanel results={results} />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /copy gpt-4 result/i }));
      });
      expect(screen.getByRole('button', { name: /copy gpt-4 result/i })).toHaveTextContent('Copied!');
    });

    it('reverts button label to "Copy" after 2 seconds', async () => {
      const results: LLMResult[] = [{ id: 'GPT-4', loading: false, text: 'copy me' }];
      render(<LLMResultPanel results={results} />);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /copy gpt-4 result/i }));
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByRole('button', { name: /copy gpt-4 result/i })).toHaveTextContent('Copy');
    });

    it('copy button is disabled when text is absent', () => {
      const results: LLMResult[] = [{ id: 'GPT-4', loading: false }];
      render(<LLMResultPanel results={results} />);
      expect(screen.getByRole('button', { name: /copy gpt-4 result/i })).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('renders error message in an alert role element', () => {
      const results: LLMResult[] = [{ id: 'Gemini', loading: false, error: 'API rate limit exceeded' }];
      render(<LLMResultPanel results={results} />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('API rate limit exceeded');
    });

    it('does not render text or copy button in error state', () => {
      const results: LLMResult[] = [{ id: 'Gemini', loading: false, error: 'Timeout' }];
      render(<LLMResultPanel results={results} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByText(/latency/i)).not.toBeInTheDocument();
    });
  });

  describe('LLM label header', () => {
    it('renders the LLM id as a visible label', () => {
      const results: LLMResult[] = [{ id: 'Mistral-7B', loading: false, text: 'hi' }];
      render(<LLMResultPanel results={results} />);
      expect(screen.getByText('Mistral-7B')).toBeInTheDocument();
    });
  });

  describe('multiple results', () => {
    it('renders a panel for each result', () => {
      const results: LLMResult[] = [
        { id: 'LLM-A', loading: true },
        { id: 'LLM-B', loading: false, text: 'done' },
        { id: 'LLM-C', loading: false, error: 'failed' },
      ];
      render(<LLMResultPanel results={results} />);
      expect(screen.getByText('LLM-A')).toBeInTheDocument();
      expect(screen.getByText('LLM-B')).toBeInTheDocument();
      expect(screen.getByText('LLM-C')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading result for LLM-A')).toBeInTheDocument();
      expect(screen.getByText('done')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('failed');
    });
  });
});

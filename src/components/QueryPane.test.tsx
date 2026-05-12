import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import QueryPane from './QueryPane';

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe('QueryPane', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders textarea and submit button', () => {
    render(<QueryPane />);
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submit button is disabled when textarea is empty', () => {
    render(<QueryPane />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('submit button is enabled when textarea has text', async () => {
    render(<QueryPane />);
    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'Hello');
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
  });

  it('sends POST request to /api/query with query in JSON body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      body: makeStream(['data: {"token":"Hello"}\n\ndata: [DONE]\n\n']),
    } as unknown as Response);

    render(<QueryPane />);
    const textarea = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(textarea, 'What is AI?');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/query',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ query: 'What is AI?' }),
        })
      );
    });
  });

  it('shows spinner while waiting for first token', async () => {
    let resolveStream!: () => void;
    const slowStream = new ReadableStream<Uint8Array>({
      start(controller) {
        resolveStream = () => {
          controller.close();
        };
      },
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      body: slowStream,
    } as unknown as Response);

    render(<QueryPane />);
    const textarea = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(textarea, 'Test question');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Waiting for response…')).toBeInTheDocument();
    });

    resolveStream();
  });

  it('appends question to history on submit', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      body: makeStream(['data: {"token":"World"}\n\n']),
    } as unknown as Response);

    render(<QueryPane />);
    const textarea = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(textarea, 'My test question');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('My test question')).toBeInTheDocument();
    });
  });

  it('streams tokens into the answer in real time', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"token":"Hello"}\n\n'));
        controller.enqueue(encoder.encode('data: {"token":" world"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      body: stream,
    } as unknown as Response);

    render(<QueryPane />);
    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'Stream test');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('displays error when fetch response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue('Internal Server Error'),
    } as unknown as Response);

    render(<QueryPane />);
    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'Bad request');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Internal Server Error');
    });
  });

  it('clears textarea after submission', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      body: makeStream([]),
    } as unknown as Response);

    render(<QueryPane />);
    const textarea = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(textarea, 'Clear me');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('handles raw text tokens (non-JSON SSE data)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      body: makeStream(['data: raw token text\n\n']),
    } as unknown as Response);

    render(<QueryPane />);
    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'Raw test');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('raw token text')).toBeInTheDocument();
    });
  });
});

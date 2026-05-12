import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UploadPane from './UploadPane';

const mockDocuments = [
  { id: 1, name: 'report.txt', char_count: 4200 },
  { id: 2, name: 'notes.pdf', char_count: 11050 },
];

describe('UploadPane', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const setupFetch = (docs = mockDocuments) => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/documents' && options?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url === '/api/documents') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(docs) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  };

  it('fetches and displays documents on mount', async () => {
    setupFetch();
    render(<UploadPane />);

    await waitFor(() => {
      expect(screen.getByText('report.txt')).toBeInTheDocument();
      expect(screen.getByText('4,200 chars')).toBeInTheDocument();
      expect(screen.getByText('11,050 chars')).toBeInTheDocument();
    });
  });

  it('renders file input accepting only allowed extensions', async () => {
    setupFetch([]);
    render(<UploadPane />);
    await waitFor(() => expect(screen.queryByLabelText('Loading documents')).not.toBeInTheDocument());

    const input = screen.getByLabelText(/select file/i);
    expect(input).toHaveAttribute('accept', '.txt,.pdf,.docx');
  });

  it('upload button is disabled when no file is selected', async () => {
    setupFetch([]);
    render(<UploadPane />);
    await waitFor(() => expect(screen.queryByLabelText('Loading documents')).not.toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('shows no-documents message when list is empty', async () => {
    setupFetch([]);
    render(<UploadPane />);

    await waitFor(() => {
      expect(screen.getByText('No documents uploaded yet.')).toBeInTheDocument();
    });
  });

  it('shows dismissible alert when file exceeds 10 MB', async () => {
    setupFetch([]);
    render(<UploadPane />);
    await waitFor(() => expect(screen.queryByLabelText('Loading documents')).not.toBeInTheDocument());

    const largeFile = new File([''], 'big.txt', { type: 'text/plain' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [largeFile] } });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/exceeds the 10 MB size limit/i);

    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks upload and shows alert for disallowed extension', async () => {
    setupFetch([]);
    render(<UploadPane />);
    await waitFor(() => expect(screen.queryByLabelText('Loading documents')).not.toBeInTheDocument());

    const badFile = new File(['content'], 'script.js', { type: 'text/javascript' });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [badFile] } });

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid file type/i);
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('enables upload button after valid file selection', async () => {
    setupFetch([]);
    render(<UploadPane />);
    await waitFor(() => expect(screen.queryByLabelText('Loading documents')).not.toBeInTheDocument());

    const file = new File(['hello world'], 'doc.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByRole('button', { name: 'Upload' })).not.toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('refreshes document list after successful upload', async () => {
    let getCallCount = 0;
    const updatedDocs = [...mockDocuments, { id: 3, name: 'new.txt', char_count: 500 }];

    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/documents' && options?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url === '/api/documents') {
        getCallCount++;
        const docs = getCallCount > 1 ? updatedDocs : mockDocuments;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(docs) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<UploadPane />);
    await waitFor(() => expect(screen.getByText('report.txt')).toBeInTheDocument());

    const file = new File(['hello'], 'new.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(screen.getByText('new.txt')).toBeInTheDocument());
    expect(screen.getByText('500 chars')).toBeInTheDocument();
  });

  it('shows server 413 alert on failed upload', async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/documents' && options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 413,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<UploadPane />);

    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/server size limit/i);
  });

  it('shows server 415 alert on unsupported type', async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/documents' && options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 415,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<UploadPane />);

    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/not supported by the server/i);
  });

  it('shows network error alert when fetch throws', async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/documents' && options?.method === 'POST') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<UploadPane />);

    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/select file/i);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
  });
});

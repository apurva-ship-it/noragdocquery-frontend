export interface DocumentSummary {
  document_name: string;
  total_characters: number;
  chunk_count: number;
}

export interface UploadResponse {
  documents: DocumentSummary[];
}

export interface QAPair {
  question: string;
  answer: string;
  streaming: boolean;
}

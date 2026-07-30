export interface AudioChunk {
  chunkNumber: number;
  chunk: Float32Array;
}

export type RecordingMetadata = {
  sampleRate: number;
  channelCount: number;
  bitsPerSample: number;
  mimeType: string;
};
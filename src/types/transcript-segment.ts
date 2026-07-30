import { SoapNote } from "./clinical-type";

export interface TranscriptSegment {
  speaker: string;
  text: string;
}

export interface SpeakerTranscriptSegment {
  Speaker: string;
  Start: number;
  End: number;
  Text: string;
}



export interface TranscriptResponse {
  Text: string;
  Segments: SpeakerTranscriptSegment[];
  SoapNote?: SoapNote;
}
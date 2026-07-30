export interface PhysicianNoteStatus {
  isAvailable: boolean;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface PhysicianNote {
  physicianNoteId: { value: string };
  soapNote: SoapNote;
}
export interface PhysicianNoteStatus {
  isAvailable: boolean;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Icd10Code {
  code: string;
  description: string;
}

export interface PhysicianNote {
  physicianNoteId: { value: string };
  soapNote: SoapNote;
  icd10Codes: Icd10Code[];
}
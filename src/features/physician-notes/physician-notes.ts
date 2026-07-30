import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { SoapNote } from '../../types/clinical-type';

export interface SoapNoteSection {
  key: keyof SoapNote;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-physician-notes',
  imports: [CommonModule],
  templateUrl: './physician-notes.html',
  styleUrl: './physician-notes.css',
})
export class PhysicianNotes {

  soapNote = input<SoapNote | null | undefined>(null);

  readonly sections: SoapNoteSection[] = [
    { key: 'subjective', label: 'Subjective', icon: '💬' },
    { key: 'objective',  label: 'Objective',  icon: '🔬' },
    { key: 'assessment', label: 'Assessment', icon: '📋' },
    { key: 'plan',       label: 'Plan',       icon: '🗂️' },
  ];
}

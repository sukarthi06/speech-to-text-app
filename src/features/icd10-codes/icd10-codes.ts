import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Icd10Code } from '../../types/clinical-type';

@Component({
  selector: 'app-icd10-codes',
  imports: [CommonModule],
  templateUrl: './icd10-codes.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './icd10-codes.css',
})
export class Icd10Codes {

  icd10Codes = input<Icd10Code[] | null | undefined>(null);
}
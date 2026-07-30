import { Injectable, signal } from '@angular/core';
import { PhysicianNote, PhysicianNoteStatus } from '../types/clinical-type';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PhysicianNoteService {
  private readonly baseUrl = environment.physiciannoteservice; // adjust to your route

  readonly note = signal<PhysicianNote | null>(null);
  readonly isPolling = signal(false);
  readonly error = signal<string | null>(null);

  async waitForNote(recordingId: string): Promise<void> {
    this.isPolling.set(true);
    this.error.set(null);
    this.note.set(null);

    const maxWaitMs = 2 * 60 * 1000; // 2 minutes total, adjust as needed
    const startTime = Date.now();
    let delayMs = 2000; // start at 2s
    const maxDelayMs = 10000; // cap at 10s between checks

    try {
      while (Date.now() - startTime < maxWaitMs) {
        const status = await this.checkAvailability(recordingId);

        if (status.isAvailable) {
          const note = await this.getNote(recordingId);
          this.note.set(note);
          return;
        }

        await this.delay(delayMs);
        delayMs = Math.min(delayMs * 1.5, maxDelayMs); // back off, capped
      }

      this.error.set('Physician note was not ready in time.');
    } catch (err) {
      this.error.set('Failed to fetch physician note.');
      throw err;
    } finally {
      this.isPolling.set(false);
    }
  }

  private async checkAvailability(recordingId: string): Promise<PhysicianNoteStatus> {
    const res = await fetch(`${this.baseUrl}/${recordingId}/status`);
    if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
    const isAvailable: boolean = await res.json();
    return { isAvailable };
  }

  private async getNote(recordingId: string): Promise<PhysicianNote> {
    const res = await fetch(`${this.baseUrl}/${recordingId}`);
    if (!res.ok) throw new Error(`Note fetch failed: ${res.status}`);
    return res.json();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

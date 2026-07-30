import { Component, input } from '@angular/core';
import { TranscriptSegment } from '../../types/transcript-segment';

@Component({
  selector: 'app-audio-transcript',
  imports: [],
  templateUrl: './audio-transcript.html',
  styleUrl: './audio-transcript.css',
})
export class AudioTranscript {
  public segments = input<TranscriptSegment[]>([]);

  private colorPool = ['speaker-blue', 'speaker-green', 'speaker-amber', 'speaker-coral'];
  private speakerColors = new Map<string, string>();

  getSpeakerClass(speaker: string): string {
    if (!this.speakerColors.has(speaker)) {
      const idx = this.speakerColors.size % this.colorPool.length;
      this.speakerColors.set(speaker, this.colorPool[idx]);
    }
    return this.speakerColors.get(speaker)!;
  }

}

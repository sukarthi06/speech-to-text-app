import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioRecorder } from "../features/audio-recorder/audio-recorder";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AudioRecorder],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('voice-text-app');
}

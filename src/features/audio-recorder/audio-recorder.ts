import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AudioVisualizer } from '../audio-visualizer/audio-visualizer';
import { environment } from '../../environments/environment';
import { AudioTranscript } from '../audio-transcript/audio-transcript';
import { TranscriptResponse, TranscriptSegment } from '../../types/transcript-segment';
import { PhysicianNotes } from '../physician-notes/physician-notes';
import { RecordingMetadata } from '../../types/audio-type';
import { SoapNote, Icd10Code } from '../../types/clinical-type';
import { PhysicianNoteService } from '../../services/physician-note-service';
import { Icd10Codes } from "../icd10-codes/icd10-codes";

@Component({
  selector: 'app-audio-recorder',
  imports: [AudioVisualizer, AudioTranscript, PhysicianNotes, Icd10Codes],
  templateUrl: './audio-recorder.html',
  styleUrl: './audio-recorder.css',
})
export class AudioRecorder implements OnInit, OnDestroy {

  private audioContext: AudioContext | null = null;  
  private source: MediaStreamAudioSourceNode | null = null;
  private node: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private chunkWorker: Worker;
  private recordingId: string | null = null;
  private keepAlive?: ReturnType<typeof setInterval>;

  // Array to store all audio chunks
  allChunks: Float32Array[] = [];
  private chunkCounter = 0;
  
  protected readonly noteService = inject(PhysicianNoteService);

  // Single source of truth for the recorder lifecycle.
  //   idle       -> nothing recorded yet
  //   recording  -> capturing audio
  //   paused     -> capture suspended, can resume or stop
  //   processing -> Stop pressed, waiting for the physician note (spinner)
  //   done       -> note received OR not; everything locked
  public phase = signal<'idle' | 'recording' | 'paused' | 'processing' | 'done'>('idle');

  // Each button reads exactly one of these.
  public canStart = computed(() => this.phase() === 'idle' || this.phase() === 'paused');
  public canPause = computed(() => this.phase() === 'recording');
  public canStop = computed(() => this.phase() === 'recording' || this.phase() === 'paused');

  public transcript = signal('');
  public analyser = signal<AnalyserNode | null>(null);
  public segments = signal<TranscriptSegment[]>([]);
  public soapNote = signal<SoapNote | null>(null);
  public icd10Codes = signal<Icd10Code[] | null>(null);

  constructor() {
    // Initialize worker
    this.chunkWorker = new Worker(
      new URL('../../workers/chunk-processor.worker', import.meta.url)
    );

    // Listen to messages from worker
    this.chunkWorker.onmessage = (event: MessageEvent) => {
      //console.log('Processed chunk from worker:', event.data.message);
      //console.log('Received in component:', event.data);

      if (typeof event.data === 'string'){

        try {
          const parsed = JSON.parse(event.data);
          this.recordingId = parsed.Value;
          console.log("RecordingId: " + this.recordingId);
          return;
        } catch (e) {
          console.error("Not a valid recording Id", e);
        }
      }
      
      try{
        const data: TranscriptResponse = JSON.parse(event.data);
        this.transcript.set(this.transcript() + data.Text);
        this.segments.update(current => [
          ...current,
          ...data.Segments.map(s => ({
            speaker: s.Speaker,
            text: s.Text
          }))
        ]);

        if (data.SoapNote) {
          this.soapNote.set(data.SoapNote);
        }
      }catch(e){
        
      }
    };
  }
  
  ngOnInit() {    
    this.chunkWorker.postMessage({ type: 'init', websocketUrl: environment.websocketUrl });
  }

  ngOnDestroy(): void {
    clearInterval(this.keepAlive);
    this.stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
  }

  processAudioChunk(chunk: Float32Array) {    
    this.allChunks.push(chunk);
    this.chunkWorker.postMessage({ type:'send', chunkNumber: this.chunkCounter++, chunk: chunk });
  }

  async startAudio() {

    // Resume from a paused capture instead of starting a new one.
    if (this.phase() === 'paused') {
      clearInterval(this.keepAlive);
      await this.audioContext?.resume();
      this.phase.set('recording');
      return;
    }

    if (this.phase() !== 'idle') return;
    this.phase.set('recording');

    console.log("Recording started at:", new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    this.audioContext = new AudioContext();

    // Load your processor only once per context
    await this.audioContext.audioWorklet.addModule('/assets/audio-processor.js');

    // Log the sample rate to verify it's correct -- Don't delete
    //console.log('Audio context sample rate:', this.audioContext.sampleRate);

    // Create analyser node for visualizer
    const analyserNode = this.audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;    
    this.analyser.set(analyserNode);

    // Get microphone
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    
    // Create worklet node
    this.node = new AudioWorkletNode(this.audioContext, 'audio-processor');

    this.chunkWorker.postMessage({ type: 'start' });

    const metadata: RecordingMetadata = {
      sampleRate: this.audioContext.sampleRate,
      channelCount: 1,
      bitsPerSample: 32,
      mimeType: 'audio/pcm',
    };

    this.chunkWorker.postMessage({ type: 'metaData', RecordingMetadata: metadata });

    // Listen to messages
    this.node.port.onmessage = (event) => {      
      //console.log('Audio chunk:', event.data);
      
      const audioChunk: Float32Array = event.data.data;
      //this.allChunks.push(audioChunk);
      this.processAudioChunk(audioChunk);
    };

    // Connect source -> worklet
    this.source.connect(this.node);
    this.source.connect(analyserNode); // Connect to analyser for visualizer
  }

  async pauseAudio(): Promise<void> {
    if (this.phase() !== 'recording') return;
    await this.audioContext?.suspend();
    this.phase.set('paused');
    this.keepAlive = setInterval(
    () => this.chunkWorker.postMessage({ type: 'ping' }), 30000); //30 seconds
  }

  async stopAudio(): Promise<void> {

    console.log('Audio stopped. Waiting 3 seconds for workers to finish processing...');

    clearInterval(this.keepAlive);
    this.phase.set('processing');
    //this.recordingId =  { value: '6f4bb276-73b4-4572-9f05-5edb28960ae5' };

    // Stop audio immediately
    if (this.source) this.source.disconnect();
    if (this.node) this.node.disconnect();
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) this.audioContext.close();

    // Allow workers 3 seconds to process the chunks before resetting everything
    setTimeout(() => {

      // Reset
      this.audioContext = null;
      this.source = null;
      this.node = null;
      this.stream = null;
      this.analyser.set(null);

      // Terminate worker after processing
      //this.chunkWorker.postMessage({ type: 'close' });
      //this.chunkWorker.terminate();

      this.chunkCounter = 0;
      console.log('Audio stopped');

      console.log('Total chunks:', this.allChunks.length);
      this.allChunks = [];
    }, 3000);

    this.chunkWorker.postMessage({ type: 'stop' });
    console.log("Recording stopped at:", new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    if (!this.recordingId) {
      this.noteService.error.set('No active recording to fetch a note for.');
      this.phase.set('done');
      return;
    }
    try {
      await this.noteService.waitForNote(this.recordingId);
      this.soapNote.set(this.noteService.note()?.soapNote ?? null);
      this.icd10Codes.set(this.noteService.note()?.icd10Codes ?? null);
    } finally {

      this.phase.set('done');
      if (this.noteService.note() !== null) {
        this.soapNote.set(this.noteService.note()?.soapNote ?? null);
        this.icd10Codes.set(this.noteService.note()?.icd10Codes ?? null);
        console.log("Received SOAP note at:", new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        console.log('Physician not not available.');
      }

    }
  }
}
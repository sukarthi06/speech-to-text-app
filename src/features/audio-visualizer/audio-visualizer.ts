import { AfterViewInit, Component, ElementRef, input, NgZone, OnDestroy, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-audio-visualizer',
  imports: [],
  templateUrl: './audio-visualizer.html',
  styleUrl: './audio-visualizer.css',
})
export class AudioVisualizer implements AfterViewInit, OnDestroy {

  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('audioVisualizer');

  public analyser = input<AnalyserNode | null>(null);
  private animationId = signal<number | null>(null);

  constructor(private zone: NgZone) { }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      //console.log('AudioVisualizer initialized with analyser:', this.analyser());
      this.startVisualizer();
    });
  }

  ngOnDestroy(): void {
    const id = this.animationId();
    if (id) {
      cancelAnimationFrame(id);
    }
  }

  private startVisualizer() {

    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    let buffer: Uint8Array<ArrayBuffer> | null = null;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const w = canvas.width;
    const h = canvas.height;

    const draw = () => {
      const analyserNode = this.analyser();

      if (!analyserNode) {
        this.drawIdleLine(ctx, w, h);
        this.animationId.set(requestAnimationFrame(draw));
        return;
      }

      if (!buffer) {
        buffer = new Uint8Array(analyserNode.frequencyBinCount);
      }

      analyserNode.getByteTimeDomainData(buffer);

      ctx.fillStyle = '#000';
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#42a5f5';

      const sliceWidth = w / buffer.length;

      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i] / 128.0; // Normalize to [0, 2]
        const y = v * h / 2; // Scale to canvas height

        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * sliceWidth, y);

      }

      ctx.stroke();
      this.animationId.set(requestAnimationFrame(draw));

    };

    draw();
  }

  private drawIdle(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);

    const barWidth = 8;
    const gap = 4;
    const idleHeight = 20;

    let x = 0;

    while (x < w) {
      ctx.fillStyle = '#666';

      ctx.fillRect(
        x,
        h - idleHeight,
        barWidth,
        idleHeight
      );

      x += barWidth + gap;
    }
  }

  private drawIdleLine(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) {
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#42a5f5';

    const centerY = h / 2;

    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);

    ctx.stroke();
  }

}

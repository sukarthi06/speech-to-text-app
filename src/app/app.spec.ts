import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AudioRecorder } from '../features/audio-recorder/audio-recorder';

// The real AudioRecorder spins up a Web Worker in its constructor, which the
// jsdom-based unit-test environment doesn't provide. Swap it for a stub so the
// App shell can be tested in isolation.
@Component({ selector: 'app-audio-recorder', template: '' })
class AudioRecorderStub {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    })
      .overrideComponent(App, {
        remove: { imports: [AudioRecorder] },
        add: { imports: [AudioRecorderStub] },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the audio recorder', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-audio-recorder')).toBeTruthy();
  });
});

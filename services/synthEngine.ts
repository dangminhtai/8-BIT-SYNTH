import { SynthParams, WaveType } from '../types';
import { createNoiseBuffer, audioBufferToWav } from './audioUtils';

class SynthEngine {
  private audioCtx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    // Lazy initialization to handle browser autoplay policies
  }

  public init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.noiseBuffer = createNoiseBuffer(this.audioCtx);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // Logic chung để lên lịch âm thanh (dùng cho cả Realtime và Offline Rendering)
  private scheduleSound(
    ctx: BaseAudioContext,
    destination: AudioNode,
    params: SynthParams,
    noiseBuffer: AudioBuffer | null
  ) {
    const t = ctx.currentTime;
    const {
      waveType,
      startFrequency,
      endFrequency,
      duration,
      attack,
      decay,
      sustain,
      release,
      volume,
      frequencySlide
    } = params;

    // Master Gain (Volume & Envelope)
    const masterGain = ctx.createGain();
    masterGain.connect(destination);

    // Envelope Shaping (ADSR)
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(volume, t + attack);
    masterGain.gain.linearRampToValueAtTime(volume * sustain, t + attack + decay);
    masterGain.gain.exponentialRampToValueAtTime(0.01, t + duration + release); 
    // Stop completely after release
    
    let source: AudioScheduledSourceNode;

    if (waveType === WaveType.NOISE) {
      const bufferSource = ctx.createBufferSource();
      if (noiseBuffer) {
        bufferSource.buffer = noiseBuffer;
      } else {
        // Fallback if noise buffer isn't ready (shouldn't happen in real usage)
        const fallbackBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        bufferSource.buffer = fallbackBuffer;
      }
      // Noise filter to make it sound "8-bit explosion-y"
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(startFrequency, t);
      if (frequencySlide) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 50), t + duration);
      }
      
      bufferSource.connect(filter);
      filter.connect(masterGain);
      source = bufferSource;
      bufferSource.loop = true; // Loop noise for duration
    } else {
      const oscillator = ctx.createOscillator();
      oscillator.type = waveType;
      
      // Frequency Handling
      oscillator.frequency.setValueAtTime(startFrequency, t);
      if (frequencySlide) {
        // Exponential ramp sounds better for lasers/drops
        // Clamp value to avoid errors with exponentialRamp to 0 or negative
        const targetFreq = Math.max(0.1, endFrequency); 
        oscillator.frequency.exponentialRampToValueAtTime(targetFreq, t + duration);
      }

      oscillator.connect(masterGain);
      source = oscillator;
    }

    source.start(t);
    source.stop(t + duration + release + 0.1); // Add buffer time
  }

  public play(params: SynthParams) {
    this.init();
    if (!this.audioCtx || !this.analyser) return;

    // Play sound to speakers (and analyser)
    this.scheduleSound(this.audioCtx, this.analyser, params, this.noiseBuffer);
    this.analyser.connect(this.audioCtx.destination);
  }

  public async renderWav(params: SynthParams): Promise<Blob> {
    // Calculate total duration
    const totalDuration = params.attack + params.decay + params.duration + params.release + 0.1;
    
    // Create Offline Context
    // Standard Sample Rate 44.1kHz
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, sampleRate * totalDuration, sampleRate);

    // Need a noise buffer for the offline context as well
    const offlineNoiseBuffer = createNoiseBuffer(offlineCtx);

    this.scheduleSound(offlineCtx, offlineCtx.destination, params, offlineNoiseBuffer);

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWav(renderedBuffer);
  }
}

export const synthEngine = new SynthEngine();
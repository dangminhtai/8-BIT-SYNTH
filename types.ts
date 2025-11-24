export enum WaveType {
  SINE = 'sine',
  SQUARE = 'square',
  SAWTOOTH = 'sawtooth',
  TRIANGLE = 'triangle',
  NOISE = 'noise' // Custom type for noise
}

export interface SynthParams {
  waveType: WaveType;
  startFrequency: number;
  endFrequency: number; // For frequency slides (pew pew)
  duration: number; // In seconds
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  frequencySlide: boolean; // Toggle sliding
}

export interface Preset {
  id: string;
  label: string;
  params: SynthParams;
  isSystem?: boolean; // Để phân biệt preset hệ thống và custom
}

export const DEFAULT_PARAMS: SynthParams = {
  waveType: WaveType.SQUARE,
  startFrequency: 440,
  endFrequency: 440,
  duration: 0.3,
  attack: 0.01,
  decay: 0.1,
  sustain: 0.5,
  release: 0.2,
  volume: 0.5,
  frequencySlide: false,
};
'use client';

import { create } from 'zustand';

export interface toneOptions {
  frequency: number;
  pureToneOrNoisy: boolean;
  volume: number;
  waveform: string;
  noiseFormat: string;
}

export interface AudioOptions {
  pulsing: boolean;
  pulseRate: number;
  isClicking: boolean;
  tones: toneOptions[];
}

interface AudioState {
  options: AudioOptions;
  setOptions: (opts: AudioOptions) => void;
  updateSound?: () => void; // optional method reference
  setUpdateSound: (fn: () => void) => void;
}

const defaultAudioOptions: AudioOptions = {
  pulsing: false,
  pulseRate: 0,
  isClicking: false,
  tones: [
    {
      frequency: 49,
      pureToneOrNoisy: true,
      volume: 0.2,
      waveform: 'sine',
      noiseFormat: 'white',
    },
  ],
};

export const useAudioStore = create<AudioState>((set) => ({
  options: defaultAudioOptions,
  setOptions: (opts) => set({ options: opts }),
  setUpdateSound: (fn) => set({ updateSound: fn }),
}));
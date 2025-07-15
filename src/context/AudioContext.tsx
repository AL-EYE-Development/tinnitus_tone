'use client';

import { create } from 'zustand';

export interface toneOptions {
  frequency: number;
  volume: number;
  soundType: string;
  noiseband: number;
}

export interface AudioOptions {
  pulsing: boolean;
  pulseRate: number;
  isClicking: boolean;
  tones: toneOptions[];
  isDowloading: boolean;
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
      volume: 0.2,
      soundType: 'sine',
      noiseband: 0.0,
    },
  ],
  isDowloading: false
};

export const useAudioStore = create<AudioState>((set) => ({
  options: defaultAudioOptions,
  setOptions: (opts) => set({ options: opts }),
  setUpdateSound: (fn) => set({ updateSound: fn }),
}));
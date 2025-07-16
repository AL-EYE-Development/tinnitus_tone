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
  isDownloading: boolean;
}

interface AudioState {
  options: AudioOptions;
  setOptions: (opts: AudioOptions) => void;
  updateSound?: () => void; // optional method reference
  setUpdateSound: (fn: () => void) => void;
  downloadedSoundsUrl?: string;
  setDownloadedSounds: (sounds: string) => void;
  downloadStatus?: 'idle' | 'done' | 'error';
  setDownloadStatus: (status: 'idle' | 'done' | 'error') => void;
  setIsDownloadInOption: (isDownloading: boolean) => void;
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
  isDownloading: false
};

export const useAudioStore = create<AudioState>((set) => ({
  options: defaultAudioOptions,
  setOptions: (opts) => set({ options: opts }),
  setUpdateSound: (fn) => set({ updateSound: fn }),
  downloadedSounds: "",
  setDownloadedSounds: (sounds) => set({ downloadedSoundsUrl: sounds }),
  downloadStatus: 'idle',
  setDownloadStatus: (status) => set({ downloadStatus: status }),
  setIsDownloadInOption: (isDownloading: boolean) => {
    set((state) => ({
      options: {
        ...state.options,
        isDownloading: isDownloading,
      },
    }));
  }
}));
'use client';

import React, { createContext, useContext, useState } from 'react';

export interface toneOptions {
  frequency: number;
  pureToneOrNoisy: boolean;
  volume: number;
  waveform: string;
  noiseFormat: string;
}

export interface AudioOptions {
  pulsing: boolean;
  pulseRate?: number;
  isClicking: boolean;
  tones: toneOptions[];
}

interface AudioContextType {
  options: AudioOptions;
  setOptions: (opts: AudioOptions) => void;
}

const defaultOptions: AudioOptions = {
  pulsing: false,
  pulseRate: 0,
  isClicking: false,
  tones: [
    {
      frequency: 440,
      pureToneOrNoisy: true,
      volume: 0.5,
      waveform: 'sine',
      noiseFormat: 'white',
    },
  ],
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [options, setOptions] = useState<AudioOptions>(defaultOptions);

  return (
    <AudioContext.Provider value={{ options, setOptions }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudioContext must be used inside an AudioProvider');
  }
  return ctx;
};

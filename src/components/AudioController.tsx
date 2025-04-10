'use client';

import React, { useState, useRef } from 'react';
import { IconButton, Box, Paper } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';

// Audio setup

export interface AudioOptions {
  frequency: number;
  volume?: number;
  pulsing?: boolean;
  pulseRate?: number;
}

export class AudioController {
  private audioContext: AudioContext;
  private oscillator?: OscillatorNode;
  private gainNode: GainNode;
  private pulseInterval?: number;
  public isPlaying: boolean;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.isPlaying = false;
  }

  playTone(options: AudioOptions) {
    const {
      frequency,
      volume = 0.5,
      pulsing = false,
      pulseRate = 1,
    } = options;

    if (this.isPlaying) {
      this.stop();
    }

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    this.oscillator.connect(this.gainNode);
    this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    this.oscillator.start();
    this.isPlaying = true;

    if (pulsing) {
      this.pulseInterval = window.setInterval(() => {
        const now = this.audioContext.currentTime;
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(volume, now + 0.2);
      }, 1000 / pulseRate);
    }
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = undefined;
    }

    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = undefined;
    }

    this.isPlaying = false;
  }

  setVolume(volume: number) {
    if (this.isPlaying) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }
}

// 🔊 Frontend component
export default function PlayPauseComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioController | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new AudioController();
    }

    const audio = audioRef.current;

    if (!audio.isPlaying) {
      audio.playTone({
        frequency: 440, // A4 tone
        volume: 0.5,
        pulsing: true,
        pulseRate: 2,
      });
      setIsPlaying(true);
    } else {
      audio.stop();
      setIsPlaying(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        transition: 'opacity 0.3s',
        '&:hover': {
          opacity: 1,
        },
        opacity: 0.7,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <IconButton onClick={togglePlay} sx={{ p: 2 }}>
          {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
        </IconButton>
      </Paper>
    </Box>
  );
}

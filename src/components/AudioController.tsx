"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useAudioStore, AudioOptions } from "@/context/AudioContext";

export class AudioController {
  private audioContext: AudioContext;
  private oscillator?: OscillatorNode;
  private gainNode: GainNode;
  private pulseInterval?: number;
  public isPlaying: boolean = false;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  calculateValue(value: number) {
    // https://en.wikipedia.org/wiki/Piano_key_frequencies
    return Math.round(2 ** ((value - 49) / 12) * 440);
  }

  playTone(options: AudioOptions) {
    if (this.isPlaying) {
      // Already playing — just update
      this.updateTone(options);
      return;
    }

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = (options.tones[0].waveform ?? "sine") as OscillatorType;
    // "sine", "square", "sawtooth", "triangle"
    // Uncomment to test different waveforms


    const frequency = this.calculateValue(options.tones[0].frequency);
    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );

    this.oscillator.connect(this.gainNode);
    this.gainNode.gain.setValueAtTime(
      options.tones[0].volume,
      this.audioContext.currentTime
    );

    this.oscillator.start();
    this.isPlaying = true;

    if (options.pulsing) {
      this.startPulsing(options.tones[0].volume, options.pulseRate);
    }
  }

  updateTone(options: AudioOptions) {
    if (!this.oscillator) return;

    const freq = this.calculateValue(options.tones[0].frequency);
    const now = this.audioContext.currentTime;

    // Smooth frequency update
    this.oscillator.frequency.setTargetAtTime(freq, now, 0.01);

    // Smooth volume update
    this.gainNode.gain.setTargetAtTime(options.tones[0].volume, now, 0.01);
  }

  startPulsing(volume: number, rate: number) {
    this.stopPulsing();
    this.pulseInterval = window.setInterval(() => {
      const now = this.audioContext.currentTime;
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(volume, now + 0.2);
    }, 1000 / rate);
  }

  stopPulsing() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = undefined;
    }
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = undefined;
    }

    this.stopPulsing();
    this.isPlaying = false;
  }

  setVolume(volume: number) {
    const now = this.audioContext.currentTime;
    this.gainNode.gain.setTargetAtTime(volume, now, 0.01);
  }
}

// Frontend component
export default function PlayPauseComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioController | null>(null);

  // update sound when options change
  useEffect(() => {
    useAudioStore.getState().setUpdateSound(() => {
      if (audioRef.current && isPlaying) {
        audioRef.current.updateTone(useAudioStore.getState().options);
      }
    });
  }, [isPlaying]);

  const { options } = useAudioStore.getState();

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new AudioController();
    }

    const audio = audioRef.current;

    if (!audio.isPlaying) {
      audio.playTone(options);
      setIsPlaying(true);
    } else {
      audio.stop();
      setIsPlaying(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        transition: "opacity 0.3s",
        "&:hover": {
          opacity: 1,
        },
        opacity: 0.7,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <IconButton onClick={togglePlay} sx={{ p: 2 }}>
          {isPlaying ? (
            <Pause fontSize="large" />
          ) : (
            <PlayArrow fontSize="large" />
          )}
        </IconButton>
      </Paper>
    </Box>
  );
}

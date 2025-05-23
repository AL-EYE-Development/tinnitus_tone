"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useAudioStore, AudioOptions } from "@/context/AudioContext";

export class AudioController {
  private audioContext: AudioContext;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private pulseInterval?: number;
  public isPlaying = false;

  constructor(defaultOptions?: AudioOptions) {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    if (defaultOptions) {
      this.playOrUpdateTone(defaultOptions);
      this.isPlaying = true;
    }
  }

  private calculateValue(value: number) {
    return Math.round(2 ** ((value - 49) / 12) * 440); // Piano key mapping
  }

  public playOrUpdateTone(options: AudioOptions) {
    // Cleanup if needed
    if (this.isPlaying && options.tones.length !== this.oscillators.length) {
      this.cleanupOscillators();
    }

    // Create new if not already playing
    if (!this.isPlaying) {
      this.createOscillators(options);
      this.startOscillators();
      if (options.pulsing) {
        this.startPulsing(options.tones[0].volume, options.pulseRate || 1);
      }
      this.isPlaying = true;
    } else {
      // Update existing ones
      this.updateOscillators(options);
    }
  }

  private createOscillators(options: AudioOptions) {
    this.oscillators = [];
    this.gainNodes = [];

    options.tones.forEach((tone) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      const waveform = tone.soundType ?? "sine";
      if (!waveform.toLowerCase().endsWith("noise")) {
        osc.type = waveform as OscillatorType;
      }

      const freq = this.calculateValue(tone.frequency);
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

      gain.gain.setValueAtTime(tone.volume, this.audioContext.currentTime);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });
  }

  private startOscillators() {
    this.oscillators.forEach((osc) => osc.start());
  }

  private updateOscillators(options: AudioOptions) {
    const now = this.audioContext.currentTime;

    options.tones.forEach((tone, i) => {
      if (this.oscillators[i]) {
        const freq = this.calculateValue(tone.frequency);
        this.oscillators[i].frequency.setTargetAtTime(freq, now, 0.01);
        this.gainNodes[i].gain.setTargetAtTime(tone.volume, now, 0.01);
      }
    });

    this.stopPulsing(); // Reset pulsing if changed
    if (options.pulsing) {
      this.startPulsing(options.tones[0].volume, options.pulseRate || 1);
    }
  }

  private cleanupOscillators() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.gainNodes.forEach((gain) => gain.disconnect());

    this.oscillators = [];
    this.gainNodes = [];
    this.stopPulsing();
    this.isPlaying = false;
  }

  public stop() {
    this.cleanupOscillators();
  }

  private startPulsing(volume: number, rate: number) {
    this.stopPulsing();
    this.pulseInterval = window.setInterval(() => {
      const now = this.audioContext.currentTime;
      this.gainNodes.forEach((gain) => {
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.2);
      });
    }, 1000 / rate);
  }

  private stopPulsing() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = undefined;
    }
  }
}

// Frontend component
export default function PlayPauseComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioController | null>(null);

  const { options } = useAudioStore.getState();

  useEffect(() => {
    // Bind update function externally
    useAudioStore.getState().setUpdateSound(() => {
      if (audioRef.current && isPlaying) {
        audioRef.current.playOrUpdateTone(useAudioStore.getState().options);
      }
    });
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new AudioController();
    }

    const audio = audioRef.current;

    if (!audio.isPlaying) {
      audio.playOrUpdateTone(options);
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

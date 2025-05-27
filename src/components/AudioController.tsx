"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useAudioStore, AudioOptions } from "@/context/AudioContext";

type SoundPart = {
  oscillator: OscillatorNode;
  noiseSource: AudioBufferSourceNode | null;
  filter: BiquadFilterNode;
  gain: GainNode;
  currentType: "tone" | "noise";
  enabled?: boolean;
};

export class AudioController {
  private audioContext: AudioContext;
  private parts: SoundPart[] = [];
  private pulseInterval?: number;
  public isPlaying = false;
  private noiseBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    this.noiseBuffers = new Map([
      ["white", this.createNoiseBufferSource("white")],
      ["pink", this.createNoiseBufferSource("pink")],
      ["brown", this.createNoiseBufferSource("brown")]
    ]);

    for (let i = 0; i < 3; i++) {
      const gain = this.audioContext.createGain();
      gain.gain.value = 0;
      gain.connect(this.audioContext.destination);

      const oscillator = this.audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      oscillator.start();

      const filter = this.audioContext.createBiquadFilter();
      filter.type = "bandpass"; // default, may change later

      const part: SoundPart = {
        oscillator,
        noiseSource: null,
        filter,
        gain,
        currentType: "tone",
      };

      oscillator.connect(gain); // initially tone is connected
      this.parts.push(part);
    }
  }

  private calculateValue(value: number): number {
    return Math.round(2 ** ((value - 49) / 12) * 440);
  }

  public playOrUpdateTone(options: AudioOptions) {
    const now = this.audioContext.currentTime;

    options.tones.forEach((tone, i) => {
      const part = this.parts[i];
      const freq = this.calculateValue(tone.frequency);
      const volume = tone.volume;
      const soundType = tone.soundType?.toLowerCase() ?? "sine";

      part.gain.gain.setValueAtTime(volume, now);

      const isNoise = soundType.endsWith("noise");

      // Disconnect existing connections
      part.oscillator.disconnect();
      if (part.noiseSource) {
        try {
          part.noiseSource.stop();
        } catch {}
        part.noiseSource.disconnect();
        part.noiseSource = null;
      }
      part.filter.disconnect();

      if (isNoise) {
        const noiseKind = soundType.replace(" noise", "") as
          | "white"
          | "pink"
          | "brown";
        const noiseBuffer = this.createNoiseBufferSource(noiseKind);
        const source = this.audioContext.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        source.connect(part.filter);
        part.filter.connect(part.gain);
        source.start();

        const q = this.calculateFilterQ(freq, tone.noiseband ?? 6);
        part.filter.type = "bandpass";
        part.filter.frequency.setValueAtTime(freq, now);
        part.filter.Q.setValueAtTime(q, now);

        part.noiseSource = source;
        part.currentType = "noise";
      } else {
        part.oscillator.type = soundType as OscillatorType;
        part.oscillator.frequency.setTargetAtTime(freq, now, 0.01);
        part.oscillator.connect(part.gain);
        part.currentType = "tone";
      }
    });

    // Mute any unused parts
    for (let i = options.tones.length; i < this.parts.length; i++) {
      const part = this.parts[i];

      // Disconnect and mute
      part.oscillator.disconnect();
      if (part.noiseSource) {
        try {
          part.noiseSource.stop();
        } catch {}
        part.noiseSource.disconnect();
        part.noiseSource = null;
      }
      part.filter.disconnect();
      part.gain.gain.setValueAtTime(0, now);
    }

    this.stopPulsing();
    if (options.pulsing) {
      this.startPulsing(options.tones[0].volume, options.pulseRate || 1);
    }

    this.isPlaying = true;
  }

  private createNoiseBufferSource(
    type: "white" | "pink" | "brown"
  ): AudioBuffer {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0,
      b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "white") {
        output[i] = white;
      } else if (type === "brown") {
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else if (type === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    }

    return noiseBuffer;
  }

  private calculateFilterQ(centerFreq: number, fraction: number): number {
    return (
      centerFreq /
      (centerFreq *
        (Math.pow(2, 1 / (2 * fraction)) - Math.pow(2, -1 / (2 * fraction))))
    );
  }

  private startPulsing(volume: number, rate: number) {
    this.pulseInterval = window.setInterval(() => {
      const now = this.audioContext.currentTime;
      this.parts.forEach((part) => {
        part.gain.gain.setValueAtTime(0, now);
        part.gain.gain.linearRampToValueAtTime(volume, now + 0.2);
      });
    }, 1000 / rate);
  }

  private stopPulsing() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = undefined;
    }
  }

  public stop() {
    this.parts.forEach((part) => {
      part.oscillator.disconnect();
      if (part.noiseSource) {
        try {
          part.noiseSource.stop();
        } catch {}
        part.noiseSource.disconnect();
      }
      part.filter.disconnect();
      part.gain.disconnect();
    });

    this.stopPulsing();
    this.isPlaying = false;
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

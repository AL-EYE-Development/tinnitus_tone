"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconButton, Box, Paper } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import { useAudioStore, AudioOptions } from "@/context/AudioContext";

export class AudioController {
  private audioContext: AudioContext;
  private sources: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private gainNodes: GainNode[] = [];
  private pulseInterval?: number;
  public isPlaying = false;

  constructor(defaultOptions?: AudioOptions) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (defaultOptions) {
      this.playOrUpdateTone(defaultOptions);
      this.isPlaying = true;
    }
  }

  private calculateValue(value: number) {
    return Math.round(2 ** ((value - 49) / 12) * 440);
  }

  public playOrUpdateTone(options: AudioOptions) {
    if (this.isPlaying && options.tones.length !== this.sources.length) {
      this.cleanupSources();
    }

    console.log(options.noiseband)

    if (!this.isPlaying) {
      this.createSources(options);
      this.startSources();
      if (options.pulsing) {
        this.startPulsing(options.tones[0].volume, options.pulseRate || 1);
      }
      this.isPlaying = true;
    } else {
      this.updateSources(options);
    }
  }

  private createSources(options: AudioOptions) {
    this.sources = [];
    this.gainNodes = [];

    options.tones.forEach((tone) => {
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(tone.volume, this.audioContext.currentTime);

      const waveform = tone.soundType?.toLowerCase() ?? "sine";
      const freq = this.calculateValue(tone.frequency);

      let source: OscillatorNode | AudioBufferSourceNode;

      if (waveform.endsWith("noise")) {
        source = this.createNoiseBufferSource(freq);
      } else {
        const osc = this.audioContext.createOscillator();
        osc.type = waveform as OscillatorType;
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        source = osc;
      }

      source.connect(gain);
      gain.connect(this.audioContext.destination);

      this.sources.push(source);
      this.gainNodes.push(gain);
    });
  }

  private createNoiseBufferSource(centerFreq: number): AudioBufferSourceNode {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = noiseBuffer;
    bufferSource.loop = true;

    // Apply bandpass filter centered at frequency ±½ octave
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = centerFreq;
    filter.Q.value = centerFreq / (centerFreq * (Math.pow(2, 0.5) - Math.pow(2, -0.5))); // approx. 0.707 bandwidth

    bufferSource.connect(filter);
    filter.connect(this.audioContext.destination); // we later reconnect to gain instead

    // Re-route through gain manually
    const manualGain = this.audioContext.createGain();
    filter.disconnect();
    filter.connect(manualGain);

    // Save ref for gain reuse
    this.gainNodes.push(manualGain);
    manualGain.connect(this.audioContext.destination);

    return bufferSource;
  }

  private startSources() {
    this.sources.forEach((src) => {
      if ("start" in src) src.start();
    });
  }

  private updateSources(options: AudioOptions) {
    const now = this.audioContext.currentTime;

    options.tones.forEach((tone, i) => {
      const waveform = tone.soundType?.toLowerCase() ?? "sine";
      const freq = this.calculateValue(tone.frequency);
      const gain = this.gainNodes[i];

      if (!waveform.endsWith("noise")) {
        const osc = this.sources[i] as OscillatorNode;
        osc.frequency.setTargetAtTime(freq, now, 0.01);
        osc.type = waveform as OscillatorType;
      } 

      gain.gain.setTargetAtTime(tone.volume, now, 0.01);
    });

    this.stopPulsing();
    if (options.pulsing) {
      this.startPulsing(options.tones[0].volume, options.pulseRate || 1);
    }
  }

  private cleanupSources() {
    this.sources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.gainNodes.forEach((gain) => gain.disconnect());

    this.sources = [];
    this.gainNodes = [];
    this.stopPulsing();
    this.isPlaying = false;
  }

  public stop() {
    this.cleanupSources();
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

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
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

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

    // console.log(options.tones[0].noiseband)

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
      const bandwidth = tone.noiseband ?? 6; // default to 1/6 octave

      let source: AudioNode;

      if (waveform.endsWith("noise")) {
        const noiseType = waveform.replace(" noise", "") as
          | "white"
          | "pink"
          | "brown";
        source = this.createNoiseBufferSource(
          noiseType,
          freq,
          bandwidth
        );
        source.connect(gain);
      } else {
        const osc = this.audioContext.createOscillator();
        osc.type = waveform as OscillatorType;
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        source = osc;
        source.connect(gain);
      }

      gain.connect(this.audioContext.destination);

      this.sources.push(source);
      this.gainNodes.push(gain);
    });
  }

  private createNoiseBufferSource(
    type: "white" | "pink" | "brown",
    centerFreq: number,
    fraction: number = 6
  ): AudioNode {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
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

    const source = this.audioContext.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Bandpass filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = centerFreq;

    const q =
      centerFreq /
      (centerFreq *
        (Math.pow(2, 1 / (2 * fraction)) - Math.pow(2, -1 / (2 * fraction))));
    filter.Q.value = q;

    source.connect(filter);
    filter.connect(this.audioContext.destination);

    return filter; // Return the last node to connect gain to
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

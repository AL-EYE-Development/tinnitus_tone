"use client";

import React, { useState, useRef, useEffect, use } from "react";
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
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private mediaStreamDestination?: MediaStreamAudioDestinationNode;
  private mainGain?: GainNode;
  private audioUrl: string | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Create main gain node for routing audio
    this.mainGain = this.audioContext.createGain();
    this.mainGain.connect(this.audioContext.destination);

    // Create media stream destination for recording
    this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
    
    this.noiseBuffers = new Map([
      ["white", this.createNoiseBufferSource("white")],
      ["pink", this.createNoiseBufferSource("pink")],
      ["brown", this.createNoiseBufferSource("brown")],
    ]);

    for (let i = 0; i < 3; i++) {
      const gain = this.audioContext.createGain();
      gain.gain.value = 0;
      gain.connect(this.mainGain);

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

  public async playOrUpdateTone(options: AudioOptions): Promise<string | void> {
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
        const noiseBuffer = this.noiseBuffers.get(noiseKind);
        if (!noiseBuffer) return;

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

    // Handle downloading
    if (options.isDownloading) {
      console.log("enter downloadaudio");
      await this.downloadAudio();
      return this.getAudioUrl();
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
    
    // Stop recording if active
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    this.isPlaying = false;
  }

  private setupRecording() {
    if (!this.mediaStreamDestination) return;

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream);
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
  }

  public startRecording() {
    if (!this.mainGain || !this.mediaStreamDestination) return;

    this.setupRecording();
    this.mainGain.connect(this.mediaStreamDestination);
    this.mediaRecorder?.start();
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob());
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      
      // Disconnect from recording destination
      if (this.mainGain && this.mediaStreamDestination) {
        try {
          this.mainGain.disconnect(this.mediaStreamDestination);
        } catch (e) {
          // Connection might already be disconnected
        }
      }
    });
  }

  public async downloadAudio(duration: number = 5000): Promise<string | void> {
    // if (!this.isPlaying) return;

    console.log("Starting recording/download...");
    this.startRecording();

    // Record for specified duration
    await new Promise(resolve => setTimeout(resolve, duration));

    const audioBlob = await this.stopRecording();

    // Create and return download URL
    // this.audioUrl = URL.createObjectURL(audioBlob);
    this.audioUrl = URL.createObjectURL(audioBlob);
    console.log("Download URL created:", this.audioUrl);
    return this.audioUrl;
  }

  public getAudioUrl(): string {
    return this.audioUrl ? this.audioUrl : "";
  }
}

// Frontend component
export default function PlayPauseComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioController | null>(null);

  const { options } = useAudioStore.getState();

  useEffect(() => {
    // update sound when options change
    useAudioStore.getState().setUpdateSound(async () => {
      // console.log(audioRef.current);
      if (audioRef.current) {
        if (options.isDownloading) {
          togglePlay();
        }

        // console.log("online");
        const res = await audioRef.current.playOrUpdateTone(useAudioStore.getState().options);
        if (res) {
          console.log("-----");
          useAudioStore.getState().setDownloadStatus('done');
          useAudioStore.getState().setDownloadedSounds(audioRef.current.getAudioUrl());
        }
      }
    });
  }, [isPlaying]);

  // OscillatorNode and AudioBufferSourceNode are not reusable once stopped, recreate for simplicity
  const togglePlay = () => {
    if (!isPlaying) {
      // Create a fresh instance
      const audio = new AudioController();
      audioRef.current = audio;
      audio.playOrUpdateTone(options);
      setIsPlaying(true);
    } else {
      // Stop and dispose current audio controller
      if (audioRef.current) {
        audioRef.current.stop();
        // audioRef.current = null;
      }
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

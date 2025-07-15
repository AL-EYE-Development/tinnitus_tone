# Audio Download Usage Guide

The AudioController has been enhanced with elegant download functionality that allows you to record and download the generated audio tones.

## Key Features

1. **Seamless Recording**: Audio is recorded through a separate MediaStreamDestination without affecting playback
2. **Automatic Download**: Generated audio files are automatically downloaded as WebM format
3. **Custom Duration**: You can specify how long to record (default: 10 seconds)
4. **Clean Architecture**: The recording infrastructure is separate from playback, maintaining code elegance

## Usage

### Basic Download (triggered by isDowloading flag)
```typescript
// In your component or wherever you update audio options
const options: AudioOptions = {
  pulsing: false,
  pulseRate: 1,
  isClicking: false,
  isDowloading: true, // This will trigger download
  tones: [
    {
      frequency: 49,
      volume: 0.2,
      soundType: 'sine',
      noiseband: 0.0,
    },
  ],
};

// When playOrUpdateTone is called with isDowloading: true,
// it will automatically start recording and download after 10 seconds
audioController.playOrUpdateTone(options);
```

### Custom Duration Download
```typescript
// Download with custom duration (e.g., 30 seconds)
await audioController.downloadAudioWithDuration(30000);
```

### Manual Recording Control
```typescript
// Start recording manually
audioController.startRecording();

// Stop recording and get the blob
const audioBlob = await audioController.stopRecording();

// Check if currently recording
const isRecording = audioController.isRecording();
```

## Implementation Details

The download functionality works by:

1. **Dual Audio Routing**: Audio is routed through a main gain node that can connect to both:
   - `audioContext.destination` (for playback)
   - `MediaStreamDestination` (for recording)

2. **MediaRecorder Integration**: Uses the Web Audio API's MediaRecorder to capture the audio stream

3. **Automatic File Generation**: Creates timestamped WebM files that are automatically downloaded

## File Format

- **Format**: WebM (widely supported, good compression)
- **Naming**: `tinnitus_tone_YYYY-MM-DDTHH-MM-SS.webm`
- **Quality**: Matches the original audio quality from the Web Audio API

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Requires user gesture for download to work properly

## Integration with Existing Code

The download functionality integrates seamlessly with your existing audio system:
- No changes needed to existing tone generation
- Uses the same `AudioOptions` interface
- Maintains all existing functionality (pulsing, multiple tones, noise, etc.)

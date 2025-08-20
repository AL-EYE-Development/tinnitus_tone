# Tinnitus Tone Generator

An interactive web survey application where you can generating and customizing tinnitus-matching tones, developed by Yang Xu at DTU hearing section.

This web application can be accessd at [al-eye-development.github.io/tinnitus_tone](https://al-eye-development.github.io/tinnitus_tone/)

## 🚀 Getting Started

### Installation

Please install Node.js (>18.18.0) and npm for local environment.

```bash
git clone <repository-url>
cd tinnitus_tone
npm install
```

### Running the Application

Locally you can start the application using

```bash
npm run build
npm run dev
```

The website automatically builds and deploys itself on github pages every time there is a new commit. You can essentially make changes to [survey json file](https://github.com/AL-EYE-Development/tinnitus_tone/blob/main/src/components/json.js) using the user-friendly [tool from SurveyJS](https://surveyjs.io/create-free-survey).


### Data collection formats






## 🎵 Features

- Customizable tone generation
- Multiple waveform types (sine, square, sawtooth)
- Noise generation (white, pink, brown)
- Frequency and volume control
- Pulsing/beating effects
- Up to 3 sounds combination
- Audio download capability


## 🏗️ Project Structure and Tech stack

```
src/
├── components/
│   ├── AudioController.tsx    # Audio generation and control logic
│   ├── Survey.tsx            # SurveyJS implementation
|   └── SliderController.tsx   # A customized component for our sliders in generating tones
|   └── json.js                # The configuration file for surveyJS
├── context/
│   └── AudioContext.tsx      # Zustand state management
└── types/
    └── index.ts             # TypeScript type definitions
```

File `json.js` defines the overall survey structure. File `Survey.tsx` takes care the main survey operations. File `AudioController.tsx` handles the web audio context and shares audio configurations with `Survey.tsx` through `AudioContext.tsx`, based on the package zustand. 


## 📦 Survey Component


How to embed a new suvery-xact form in data collection?

Enter the survey -> Data collection -> Respondents -> Distribution -> Self-creation by hyperlink -> copy the link to json.js file


## 🌐 Github Page Deployment

The github page deployment of a nextjs project is based on the following configurations.

https://github.com/AL-EYE-Development/tinnitus_tone/blob/main/.github/workflows/deploy.yml

https://github.com/nextjs/deploy-github-pages





<!-- todo: 
remove uislider
remove comments, add proper comments -->.
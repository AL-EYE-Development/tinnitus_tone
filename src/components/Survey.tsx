"use client";

import { useCallback } from "react";
import "survey-core/survey-core.css";
import * as SurveyCore from "survey-core";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "./SliderController";
import "./FreqSliderController";
import React from "react";
import { useAudioStore, AudioOptions } from "@/context/AudioContext";
import { useEffect } from "react";

// const SURVEY_ID = 1;
import { surveyJson } from "./json.js";

export default function SurveyComponent() {
  // setting up the survey model
  const survey = new Model(surveyJson);

  const alertResults = useCallback((sender: Model) => {
    const results = JSON.stringify(sender.data);
    // alert(results);
  }, []);

  survey.onValueChanged.add((sender, options) => {
    const data = sender.data;
    // console.log(typeof data.tonepanel[0]);
    // console.log(data.tonepanel[0].loudness);

    const newOptions: AudioOptions = {
      pulsing: data.consistency === "Pulsing",
      pulseRate: Number(data.beat) || 1,
      isClicking: data.click === false,
      tones: Array.isArray(data.tonepanel)
        ? data.tonepanel.map((tone: any) => ({
            frequency:
              Number(tone?.pitchCoarse ?? 49) + Number(tone?.pitchFine ?? 0),
            volume: Number(tone?.volume ?? 20) / 100,
            soundType: tone?.waveform ?? "sine",
            noiseband: transformNoiseBand(tone?.noiseband ?? 0.0),
          }))
        : [],
      isDownloading: false
    };

    // console.log(data.tonepanel[0].waveform);
    
    useAudioStore.getState().setOptions(newOptions);
    const updateSound = useAudioStore.getState().updateSound;
    if (updateSound) {
      updateSound();
    }
  });

  // get current surveyjs page 
  survey.onCurrentPageChanged.add((sender, options) => {
    // third page start initialize sound download
    if (sender.currentPageNo == 2) {
      useAudioStore.getState().setIsDownloadInOption(true);
      const updateSound = useAudioStore.getState().updateSound;
      if (updateSound) {
        console.log("start downloading in survey context");
        updateSound();
      }
    }

    if (sender.currentPageNo <= 1) {
      useAudioStore.getState().setIsDownloadInOption(false);
    }
  });

  useEffect(() => {
    // Expose download function globally
    (window as any).downloadSound = () => {
      // click url
      const audioUrl = useAudioStore.getState().downloadedSoundsUrl;
      console.log("Downloading sound from URL:", audioUrl);
      if (audioUrl) {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'tinnitus-tone.webm'; // Set filename
        document.body.appendChild(link);
        link.click(); // Trigger download
        document.body.removeChild(link); // Clean up
      }
    };
  }, []);

  survey.onComplete.add(alertResults);

  return <Survey model={survey} />;
}

function transformNoiseBand(value: number): number {
  if (value <= 6) {
    return 7 - value;
  } else {
    return 1 / (value - 6);
  }
}
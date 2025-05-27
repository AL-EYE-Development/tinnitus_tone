"use client";

import { useCallback } from "react";
import "survey-core/survey-core.css";
import * as SurveyCore from "survey-core";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "./SliderController";
import "./FreqSliderController";
import React from "react";
import { useRef } from "react";
import { useAudioStore, AudioOptions } from "@/context/AudioContext";

import noUiSlider from "nouislider";
import { nouislider } from "surveyjs-widgets";
import "nouislider/distribute/nouislider.css";
nouislider(SurveyCore);

// const SURVEY_ID = 1;
import { surveyJson } from "./json.js";

export default function SurveyComponent() {
  // setting up the survey model
  const survey = new Model(surveyJson);

  const alertResults = useCallback((sender: Model) => {
    const results = JSON.stringify(sender.data);
    alert(results);
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
            noiseband: tone?.noiseband ?? 0.0,
          }))
        : [],
    };

    // console.log(data.tonepanel[0].waveform);
    
    useAudioStore.getState().setOptions(newOptions);
    const updateSound = useAudioStore.getState().updateSound;
    if (updateSound) {
      updateSound();
    }
  });

  survey.onComplete.add(alertResults);

  return <Survey model={survey} />;
}

// function saveSurveyResults(url: string, json: object) {
//   fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     body: JSON.stringify(json)
//   })
//   .then(response => {
//     if (response.ok) {
//       // Handle success
//     } else {
//       // Handle error
//     }
//   })
//   .catch(error => {
//     // Handle error
//   });
// }

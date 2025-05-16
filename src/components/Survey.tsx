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
import { useAudioStore, AudioOptions } from '@/context/AudioContext';

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
    // console.log(typeof data.consistency);
    // console.log(data.tonepanel[0].loudness);

    const newOptions: AudioOptions = {
      // pulsing: !!data.pulsing,
      // pulseRate: data.pulseRate ? Number(data.pulseRate) : 1,
      // isClicking: !!data.isClicking,
      pulsing: data.consistency === "Pulsing",
      pulseRate: data.beat,
      isClicking: data.click == false,
      tones: [
        {
          frequency: Number(data.frequency) || 440,
          pureToneOrNoisy: !!data.pureToneOrNoisy,
          volume: Number(data.volume) || 0.5,
          waveform: data.waveform || "sine",
          noiseFormat: data.noiseFormat || "white",
        },
      ],
    };

    useAudioStore.getState().setOptions(newOptions); // ✅ Works perfectly
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

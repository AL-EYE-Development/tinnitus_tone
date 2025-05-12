"use client";

import { useCallback } from "react";
import "survey-core/survey-core.css";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "./SliderController";
import "./FreqSliderController";
import React from "react";
import { useAudioContext, AudioOptions } from "@/context/AudioContext";

// const SURVEY_ID = 1;
import { surveyJson } from "./json.js";

export default function SurveyComponent() {
  // setting up the survey model
  const survey = new Model(surveyJson);

  const alertResults = useCallback((sender: Model) => {
    const results = JSON.stringify(sender.data);
    alert(results);
  }, []);

  const { setOptions } = useAudioContext();
  survey.onValueChanged.add((sender, options) => {
    const data = sender.data;
    console.log("Value changed: ", options.name, " = ", options.value);

    const newOptions: AudioOptions = {
      pulsing: !!data.pulsing,
      pulseRate: data.pulseRate ? Number(data.pulseRate) : 1,
      isClicking: !!data.isClicking,
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

    setOptions(newOptions);
  });

  // add in section bool to play audio only

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

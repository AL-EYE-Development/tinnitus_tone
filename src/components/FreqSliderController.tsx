// components/SurveyQuestionMuiSlider.tsx
"use client";

import * as React from "react";
import { Slider, Typography, Box } from "@mui/material";
import {
  ReactQuestionFactory,
  SurveyQuestionElementBase,
} from "survey-react-ui";

import { ElementFactory, Question, Serializer } from "survey-core";
import { styled } from "@mui/material/styles";

const CUSTOM_TYPE = "fq-slider";
// const marks = [
//   {
//     value: 2,
//     label: "Slow",
//   },
//   {
//     value: 8,
//     label: "Fast",
//   },
// ];

export class freqSliderModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }

  get min() {
    return this.getPropertyValue("min");
  }
  set min(val) {
    this.setPropertyValue("min", val);
  }

  get max() {
    return this.getPropertyValue("max");
  }
  set max(val) {
    this.setPropertyValue("max", val);
  }

  get pipsValue(): string {
    return this.getPropertyValue("pipsValue") ?? "";
  }
  set pipsValue(val: string) {
    this.setPropertyValue("pipsValue", val);
  }
  get pipsText(): string {
    return this.getPropertyValue("pipsText") ?? "";
  }
  set pipsText(val: string) {
    this.setPropertyValue("pipsText", val);
  }
}

// Add question type metadata for further serialization into JSON
Serializer.addClass(
  CUSTOM_TYPE,
  [
    {
      name: "min:number",
      default: "1",
    },
    {
      name: "max:number",
      default: "10",
    },
    {
      name: "pipsValue",
      type: "string",
      visibleIndex: 1,
      category: "general",
    },
    {
      name: "pipsText",
      type: "string",
      category: "general",
      visibleIndex: 1,
    },
  ],
  function () {
    return new freqSliderModel("");
  },
  "question"
);

ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
  return new freqSliderModel(name);
});

// A class that renders questions of the new type in the UI
export class CustomfreqSlider extends SurveyQuestionElementBase {
  constructor(props: any) {
    super(props);
    this.state = { value: this.question.value };
  }
  get question() {
    return this.questionBase;
  }
  get value() {
    return this.question.value;
  }

  get min() {
    return this.question.min;
  }

  get max() {
    return this.question.max;
  }

  get pipsValue(): string {
    return this.question.getPropertyValue("pipsValue") ?? "";
  }

  get pipsText(): string {
    return this.question.getPropertyValue("pipsText") ?? "";
  }

  // Support the read-only and design modes
  get style() {
    return this.question.getPropertyValue("readOnly") ||
      this.question.isDesignMode
      ? { pointerEvents: "none" }
      : undefined;
  }

  handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    this.question.value = newValue;
  };

  calculateValue(value: number) {
    return Math.round(2 ** ((value - 49) / 12) * 440);
  }

  valueLabelFormat(value: number) {

    const note = getNoteFromFrequency(value);

    return `${value} - ${note}`;
  }

  renderColor() {
    const values = this.pipsValue.split(",").map((s) => Number(s.trim()));
    const labels = this.pipsText.split(",").map((s) => s.trim());

    // Combine into marks array
    const marks = values.map((val, index) => ({
      value: val,
      label: labels[index] ?? `${val}`,
    }));

    return (
      <Box
        sx={{
          width: "95%",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          paddingLeft: "20px",
        }}
      >
        {/* <Typography id="non-linear-slider" gutterBottom>
          Storage: {valueLabelFormat(calculateValue(value))}
        </Typography> */}
        <PrettoSlider
          value={this.question.value ?? 49}
          marks={marks}
          min={this.question.min}
          max={this.question.max}
          step={0.2}
          scale={this.calculateValue}
          getAriaValueText={this.valueLabelFormat}
          valueLabelFormat={this.valueLabelFormat}
          onChange={this.handleChange}
          valueLabelDisplay="auto"
          aria-labelledby="non-linear-slider"
        />
      </Box>
    );
  }

  renderElement() {
    return <div>{this.renderColor()}</div>;
  }
}

// Register `SurveyQuestionColorPicker` as a class that renders `color-picker` questions
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
  return React.createElement(CustomfreqSlider, props);
});

// style the slider
const PrettoSlider = styled(Slider)({
  color: "#52af77",
  // height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&::before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    // lineHeight: 1.2,
    fontSize: 16,
    // background: "unset",
    // padding: 0,
    // width: 32,
    // height: 32,
    // borderRadius: "50% 50% 50% 0",
    // backgroundColor: "#52af77",
    // transformOrigin: "bottom left",
    // transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    // "&::before": { display: "none" },
    // "&.MuiSlider-valueLabelOpen": {
    //   transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    // },
    // "& > *": {
    //   transform: "rotate(45deg)",
    // },
  },
});

function getNoteFromFrequency(frequency: number): string {
    if (frequency < 16.352) return "~C0"; 
    if (frequency < 17.324) return "C0";
    if (frequency < 18.354) return "C#0";
    if (frequency < 19.445) return "D0";
    if (frequency < 20.602) return "D#0";
    if (frequency < 21.827) return "E0";
    if (frequency < 23.125) return "F0";
    if (frequency < 24.500) return "F#0";
    if (frequency < 25.957) return "G0";
    if (frequency < 27.500) return "G#0";
    if (frequency < 29.135) return "A0";
    if (frequency < 30.868) return "A#0";
    if (frequency < 32.703) return "B0";
    if (frequency < 34.648) return "C1";
    if (frequency < 36.708) return "C#1";
    if (frequency < 38.891) return "D1";
    if (frequency < 41.203) return "D#1";
    if (frequency < 43.654) return "E1";
    if (frequency < 46.249) return "F1";
    if (frequency < 48.999) return "F#1";
    if (frequency < 51.913) return "G1";
    if (frequency < 55.000) return "G#1";
    if (frequency < 58.270) return "A1";
    if (frequency < 61.735) return "A#1";
    if (frequency < 65.406) return "B1";
    if (frequency < 69.296) return "C2";
    if (frequency < 73.416) return "C#2";
    if (frequency < 77.782) return "D2";
    if (frequency < 82.407) return "D#2";
    if (frequency < 87.307) return "E2";
    if (frequency < 92.499) return "F2";
    if (frequency < 97.999) return "F#2";
    if (frequency < 103.826) return "G2";
    if (frequency < 110.000) return "G#2";
    if (frequency < 116.541) return "A2";
    if (frequency < 123.471) return "A#2";
    if (frequency < 130.813) return "B2";
    if (frequency < 138.591) return "C3";
    if (frequency < 146.832) return "C#3";
    if (frequency < 155.564) return "D3";
    if (frequency < 164.814) return "D#3";
    if (frequency < 174.614) return "E3";
    if (frequency < 184.997) return "F3";
    if (frequency < 195.998) return "F#3";
    if (frequency < 207.652) return "G3";
    if (frequency < 220.000) return "G#3";
    if (frequency < 233.082) return "A3";
    if (frequency < 246.942) return "A#3";
    if (frequency < 261.626) return "B3";
    if (frequency < 277.183) return "C4";
    if (frequency < 293.665) return "C#4";
    if (frequency < 311.127) return "D4";
    if (frequency < 329.628) return "D#4";
    if (frequency < 349.228) return "E4";
    if (frequency < 369.994) return "F4";
    if (frequency < 391.995) return "F#4";
    if (frequency < 415.305) return "G4";
    if (frequency < 440.000) return "G#4";
    if (frequency < 466.164) return "A4";
    if (frequency < 493.883) return "A#4";
    if (frequency < 523.251) return "B4";
    if (frequency < 554.365) return "C5";
    if (frequency < 587.330) return "C#5";
    if (frequency < 622.254) return "D5";
    if (frequency < 659.255) return "D#5";
    if (frequency < 698.457) return "E5";
    if (frequency < 739.989) return "F5";
    if (frequency < 783.991) return "F#5";
    if (frequency < 830.609) return "G5";
    if (frequency < 880.000) return "G#5";
    if (frequency < 932.328) return "A5";
    if (frequency < 987.767) return "A#5";
    if (frequency < 1046.502) return "B5";
    if (frequency < 1108.731) return "C6";
    if (frequency < 1174.659) return "C#6";
    if (frequency < 1244.508) return "D6";
    if (frequency < 1318.510) return "D#6";
    if (frequency < 1396.913) return "E6";
    if (frequency < 1479.978) return "F6";
    if (frequency < 1567.982) return "F#6";
    if (frequency < 1661.219) return "G6";
    if (frequency < 1760.000) return "G#6";
    if (frequency < 1864.655) return "A6";
    if (frequency < 1975.533) return "A#6";
    if (frequency < 2093.005) return "B6";
    if (frequency < 2217.461) return "C7";
    if (frequency < 2349.318) return "C#7";
    if (frequency < 2489.016) return "D7";
    if (frequency < 2637.021) return "D#7";
    if (frequency < 2793.826) return "E7";
    if (frequency < 2959.956) return "F7";
    if (frequency < 3135.964) return "F#7";
    if (frequency < 3322.438) return "G7";
    if (frequency < 3520.000) return "G#7";
    if (frequency < 3729.310) return "A7";
    if (frequency < 3951.066) return "A#7";
    if (frequency < 4186.009) return "B7";
    if (frequency < 4434.922) return "C8";
    if (frequency < 4698.637) return "C#8";
    if (frequency < 4978.032) return "D8";
    if (frequency < 5274.042) return "D#8";
    if (frequency < 5587.652) return "E8";
    if (frequency < 5919.912) return "F8";
    if (frequency < 6271.928) return "F#8";
    if (frequency < 6644.876) return "G8";
    if (frequency < 7040.000) return "G#8";
    if (frequency < 7458.620) return "A8";
    if (frequency < 7902.133) return "A#8";
    if (frequency < 8372.019) return "B8";

    return "B8"; // Out of range case
}
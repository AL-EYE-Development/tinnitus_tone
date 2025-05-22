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

const CUSTOM_TYPE = "slider";
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

export class SliderModel extends Question {
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
    return new SliderModel("");
  },
  "question"
);

ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
  return new SliderModel(name);
});

// A class that renders questions of the new type in the UI
export class CustomSlider extends SurveyQuestionElementBase {
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

  handleChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    this.question.value = newValue;
  };

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
          value={this.question.value ?? this.question.min}
          marks={marks}
          min={this.question.min}
          max={this.question.max}
          // step={1}
          // scale={calculateValue}
          // getAriaValueText={valueLabelFormat}
          // valueLabelFormat={valueLabelFormat}
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
  return React.createElement(CustomSlider, props);
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
  // "& .MuiSlider-valueLabel": {
  //   lineHeight: 1.2,
  //   fontSize: 12,
  //   background: "unset",
  //   padding: 0,
  //   width: 32,
  //   height: 32,
  //   borderRadius: "50% 50% 50% 0",
  //   backgroundColor: "#52af77",
  //   transformOrigin: "bottom left",
  //   transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
  //   "&::before": { display: "none" },
  //   "&.MuiSlider-valueLabelOpen": {
  //     transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
  //   },
  //   "& > *": {
  //     transform: "rotate(45deg)",
  //   },
  // },
});

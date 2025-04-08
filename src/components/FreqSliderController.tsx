// components/SurveyQuestionMuiSlider.tsx
"use client";

import * as React from "react";
import { Slider, Typography, Box } from "@mui/material";
import { ReactQuestionFactory, SurveyQuestionElementBase } from "survey-react-ui";

import { ElementFactory, Question, Serializer } from "survey-core";

const CUSTOM_TYPE = "fq-slider";
const marks = [
  {
    value: 50,
    label: 'Low/Deep',
  },
  {
    value: 13000,
    label: 'HighPitch/Sharp',
  },
];


export class FreqSliderModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }

  get value() {
    return this.getPropertyValue("value");
  }
  set value(val) {
    this.setPropertyValue("value", val);
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
}

// Add question type metadata for further serialization into JSON
Serializer.addClass(
  CUSTOM_TYPE,
  [
    {
      name: "colorPickerType",
      default: "Slider",
      choices: ["Slider", "Sketch", "Compact"],
    },
    {
      name: "value:number",
      default: "5"
    },
    // {
    //   name: "disableAlpha:boolean",
    //   dependsOn: "colorPickerType",
    //   visibleIf: function (obj) {
    //     return obj.colorPickerType === "Sketch";
    //   },
    // },
  ],
  function () {
    return new FreqSliderModel("");
  },
  "question"
);

ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
  return new FreqSliderModel(name);
});



// A class that renders questions of the new type in the UI
export class CustomFreqSlider extends SurveyQuestionElementBase {
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


  // Support the read-only and design modes
  get style() {
    return this.question.getPropertyValue("readOnly") ||
      this.question.isDesignMode
      ? { pointerEvents: "none" }
      : undefined;
  }

  handleChange = (event: Event, newValue: number) => {
    this.question.value = newValue;
  };

  renderColor() {
    return (
      <Box sx={{ 
        width: "95%",
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        paddingLeft: '20px',
      }}>
        {/* <Typography id="non-linear-slider" gutterBottom>
          Storage: {valueLabelFormat(calculateValue(value))}
        </Typography> */}
        <Slider
          value={this.question.value}
          marks={marks}
          min={20}
          max={14000}
          step={10}
          // scale={calculateValue}
          // getAriaValueText={valueLabelFormat}
          // valueLabelFormat={valueLabelFormat}
          onChange={this.handleChange}
          valueLabelDisplay="auto"
          aria-labelledby="non-linear-slider"
        />
      </Box>
    )
  }

  renderElement() {
    return (
      <div>
        {this.renderColor()}
      </div>
    );
  }
}

// Register `SurveyQuestionColorPicker` as a class that renders `color-picker` questions
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
  return React.createElement(CustomFreqSlider, props);
});

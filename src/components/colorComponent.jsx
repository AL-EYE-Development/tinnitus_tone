import React from "react";
import { ElementFactory, Question, Serializer } from "survey-core";
import { SliderPicker, SketchPicker, CompactPicker } from "react-color";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";

const CUSTOM_TYPE = "color-picker";

export class QuestionColorPickerModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }

  get colorPickerType() {
    return this.getPropertyValue("colorPickerType");
  }
  set colorPickerType(val) {
    this.setPropertyValue("colorPickerType", val);
  }

  get disableAlpha() {
    return this.getPropertyValue("disableAlpha");
  }
  set disableAlpha(val) {
    this.setPropertyValue("disableAlpha", val);
  }
}

// Add question type metadata for further serialization into JSON
Serializer.addClass(
  CUSTOM_TYPE,
  [{
    name: "colorPickerType",
    default: "Slider",
    choices: ["Slider", "Sketch", "Compact"]
  }, {
    name: "disableAlpha:boolean",
    dependsOn: "colorPickerType",
    visibleIf: function (obj) {
      return obj.colorPickerType === "Sketch";
    }
  }],
  function () {
    return new QuestionColorPickerModel("");
  },
  "question"
);

ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
  return new QuestionColorPickerModel(name);
});

// A class that renders questions of the new type in the UI
export class SurveyQuestionColorPicker extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    this.state = { value: this.question.value };
  }
  get question() {
    return this.questionBase;
  }
  get value() {
    return this.question.value;
  }
  get disableAlpha() {
    return this.question.disableAlpha;
  }
  get type() {
    return this.question.colorPickerType;
  }
  handleColorChange = (data) => {
    this.question.value = data.hex;
  };
  // Support the read-only and design modes
  get style() {
    return this.question.getPropertyValue("readOnly") ||
      this.question.isDesignMode ? { pointerEvents: "none" } : undefined;
  }

  renderColor(type) {
    switch (type) {
      case "Slider": {
        return (<SliderPicker color={this.value} onChange={this.handleColorChange} />);
      }
      case "Sketch": {
        return (<SketchPicker color={this.value} disableAlpha={this.disableAlpha} onChange={this.handleColorChange} />);
      }
      case "Compact": {
        return (<CompactPicker color={this.value} onChange={this.handleColorChange} />);
      }
      default:
        return <div>Unknown type</div>;
    }
  }

  renderElement() {
    return <div style={this.style}>{this.renderColor(this.type)}</div>;
  }
}

// Register `SurveyQuestionColorPicker` as a class that renders `color-picker` questions 
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
  return React.createElement(SurveyQuestionColorPicker, props);
});
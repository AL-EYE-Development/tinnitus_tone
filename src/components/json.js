import { Visibility } from "@mui/icons-material";
import { type } from "os";
import { title } from "process";
import { isReadable } from "stream";

export const surveyJson = {
  title: "Tinnitus Matching Questionnaire",
  description:
    "Proceed through the questionnaire by filling in blanks and pressing the next button, \nyour sample tinnitus sound will be available for download at the end.",
  logo: "https://designguide.dtu.dk/-/media/subsites/designguide/design-basics/logo/dtu_logo_roed.jpg",
  questionErrorLocation: "bottom",
  logoFit: "cover",
  logoPosition: "right",
  logoHeight: "128px",
  pages: [
    {
      name: "Acknowledgement",
      title: "Section I - Acknowledgement",
      elements: [
        {
          type: "expression",
          name: "We can put the acknowledgement text here",
        },
      ],
    },
    {
      name: "info",
      title: "Section II - Main Questionnaire",
      elements: [
        {
          // Questionnaire - they have to fill out everything before generating and downloading their own tinnitus sound as e.g. mp3
          type: "panel",
          name: "full-name",
          title: "Full name",
          elements: [
            {
              type: "text",
              name: "first-name",
              title: "First name / SubjectId",
              isRequired: true,
              maxLength: 25,
            },
            {
              type: "text",
              name: "last-name",
              startWithNewLine: false,
              title: "Last name",
              // isRequired: true,
              maxLength: 25,
            },
            {
              type: "boolean",
              name: "done_before",
              title: "Have you done this test before?",
              isRequired: true,
              swapOrder: true,
            },
          ],
        },
        {
          // Questionnaire - they have to fill out everything before generating and downloading their own tinnitus sound as e.g. mp3
          type: "panel",
          name: "tinnitus_symptoms",
          title: "Tinnitus Symptoms",
          elements: [
            {
              type: "text",
              name: "how-often",
              title: "how often do you experience tinnitus?"
            },
          ],
        },
      ],
    },
    {
      type: "panel",
      name: "tinnitus-sound",
      title: "Section III - Sound Matching",
      elements: [
        {
          // Left ear, right ear, or both ears? Or is it inside the head? If both ears, is it the same in both ears or different?
          type: "radiogroup",
          name: "which-ear",
          // isRequired: true,
          title: "Where do you hear the sound?",
          description:
            "💡 If you can distinguish different sounds in both of your ears, please kindly go through this questionnaire twice.",
          isRequired: true,
          choices: ["Left ear", "Right ear", "Both ears", "Inside head"],
        },
        {
          // Is it constant, pulsing, or random? If pulsing - Slider A for pulse rate/speed
          type: "radiogroup",
          name: "consistency",
          title: "How does the sound's tempo feel like?",
          choices: ["Consistent", "Pulsing", "Random"],
          isRequired: true,
        },
        {
          // slider for pulsing rate/speed - 0-10Hz, 0-20Hz, 0-30Hz, 0-40Hz, 0-50Hz, 0-60Hz, 0-70Hz, 0-80Hz, 0-90Hz, 0-100Hz
          type: "slider",
          name: "beat",
          min: 1,
          max: 10,
          pipsValue: "1, 5, 10",
          pipsText: "Slow, Medium, Fast",
          title: "If pulsing how fast do you hear the sound?",
          // visible: false,
          // visibleIf: "{consistency} == Pulsing",
        },
        {
          type: "expression",
          title:
            "You can now use the button in the corner of the page to pause/play",
        },
        {
          // Is it a click, one tone or more? If more, specify how many (2, 3, more)
          type: "boolean",
          name: "click",
          labelFalse: "Click",
          labelTrue: "Tones",
          title: "Is it a click or tones you hear?",
          // visible: false,
          // visibleIf: "{pulse-rate} != null",
        },
        {
          name: "tonepanel",
          type: "paneldynamic",
          panelCount: 1,
          displayMode: "tab",
          minPanelCount: 1,
          maxPanelCount: 3,
          title: "Describe your tones - Modify/Add/Remove",
          description:
            "You can now use the button in the corner of the page to pause/play.",
          templateTabTitle: "Tone {panelIndex}",
          tabAlign: "left",
          // visible: false,
          // visibleIf: "{pulse-rate} != null",
          templateElements: [
            // {
            //   // Specify pitch/frequency(s) - slider(s) one rough, one fine. Top - full range of human hearing, below - fine tune pitch? Sliders B and C
            //   type: "nouislider",
            //   name: "pitchCoarse",
            //   title: "Coarsely change your tinnitus tone: ",
            //   tooltips: true,
            //   pipsMode: "positions",
            //   rangeMin: 20,
            //   rangeMax: 40000,
            //   pipsValues: [0, 20, 50, 75, 100],
            //   pipsText: [0, 2222, 4000, 10000, 20000],
            //   pipsDensity: 4,
            // },
            {
              type: "fq-slider",
              name: "pitchCoarse",
              title: "Coarsely change your tinnitus tone: ",
              min: 4,
              max: 110,
              pipsValue: "13, 25, 37, 49, 61, 73, 85, 97",
              pipsText: "A1, A2, A3, A4, A5, A6, A7, A8",
            },
            {
              // Specify pitch/frequency(s) - slider(s) one rough, one fine. Top - full range of human hearing, below - fine tune pitch? Sliders B and C
              type: "slider",
              name: "pitchFine",
              title: "Finely change your tinnitus tone?",
              min: -2,
              max: 2,
              step: 0.25,
              default: 0,
              pipsValue: "-2, -1, 0, 1, 2",
              pipsText: "-2, -1, 0, 1, 2",
            },
            {
              type: "radiogroup",
              name: "waveform",
              title: "What kind of sound do you hear?",
              visible: true,
              defaultValue: "sine",
              choices: [
                "sine",
                "square",
                "sawtooth",
                "triangle",
                "White noise",
                "Pink noise",
              ],
            },
            {
              name: "noiseband",
              type: "slider",
              title:
                "Change the shape of the noise you hear (turn up volume below if you can't hear it when narrowing):",
              default: 1,
              min: 1,
              max: 10,
              step: 1,
              pipsText: "Narrow, 🎵, Wide",
              pipsValue: "1, 6, 10",
            },
            {
              type: "slider",
              name: "volume",
              title: "How loud is the sound?",
              min: 0,
              max: 100,
              default: 20,
              pipsValue: "0, 20, 40, 60, 80, 100",
              pipsText: "0, 20, 40, 60, 80, 100",
            },
          ],
          // maybe add one more how close do you think the sound is to your tinnitus?
        },
        {
          type: "expression",
          title:
            "Please keep the audio playing in the next page to ensure downloading works well.",
        },
      ],
      // Two step confirmation - finished, download mp3
    },
    {
      name: "submit",
      title: "Section IV - Submision & Download",
      elements: [
        {
          // Questionnaire - they have to fill out everything before generating and downloading their own tinnitus sound as e.g. mp3
          type: "panel",
          name: "submit-form",
          title: "Submit your form here",
          elements: [
            {
              type: "html",
              html: '<iframe width="95%" height="588vh" src="https://www.survey-xact.dk/LinkCollector?key=DANGL8V3JN16"></iframe></iframe>',
            },
          ],
        },
      ],
    },
    {
      name: "Download and play your sound",
      title: "Section V - Download and play your sound",
      elements: [
        {
          type: "html",
          html: `<p>Click the button below to download your sound as an mp3 file. After downloading, you can play it on your device.</p>
                 <button class="btn btn-primary" onclick="downloadSound()">Download Sound</button>`,
        },
      ],
    },
  ],
  completeText: "Submit",
  // showPreviewBeforeComplete: true,
  // previewMode: "answeredQuestions",
  widthMode: "static",
  width: "1000px",
};

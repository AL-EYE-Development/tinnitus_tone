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
      name: "info",
      title: "Section I - Information",
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
              title: "First name",
              isRequired: true,
              maxLength: 25,
            },
            {
              type: "text",
              name: "last-name",
              startWithNewLine: false,
              title: "Last name",
              isRequired: true,
              maxLength: 25,
            }
          ],
        },
      ],
    },
    {
      type: "panel",
      name: "tinnitus-sound",
      title: "Section II - Sound Matching",
      elements: [
        {
          // Left ear, right ear, or both ears? Or is it inside the head? If both ears, is it the same in both ears or different?
          type: "radiogroup",
          name: "which-ear",
          isRequired: true,
          title: "Where do you hear the sound?",
          description:
            "💡 If you can distinguish different sounds in both of your ears, please kindly go through this questionnaire twice.",
          choices: [
            " Left ear",
            " Right ear",
            " Both ears Same sound",
            " Inside head",
          ],
        },
        {
          // Is it constant, pulsing, or random? If pulsing - Slider A for pulse rate/speed
          type: "radiogroup",
          // visible: false,
          // visibleIf: "{which-ear} != null",
          name: "sound-consistency",
          title: "How does the sound's tempo feel like?",
          choices: ["Consistent", "Pulsing", "Random"],
        },
        {
          // slider for pulsing rate/speed - 0-10Hz, 0-20Hz, 0-30Hz, 0-40Hz, 0-50Hz, 0-60Hz, 0-70Hz, 0-80Hz, 0-90Hz, 0-100Hz
          type: "slider",
          name: "pulse-rate",
          title: "If pulsing how fast do you hear the sound?",
          // visible: false,
          // visibleIf: "{sound-consistency} == pulsing",
        },
        {
          // Is it a click, one tone or more? If more, specify how many (2, 3, more)
          type: "boolean",
          name: "if-click",
          title: "Is it a click you hear?"
          // visible: false,
          // visibleIf: "{pulse-rate} != null",
        },
        {
          type: "radiogroup",
          name: "number-of-tones",
          title: "How many tones do you hear?",
          // visible: false,
          // visibleIf: "{if-click} == false",
          choices: [
            "One tone",
            "Two tones",
            "Three tones"
          ],
        },
        {
          // Specify pitch/frequency(s) - slider(s) one rough, one fine. Top - full range of human hearing, below - fine tune pitch? Sliders B and C
          type: "fq-slider",
          name: "pitch",
          title: "How does the sound's tone like?"
        },
        {
          // Is it pure tone or noise? Slider D (fraction) and E (waveform) pure sinus tone, through….white noise?
          type: "boolean",
          name: "pure-or-noise",
          title: "Is it a pure tone (Yes) or more noisy (No)?"
        },
        {
          type: "slider",
          name: "fraction",
          title: "How brand of this noise is do you hear?"
        }, 
        {
          type: "slider",
          name: "loudness",
        },
        {
          type: "comment",
          name: "comment",
          title: "What else would you like to comment on your tinnitus?",
          maxLength: 300,
          // visible: false,
          // "visibleIf": "{which-ear} != null",
        }
      ],
      // Two step confirmation - finished, download mp3
    },
    {
      name: "submit",
      title: "Section III - Submision & Download",
      elements: [
        {
          // Questionnaire - they have to fill out everything before generating and downloading their own tinnitus sound as e.g. mp3
          type: "panel",
          name: "submit-form",
          title: "Submit your form here",
          elements: [
            {
              type: "html",
              "html": "<iframe width=\"640px\" height=\"20000vh\"\n                src=\"https://forms.office.com/Pages/ResponsePage.aspx?id=I_FR8s7JjkSSdzS7KFkR2QlLtcyM--1KpijKKDu9H1xUMjFYMkNKRzBRVTBBQzlVWEtFUE4xNTZKNC4u&r0220ae0aef3c4e19a6d60821a4518951=placeholder&embed=true\"\n                frameborder=\"0\" marginwidth=\"0\" marginheight=\"0\" style=\"border: none; max-width:100%; max-height:50vh\"\n                allowfullscreen webkitallowfullscreen mozallowfullscreen msallowfullscreen></iframe>"

            }
          ],
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

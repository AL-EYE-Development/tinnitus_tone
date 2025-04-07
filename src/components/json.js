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
    // {
    //   name: "info",
    //   title: "Section I - Information",
    //   elements: [
    //     {
    //       // Questionnaire - they have to fill out everything before generating and downloading their own tinnitus sound as e.g. mp3
    //       type: "panel",
    //       name: "full-name",
    //       title: "Full name",
    //       elements: [
    //         {
    //           type: "text",
    //           name: "first-name",
    //           title: "First name",
    //           isRequired: true,
    //           maxLength: 25,
    //         },
    //         {
    //           type: "text",
    //           name: "last-name",
    //           startWithNewLine: false,
    //           title: "Last name",
    //           isRequired: true,
    //           maxLength: 25,
    //         }
    //       ],
    //     },
    //   ],
    // },
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
          description: "💡 If you can distinguish different sounds in both of your ears, please kindly go through this questionnaire twice.",
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
          "visible": false,
          "visibleIf": "{which-ear} != null",
          name: "sound-consistency",
          title: "How does the sound's tempo feel like?",
          choices: [
            "Consistent",
            "Pulsing",
            "Random"
          ],
        },
        {
          // slider for pulsing rate/speed - 0-10Hz, 0-20Hz, 0-30Hz, 0-40Hz, 0-50Hz, 0-60Hz, 0-70Hz, 0-80Hz, 0-90Hz, 0-100Hz
          type: "radiogroup",
          name: "pulse-rate",
          title: "If How fast is the sound?",
          "visible": false,
          "visibleIf": "{sound-consistency} == pulsing",
        },
        // {
        //   // Is it a click, one tone or more? If more, specify how many (2, 3, more)

        // },
        // {
        //   // Specify pitch/frequency(s) - slider(s) one rough, one fine. Top - full range of human hearing, below - fine tune pitch? Sliders B and C
          
        // },
        // {
        //   // Is it pure tone or noise? Slider D (fraction) and E (waveform) pure sinus tone, through….white noise?

        // },
        // {
        //   // Loudness Slider F
        // }
        {
          "type": "comment",
          "name": "comment",
          "title": "What else would you like to comment on your tinnitus?",
          "maxLength": 300,
          "visible": false,
          // "visibleIf": "{which-ear} != null",
        },
        {
          // html
          type: "color-picker",
          name: "html",
          title: "frffff"
        }
        // {
        //   // html
        //   type: "html",
        //   name: "html",
        //   title: "Thank you for your answers!",
        //   html: "<button>"
        // }
      ]
        // Two step confirmation - finished, download mp3
    },
  ],
  completeText: "Submit",
  // showPreviewBeforeComplete: true,
  // previewMode: "answeredQuestions",
  widthMode: "static",
  width: "1000px",
};

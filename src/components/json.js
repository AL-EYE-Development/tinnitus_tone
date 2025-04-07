export const surveyJson = {
  title: "Tinnitus Matching Questionnaire",
  description:
    "Proceed through the questionnaire by filling in blanks and pressing the next button, \nyour sample tinnitus sound will be available for download at the end.",
  logo: "https://designguide.dtu.dk/-/media/subsites/designguide/design-basics/logo/dtu_logo_roed.jpg",
  questionErrorLocation: "bottom",
  logoFit: "cover",
  logoPosition: "right",
  "logoHeight": "150px",
  pages: [
    // {
    //   name: "info",
    //   title: "Section I - Information",
    //   elements: [
    //     {
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
      elements: [
        {
          "type": "imagepicker",
          "name": "faces-pain-scale",
          "title": "Faces pain scale",
          "titleLocation": "top",
          "description": "Choose the face that best describes how you are feeling:",
          "choices": [
           {
            "value": "Item 1",
            "text": "No hurt",
            "imageLink": "https://api.surveyjs.io/private/Surveys/files?name=952dd683-462a-4903-a33b-d35492c36a43"
           },
           {
            "value": "Item 2",
            "text": "Hurts little bit",
            "imageLink": "https://api.surveyjs.io/private/Surveys/files?name=f95c1e74-8404-4d95-bf18-66ea0bd437fc"
           },
           {
            "value": "Item 3",
            "text": "Hurts little more",
            "imageLink": "https://api.surveyjs.io/private/Surveys/files?name=053e9a2f-9f43-42e1-8f40-214372a63efd"
           },
           {
            "value": "Item 4",
            "text": "Hurts even more",
            "imageLink": "https://api.surveyjs.io/private/Surveys/files?name=afa9a3a8-d07e-4c7d-b24b-785387ec6bab"
           },
           {
            "value": "Item 5",
            "text": "Hurts whole lot",
            "imageLink": "https://api.surveyjs.io/private/Surveys/files?name=2fee0fae-1af2-47cd-88fd-b99f6cd99946"
           },
           {
            "value": "Item 6",
            "text": "Hurts worst",
            "imageLink": "https://api.surveyjs.io/private/Surveys/files?name=df1906f8-d7c5-4507-96e2-b43e9c05270f"
           }
          ],
          "imageFit": "cover",
          "minImageWidth": 120,
          "minImageHeight": 100,
          "maxImageWidth": 240,
          "maxImageHeight": 200,
          "showLabel": true
        },
      ],
    }
  ],
  completeText: "Submit",
  // showPreviewBeforeComplete: true,
  // previewMode: "answeredQuestions",
  widthMode: "static",
  width: "1000px",
};

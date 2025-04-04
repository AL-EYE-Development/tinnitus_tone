export const surveyJson = {
  title: " Screening Form",
  description:
    "All fields with an asterisk (*) are required fields and must be filled out in order to process the information in strict confidentiality.",
  logo: "https://designguide.dtu.dk/-/media/subsites/designguide/design-basics/logo/dtu_logo_roed.jpg",
  questionErrorLocation: "bottom",
  logoFit: "cover",
  logoPosition: "right",
  pages: [
    {
      name: "patient-info",
      title: "Patient Information",
      elements: [
        {
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
            },
            // {
            //   type: "html",
            //   name: "question5",
            //   html: '<input type="range" style="width: 30vw;" id="fraction" class="slider" value="6" min="1" max="10" step="1" oninput="updateFraction()">\n    <br>',
            // },
          ],
        },
      ],
    },
  ],
  completeText: "Submit",
  showPreviewBeforeComplete: true,
  previewMode: "answeredQuestions",
  widthMode: "static",
  width: "1000px",
};

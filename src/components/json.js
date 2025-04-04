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
          ],
        },
        {
          type: "panel",
          name: "personal-info",
          elements: [
            {
              type: "text",
              name: "ssn",
              title: "Social Security number",
              isRequired: true,
              maxLength: 9,
              validators: [
                {
                  type: "regex",
                  text: "Your SSN must be a 9-digit number.",
                  regex: "^\\d{9}$",
                },
              ],
            },
            {
              type: "text",
              name: "birthdate",
              startWithNewLine: false,
              title: "Date of Birth",
              isRequired: true,
              inputType: "date",
            },
          ],
        },
      ],
    },
    {
      name: "symptoms",
      title: "Current Symptoms",
      elements: [
        {
          type: "checkbox",
          name: "symptoms",
          title:
            "Have you experienced any of the following symptoms of COVID-19 within the last 48 hours?",
          isRequired: true,
          choices: [
            "Fever or chills",
            "New and persistent cough",
            "Shortness of breath or difficulty breathing",
            "Fatigue",
            "Muscle or body aches",
            "New loss of taste or smell",
            "Sore throat",
          ],
          showNoneItem: true,
          noneText: "No symptoms",
        },
      ],
    },
    {
      name: "contacts",
      title: "Contacts",
      elements: [
        {
          type: "boolean",
          name: "contacted-person-with-symptoms",
          title:
            "Have you been in contact with anyone in the last 14 days who is experiencing these symptoms?",
        },
        {
          type: "radiogroup",
          name: "contacted-covid-positive",
          title:
            "Have you been in contact with anyone who has since tested positive for COVID-19?",
          choices: ["Yes", "No", "Not sure"],
        },
      ],
    },
    {
      name: "travels",
      title: "Travels",
      elements: [
        {
          type: "boolean",
          name: "travelled",
          title: "Have you travelled abroad in the last 14 days?",
        },
        {
          type: "text",
          name: "travel-destination",
          visibleIf: "{travelled} = true",
          title: "Where did you go?",
        },
      ],
    },
    {
      name: "tests",
      title: "Tests",
      elements: [
        {
          type: "boolean",
          name: "tested-covid-positive",
          title: "Have you tested positive for COVID-19 in the past 10 days?",
        },
        {
          type: "boolean",
          name: "awaiting-covid-test",
          title: "Are you currently awaiting results from a COVID-19 test?",
        },
        {
          type: "paneldynamic",
          name: "emergency-contacts",
          title: "Emergency Contacts",
          description:
            "If possible, it's best to specify at least TWO emergency contacts.",
          panelsState: "firstExpanded",
          confirmDelete: true,
          addPanelText: "Add a new contact person",
          visibleIf:
            "(({tested-covid-positive} = true or {contacted-covid-positive} = 'Yes') or ({symptoms} notempty and {symptoms} notcontains 'none'))",
          isRequired: true,
          templateElements: [
            {
              type: "text",
              name: "emergency-first-name",
              title: "First name",
            },
            {
              type: "text",
              name: "emergency-last-name",
              startWithNewLine: false,
              title: "Last name",
            },
            {
              type: "text",
              name: "emergency-relationship",
              title: "Relationship",
            },
            {
              type: "text",
              name: "emergency-phone",
              startWithNewLine: false,
              title: "Phone number",
              inputType: "tel",
            },
          ],
        },
      ],
    },
    {
      name: "finalization",
      title: "Miscellaneous",
      elements: [
        {
          type: "comment",
          name: "additional-info",
          title: "Additional information",
        },
        {
          type: "text",
          name: "date",
          title: "Date",
          inputType: "date",
        },
        {
          type: "signaturepad",
          name: "signature",
          startWithNewLine: false,
          title: "Signature",
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

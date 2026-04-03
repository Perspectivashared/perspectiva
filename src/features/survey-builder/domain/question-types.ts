import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";
import type { QuestionType } from "@/features/surveys/domain/types";

export interface ExtendedQuestionTypeOption {
  value: string;
  label: string;
  description: string;
  category: string;
  comingSoon?: boolean;
}

export const EXTENDED_QUESTION_CATEGORIES: Array<{
  category: string;
  types: ExtendedQuestionTypeOption[];
}> = [
  {
    category: "Categorical Choice",
    types: [
      { value: "short-text", label: "Short Answer", description: "Single line text response", category: "Categorical Choice" },
      { value: "long-text", label: "Paragraph", description: "Multi-line text response", category: "Categorical Choice" },
      { value: "multiple-choice", label: "Multiple Choice", description: "Select one option from a list", category: "Categorical Choice" },
      { value: "checkboxes", label: "Checkboxes", description: "Select multiple options", category: "Categorical Choice" },
      { value: "dropdown", label: "Dropdown", description: "Select from a collapsed list", category: "Categorical Choice" },
      { value: "yes-no", label: "Yes / No", description: "Binary choice question", category: "Categorical Choice", comingSoon: true },
      { value: "image-choice", label: "Image Choice", description: "Choose between image options", category: "Categorical Choice", comingSoon: true },
      { value: "card-sort", label: "Card Sort", description: "Drag cards into categories", category: "Categorical Choice", comingSoon: true },
      { value: "max-diff", label: "MaxDiff", description: "Best-worst scaling pairs", category: "Categorical Choice", comingSoon: true },
    ],
  },
  {
    category: "Rating Scales",
    types: [
      { value: "linear-scale", label: "Linear Scale", description: "Numeric rating scale", category: "Rating Scales" },
      { value: "star-rating", label: "Star Rating", description: "1–5 star rating", category: "Rating Scales", comingSoon: true },
      { value: "nps", label: "NPS", description: "Net Promoter Score (0–10)", category: "Rating Scales", comingSoon: true },
      { value: "emoji-scale", label: "Emoji Scale", description: "Expressive emoji ratings", category: "Rating Scales", comingSoon: true },
      { value: "slider", label: "Slider", description: "Continuous value slider", category: "Rating Scales", comingSoon: true },
      { value: "visual-analog", label: "Visual Analog Scale", description: "0–100 continuous scale", category: "Rating Scales", comingSoon: true },
    ],
  },
  {
    category: "Matrix",
    types: [
      { value: "matrix-radio", label: "Matrix (Single Select)", description: "One answer per row", category: "Matrix", comingSoon: true },
      { value: "matrix-checkbox", label: "Matrix (Multi Select)", description: "Multiple answers per row", category: "Matrix", comingSoon: true },
      { value: "matrix-rating", label: "Matrix (Rating)", description: "Rate each row on a scale", category: "Matrix", comingSoon: true },
      { value: "matrix-dropdown", label: "Matrix (Dropdown)", description: "Dropdown selection per row", category: "Matrix", comingSoon: true },
      { value: "semantic-diff", label: "Semantic Differential", description: "Bipolar adjective pairs", category: "Matrix", comingSoon: true },
    ],
  },
  {
    category: "Text Input",
    types: [
      { value: "email", label: "Email", description: "Validated email address field", category: "Text Input", comingSoon: true },
      { value: "url", label: "URL", description: "Validated web address field", category: "Text Input", comingSoon: true },
      { value: "rich-text", label: "Rich Text", description: "Formatted text editor", category: "Text Input", comingSoon: true },
      { value: "autocomplete", label: "Autocomplete", description: "Type-ahead suggestions", category: "Text Input", comingSoon: true },
    ],
  },
  {
    category: "Ranking",
    types: [
      { value: "rank-drag", label: "Drag & Drop Ranking", description: "Drag items into order", category: "Ranking", comingSoon: true },
      { value: "rank-priority", label: "Priority Ranking", description: "Assign rank numbers to items", category: "Ranking", comingSoon: true },
      { value: "paired-comparison", label: "Paired Comparison", description: "A vs B head-to-head choices", category: "Ranking", comingSoon: true },
    ],
  },
  {
    category: "Numeric",
    types: [
      { value: "number", label: "Number", description: "Numeric input with min/max", category: "Numeric", comingSoon: true },
      { value: "currency", label: "Currency", description: "Monetary value input", category: "Numeric", comingSoon: true },
      { value: "percentage", label: "Percentage", description: "0–100% input", category: "Numeric", comingSoon: true },
      { value: "range-dual", label: "Range (Min–Max)", description: "Select a min and max value", category: "Numeric", comingSoon: true },
    ],
  },
  {
    category: "Date & Time",
    types: [
      { value: "date", label: "Date", description: "Date picker", category: "Date & Time", comingSoon: true },
      { value: "time", label: "Time", description: "Time picker", category: "Date & Time", comingSoon: true },
      { value: "datetime", label: "Date & Time", description: "Combined date and time picker", category: "Date & Time", comingSoon: true },
      { value: "date-range", label: "Date Range", description: "Start and end date selection", category: "Date & Time", comingSoon: true },
      { value: "duration", label: "Duration", description: "Time duration input", category: "Date & Time", comingSoon: true },
    ],
  },
  {
    category: "Contact",
    types: [
      { value: "contact-name", label: "Name", description: "First and last name fields", category: "Contact", comingSoon: true },
      { value: "contact-email", label: "Contact Email", description: "Email address with opt-in", category: "Contact", comingSoon: true },
      { value: "contact-phone", label: "Phone Number", description: "Phone with country code", category: "Contact", comingSoon: true },
      { value: "contact-address", label: "Address", description: "Full postal address fields", category: "Contact", comingSoon: true },
      { value: "contact-org", label: "Organization", description: "Company, role, and department", category: "Contact", comingSoon: true },
    ],
  },
  {
    category: "Visual & Spatial",
    types: [
      { value: "image-annotate", label: "Image Annotation", description: "Mark and label points on an image", category: "Visual & Spatial", comingSoon: true },
      { value: "heatmap-click", label: "Heatmap Click", description: "Click to indicate areas on an image", category: "Visual & Spatial", comingSoon: true },
      { value: "area-select", label: "Area Select", description: "Draw regions on an image", category: "Visual & Spatial", comingSoon: true },
      { value: "map-pin", label: "Map Pin", description: "Drop a pin on an interactive map", category: "Visual & Spatial", comingSoon: true },
      { value: "canvas-draw", label: "Canvas Drawing", description: "Freehand drawing input", category: "Visual & Spatial", comingSoon: true },
    ],
  },
  {
    category: "Media Capture",
    types: [
      { value: "photo-upload", label: "Photo Upload", description: "Upload an image file", category: "Media Capture", comingSoon: true },
      { value: "audio-record", label: "Audio Recording", description: "Record a voice response", category: "Media Capture", comingSoon: true },
      { value: "video-record", label: "Video Recording", description: "Record a video response", category: "Media Capture", comingSoon: true },
      { value: "file-upload", label: "File Upload", description: "Upload any document or file", category: "Media Capture", comingSoon: true },
      { value: "webcam-photo", label: "Webcam Snapshot", description: "Capture a photo from webcam", category: "Media Capture", comingSoon: true },
      { value: "screen-capture", label: "Screen Capture", description: "Capture a screenshot", category: "Media Capture", comingSoon: true },
    ],
  },
  {
    category: "Sensor & Behavioral",
    types: [
      { value: "mouse-track", label: "Mouse Tracking", description: "Track mouse movement patterns", category: "Sensor & Behavioral", comingSoon: true },
      { value: "scroll-track", label: "Scroll Tracking", description: "Track scroll depth and behavior", category: "Sensor & Behavioral", comingSoon: true },
      { value: "eye-track", label: "Eye Tracking", description: "Browser-based gaze tracking", category: "Sensor & Behavioral", comingSoon: true },
      { value: "keyboard-dyn", label: "Keystroke Dynamics", description: "Typing rhythm and interval timing", category: "Sensor & Behavioral", comingSoon: true },
    ],
  },
  {
    category: "Experimental Research",
    types: [
      { value: "reaction-time", label: "Reaction Time", description: "Measure response latency to stimuli", category: "Experimental Research", comingSoon: true },
      { value: "memory-recall", label: "Memory Recall", description: "Show items then test recall", category: "Experimental Research", comingSoon: true },
      { value: "stroop-task", label: "Stroop Task", description: "Color-word interference task", category: "Experimental Research", comingSoon: true },
      { value: "attention-check", label: "Attention Check", description: "Validate respondent attention", category: "Experimental Research", comingSoon: true },
      { value: "ab-stimulus", label: "A/B Stimulus", description: "Present and compare two variants", category: "Experimental Research", comingSoon: true },
    ],
  },
  {
    category: "Operational",
    types: [
      { value: "page-break", label: "Page Break", description: "Split survey into separate pages", category: "Operational", comingSoon: true },
      { value: "section-header", label: "Section Header", description: "Visual divider with a title", category: "Operational", comingSoon: true },
      { value: "instruction", label: "Instructions", description: "Rich text information block", category: "Operational", comingSoon: true },
      { value: "consent-block", label: "Consent Block", description: "GDPR consent checkbox", category: "Operational", comingSoon: true },
    ],
  },
];


export const SURVEY_BUILDER_QUESTION_TYPE_OPTIONS = [
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "linear-scale", label: "Rating" },
] as const satisfies ReadonlyArray<{
  value: SurveyBuilderQuestionType;
  label: string;
}>;

const surveyBuilderQuestionTypes = new Set<string>(
  SURVEY_BUILDER_QUESTION_TYPE_OPTIONS.map((option) => option.value),
);

export const isSurveyBuilderQuestionType = (
  value: string,
): value is SurveyBuilderQuestionType => surveyBuilderQuestionTypes.has(value);

const surveyToBuilderQuestionTypeMap: Record<
  QuestionType,
  SurveyBuilderQuestionType
> = {
  shortText: "short-text",
  longText: "long-text",
  singleChoice: "multiple-choice",
  multipleChoice: "checkboxes",
  dropdown: "dropdown",
  rating: "linear-scale",
  number: "short-text",
  date: "short-text",
  yesNo: "multiple-choice",
};

const builderToSurveyQuestionTypeMap: Record<
  SurveyBuilderQuestionType,
  QuestionType
> = {
  "short-text": "shortText",
  "long-text": "longText",
  "multiple-choice": "singleChoice",
  checkboxes: "multipleChoice",
  dropdown: "dropdown",
  "linear-scale": "rating",
};

export const mapSurveyQuestionTypeToBuilderType = (
  questionType: QuestionType,
): SurveyBuilderQuestionType => surveyToBuilderQuestionTypeMap[questionType];

export const mapBuilderQuestionTypeToSurveyType = (
  questionType: SurveyBuilderQuestionType,
): QuestionType => builderToSurveyQuestionTypeMap[questionType];

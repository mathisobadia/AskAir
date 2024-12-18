export const MAX_NUMBER_OF_FILES = 20;
export const allowedDocumentFileContentTypes = [
  "application/pdf",
  "application/octet-stream",
  //   "application/msword",
  //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  //   "application/rtf",
  //   "application/vnd.apple.pages",
  //   "application/x-iwork-pages-sffpages",
  //   "application/vnd.apple.keynote",
  //   "application/x-iwork-keynote-sffkey",
  //   "application/epub+zip",
] as const;

export const allowedImageFileContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const allowedDocumentFileTypes = [
  ".pdf",
  //   ".doc",
  //   ".docx",
  //   ".pptx",
  //   ".rtf",
  //   ".pages",
  //   ".key",
  //   ".epub",
  //   ".txt",
];

// see https://airtable.com/developers/web/api/field-model

export const acceptedFieldTypesForDocumentExtraction = [
  // boolean fields
  "checkbox",
  // float fields
  "number",
  "currency",
  "duration",
  "percent",
  // int fields
  "rating",
  // date fields
  "date",
  // date time fields
  "dateTime",
  // single select fields
  "singleSelect",
  // multiple select fields
  "multipleSelects",
  // text fields
  "singleLineText",
  "multilineText",
  "email",
  "phoneNumber",
  "url",
  "richText",
  // mutliple record links is there because we have an extra step after the extraction
  "multipleRecordLinks",
] as const;

export type FieldType =
  (typeof acceptedFieldTypesForDocumentExtraction)[number];

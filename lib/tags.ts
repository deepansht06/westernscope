export const REVIEW_TAGS = [
  { value: "group_work", label: "Lots of group work" },
  { value: "attendance", label: "Attendance matters" },
  { value: "final_heavy", label: "Final-heavy" },
  { value: "lots_of_readings", label: "Heavy readings" },
  { value: "tough_grader", label: "Tough grader" },
  { value: "many_assignments", label: "Many assignments" },
] as const;

export type ReviewTag = (typeof REVIEW_TAGS)[number]["value"];

const TAG_VALUES = new Set<string>(REVIEW_TAGS.map((t) => t.value));

export function isReviewTag(v: string): v is ReviewTag {
  return TAG_VALUES.has(v);
}

const TAG_LABELS = new Map<string, string>(
  REVIEW_TAGS.map((t) => [t.value, t.label]),
);

export function tagLabel(value: string): string {
  return TAG_LABELS.get(value) ?? value;
}

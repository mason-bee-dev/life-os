import type { Mood } from "@/features/journal/types";

export const moodFaces = ["😫", "😕", "😐", "🙂", "😄"] as const;
export const moodLabels = ["Tệ", "Không tốt", "Bình thường", "Tốt", "Tuyệt vời"] as const;

export const faceFor = (m: Mood) => moodFaces[m - 1];
export const labelFor = (m: Mood) => moodLabels[m - 1];

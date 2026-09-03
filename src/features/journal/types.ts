export type Mood = 1 | 2 | 3 | 4 | 5;

export type JournalEntry = {
  id: number;
  date: string; // "Aug 31, 2026"
  mood: Mood;
  tags: string[];
  sleep?: string;
  exercise?: string;
  text: string;
};

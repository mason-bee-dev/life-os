import type { JournalEntry } from "./types";

export const defaultJournal: JournalEntry[] = [
  {
    id: 1,
    date: "30/08/2026",
    mood: 5,
    tags: ["công việc", "chạy bộ"],
    sleep: "7h 08m",
    exercise: "5.2 km",
    text: "Hôm nay là một ngày hiệu quả. Tôi hoàn thành mốc quan trọng của dự án và đi chạy một quãng thật tốt vào buổi tối.",
  },
  {
    id: 2,
    date: "29/08/2026",
    mood: 4,
    tags: ["đọc sách", "thư giãn"],
    sleep: "7h 20m",
    exercise: "Nghỉ ngơi",
    text: "Một ngày chậm rãi hơn. Tôi đọc hai chương và nấu bữa tối ở nhà. Đến cuối ngày, tôi cảm thấy như được nạp lại năng lượng thật sự.",
  },
  {
    id: 3,
    date: "28/08/2026",
    mood: 3,
    tags: ["công việc", "mệt mỏi"],
    sleep: "6h 40m",
    exercise: "Nghỉ ngơi",
    text: "Những cuộc họp nối tiếp cả ngày đã làm tôi kiệt sức. Tôi bỏ qua phòng gym, nhưng vẫn uống đủ nước và đi ngủ sớm.",
  },
];

export const tagPalette = [
  "công việc",
  "chạy bộ",
  "đọc sách",
  "thư giãn",
  "gia đình",
  "mệt mỏi",
  "tập trung",
];

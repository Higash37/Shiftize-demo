// 日本の祝日データ（2025年）
export const JAPANESE_HOLIDAYS_2025 = [
  { date: "2025-01-01", name: "元日" },
  { date: "2025-01-13", name: "成人の日" },
  { date: "2025-02-11", name: "建国記念の日" },
  { date: "2025-02-23", name: "天皇誕生日" },
  { date: "2025-03-20", name: "春分の日" },
  { date: "2025-04-29", name: "昭和の日" },
  { date: "2025-05-03", name: "憲法記念日" },
  { date: "2025-05-04", name: "みどりの日" },
  { date: "2025-05-05", name: "こどもの日" },
  { date: "2025-07-21", name: "海の日" },
  { date: "2025-08-11", name: "山の日" },
  { date: "2025-09-15", name: "敬老の日" },
  { date: "2025-09-23", name: "秋分の日" },
  { date: "2025-10-13", name: "スポーツの日" },
  { date: "2025-11-03", name: "文化の日" },
  { date: "2025-11-23", name: "勤労感謝の日" },
];

// 日本の祝日データ（2024年）
export const JAPANESE_HOLIDAYS_2024 = [
  { date: "2024-01-01", name: "元日" },
  { date: "2024-01-08", name: "成人の日" },
  { date: "2024-02-11", name: "建国記念の日" },
  { date: "2024-02-12", name: "振替休日" },
  { date: "2024-02-23", name: "天皇誕生日" },
  { date: "2024-03-20", name: "春分の日" },
  { date: "2024-04-29", name: "昭和の日" },
  { date: "2024-05-03", name: "憲法記念日" },
  { date: "2024-05-04", name: "みどりの日" },
  { date: "2024-05-05", name: "こどもの日" },
  { date: "2024-05-06", name: "振替休日" },
  { date: "2024-07-15", name: "海の日" },
  { date: "2024-08-11", name: "山の日" },
  { date: "2024-08-12", name: "振替休日" },
  { date: "2024-09-16", name: "敬老の日" },
  { date: "2024-09-22", name: "秋分の日" },
  { date: "2024-09-23", name: "振替休日" },
  { date: "2024-10-14", name: "スポーツの日" },
  { date: "2024-11-03", name: "文化の日" },
  { date: "2024-11-04", name: "振替休日" },
  { date: "2024-11-23", name: "勤労感謝の日" },
];

// 年に基づいて祝日データを取得
export const getJapaneseHolidays = (year: number) => {
  switch (year) {
    case 2024:
      return JAPANESE_HOLIDAYS_2024;
    case 2025:
      return JAPANESE_HOLIDAYS_2025;
    default:
      // 基本的な祝日のみ返す（年によって変わらない固定祝日）
      return [
        { date: `${year}-01-01`, name: "元日" },
        { date: `${year}-02-11`, name: "建国記念の日" },
        { date: `${year}-02-23`, name: "天皇誕生日" },
        { date: `${year}-04-29`, name: "昭和の日" },
        { date: `${year}-05-03`, name: "憲法記念日" },
        { date: `${year}-05-04`, name: "みどりの日" },
        { date: `${year}-05-05`, name: "こどもの日" },
        { date: `${year}-08-11`, name: "山の日" },
        { date: `${year}-11-03`, name: "文化の日" },
        { date: `${year}-11-23`, name: "勤労感謝の日" },
      ];
  }
};

// 現在年と翌年の祝日データを取得
export const getCurrentYearHolidays = () => {
  const currentYear = new Date().getFullYear();
  const currentYearHolidays = getJapaneseHolidays(currentYear);
  const nextYearHolidays = getJapaneseHolidays(currentYear + 1);

  return [...currentYearHolidays, ...nextYearHolidays];
};

export type MonthTheme = {
  light: string;
  dark: string;
  accent: string;
  textDark: string;
};

export const MONTH_THEMES: Record<number, MonthTheme> = {
  1: { light: '#EEF7FF', dark: '#243447', accent: '#8EC8FF', textDark: '#243447' },
  2: { light: '#FFF5FB', dark: '#3B2C39', accent: '#F6B7D8', textDark: '#3B2C39' },
  3: { light: '#F6FFF2', dark: '#263326', accent: '#9FD58A', textDark: '#263326' },
  4: { light: '#FFF8F0', dark: '#3A2F27', accent: '#F7CBA4', textDark: '#3A2F27' },
  5: { light: '#F1FFF8', dark: '#23352D', accent: '#8BD3B1', textDark: '#23352D' },
  6: { light: '#F2FBFF', dark: '#243541', accent: '#8FD3FF', textDark: '#243541' },
  7: { light: '#FFF8E8', dark: '#3B321F', accent: '#FFD36E', textDark: '#3B321F' },
  8: { light: '#FFF2E8', dark: '#402B20', accent: '#FFB38A', textDark: '#402B20' },
  9: { light: '#F7F4FF', dark: '#2E2940', accent: '#B9A3FF', textDark: '#2E2940' },
  10: { light: '#FFF0F5', dark: '#402432', accent: '#FF9FC2', textDark: '#402432' },
  11: { light: '#F5F8E9', dark: '#2D3321', accent: '#C5D97B', textDark: '#2D3321' },
  12: { light: '#F4F8FF', dark: '#243447', accent: '#A8C8FF', textDark: '#243447' },
};

export const getMonthTheme = (month: number) => MONTH_THEMES[month] ?? MONTH_THEMES[1];

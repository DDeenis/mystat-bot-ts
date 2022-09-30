const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const weekDays = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];
const weekDaysShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const getMonthName = (month: number) => months[month];
export const getDayOfWeek = (day: number) => weekDays[day];
export const getDayOfWeekShort = (day: number) => weekDaysShort[day];

import telegraf_inline from "telegraf-inline-menu";
import { Context } from "vm";
import userStore from "../../store/userStore.js";
import { formatMessage } from "../../utils.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString("ko-KR", options).replace(/\. /g, "-").slice(0, -1);

const getScheduleFormatted = async (
  ctx: Context,
  title: string,
  day?: number
): Promise<string> => {
  const date = new Date();

  if (day) {
    date.setDate(day);
  }

  const schedule = await userStore.get(ctx.chat.id)?.getScheduleByDate(date);
  let scheduleFormatted = "";

  if (!schedule || !schedule.success) {
    return "🚫 При получении расписания возникла ошибка: " + schedule?.error;
  } else if (schedule.data.length === 0) {
    return "🎉 Нет пар";
  }

  for (const scheduleEntry of schedule.data) {
    scheduleFormatted += formatMessage(
      `✏️ Предмет: ${scheduleEntry?.subject_name}`,
      `💡 Преподаватель: ${scheduleEntry?.teacher_name}`,
      `🗝 Аудитория: ${scheduleEntry?.room_name}`,
      `⏰ Время: ${scheduleEntry?.started_at} - ${scheduleEntry?.finished_at}`
    );
  }

  return [title + "\n", scheduleFormatted].join("\n");
};

const getDateString = (date: Date = new Date()) =>
  date.toLocaleString().substring(3, 10);
const daysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate();
const getDaysArray = async (date: Date, ctx: Context): Promise<string[]> => {
  const totalButtons = 35;
  const totalDays = daysInMonth(date.getFullYear(), date.getMonth() + 1);
  const days: string[] = [];
  const schedule = await userStore.get(ctx.chat.id)?.getMonthSchedule(date);

  // empty buttons before
  date.setDate(1);
  for (let count = 0; count < date.getDay() - 1; count++) {
    days.push(" ");
  }

  // actual buttons
  for (let count = 0; count < totalDays; count++) {
    date.setDate(count + 1);

    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const currentDate = formatDate(date, dateFormatOptions);

    if (schedule?.data.some((elem: any) => elem.date === currentDate)) {
      days.push("🟢" + String(count + 1));
    } else {
      days.push("🔴" + String(count + 1));
    }
  }

  // empty buttons after
  date.setDate(1);
  for (
    let count = 0;
    count < totalButtons - totalDays - date.getDay() + 1;
    count++
  ) {
    days.push(" ");
  }

  return days;
};

const scheduleTodaySubmenu = new MenuTemplate<Context>(
  async (ctx) => await getScheduleFormatted(ctx, "Раписание на сегодня")
);
scheduleTodaySubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const scheduleTomorrowSubmenu = new MenuTemplate<Context>(
  async (ctx) =>
    await getScheduleFormatted(
      ctx,
      "Раписание на завтра",
      new Date().getDate() + 1
    )
);
scheduleTomorrowSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const monthScheduleEntrySubmenu = new MenuTemplate<Context>(async (ctx) => {
  const day = ctx.match[1].match(/\d+| /)[0]; // extract number or space symbol

  if (day === " ") {
    return "🎉 Нет пар";
  }

  return await getScheduleFormatted(
    ctx,
    `Расписание на ${day}.${getDateString()}`,
    parseInt(day)
  );
});
monthScheduleEntrySubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const monthScheduleSubmenu = new MenuTemplate<Context>(
  () => `Расписание на ${getDateString()}`
);
monthScheduleSubmenu.chooseIntoSubmenu(
  "schedule-month-days",
  async (ctx) => await getDaysArray(new Date(), ctx),
  monthScheduleEntrySubmenu,
  { columns: 7 }
);
monthScheduleSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export { scheduleTodaySubmenu, scheduleTomorrowSubmenu, monthScheduleSubmenu };

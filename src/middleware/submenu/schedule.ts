import telegraf_inline from "telegraf-inline-menu";
import { Scenes } from "telegraf";
import userStore from "../../store/userStore.js";
import {
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";
import {
  getDayOfWeek,
  getDayOfWeekShort,
  getMonthName,
} from "../../helpers/schedule.js";
import { MystatResponse } from "mystat-api/dist/types.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

// const newmsgSymbol = "!new";
const nextMsgSymbol = "\n";
const maxMsgLength = 4250;
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = dateFormatOptions
) => {
  return date
    .toLocaleDateString("ko-KR", options)
    .replace(/\. /g, "-")
    .slice(0, -1);
};

const formatSchedule = (scheduleEntry: any) => {
  return formatMessage(
    `✏️ Предмет: ${scheduleEntry?.subject_name}`,
    `💡 Преподаватель: ${scheduleEntry?.teacher_name}`,
    `🗝 Аудитория: ${scheduleEntry?.room_name}`,
    `⏰ Время: ${scheduleEntry?.started_at} - ${scheduleEntry?.finished_at}`
  );
};

const getScheduleFormatted = async (
  ctx: Scenes.WizardContext,
  title: string,
  date: Date = new Date()
): Promise<string> => {
  const schedule = await userStore.get(ctx.chat?.id)?.getScheduleByDate(date);
  let scheduleFormatted = "";

  if (!schedule || !schedule.success) {
    return "🚫 При получении расписания возникла ошибка: " + schedule?.error;
  } else if (schedule.data.length === 0) {
    return "🎉 Нет пар";
  }

  // sort items by start time
  const scheduleItems = schedule.data.sort((a: any, b: any) => {
    const dateA = Date.parse(`01 Jan 1970 00:${a.started_at} GMT`);
    const dateB = Date.parse(`01 Jan 1970 00:${b.started_at} GMT`);
    return dateA - dateB;
  });
  for (const scheduleEntry of scheduleItems) {
    scheduleFormatted += formatSchedule(scheduleEntry);
  }

  return [title + "\n", scheduleFormatted].join("\n");
};

const getCurrentWeek = () => {
  const weekStart = new Date();
  const dayOfWeek = weekStart.getDay() === 0 ? 7 : weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (dayOfWeek - 1));
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    dates.push(formatDate(date));
  }

  return dates;
};

const maxMonths = 11;
const getWeekScheduleMarkdown = async (
  ctx: Scenes.WizardContext
): Promise<string> => {
  const api = userStore.get(ctx.chat?.id);
  const weekDays = getCurrentWeek();

  const daysPromises: (Promise<MystatResponse> | undefined)[] = [];
  for (const day of weekDays) {
    daysPromises.push(api?.getScheduleByDate(new Date(day)));
  }
  const results = await Promise.all(daysPromises);
  const errorResult = results.find((r) => !r?.success);

  if (errorResult) {
    return "🚫 При получении расписания возникла ошибка: " + errorResult.error;
  } else if (results.length === 0) {
    return "🎉 Нет пар";
  }

  const schedule = results.flatMap((r) => r?.data as any[]);

  const scheduleWeekDays = new Map<string, any[]>();
  for (const dayOfWeek of weekDays) {
    const scheduleEntries = schedule.filter((s: any) => s.date === dayOfWeek);
    scheduleWeekDays.set(dayOfWeek, scheduleEntries);
  }

  let scheduleFormatted = "";
  for (const dayOfWeek of weekDays) {
    scheduleFormatted += `*${getDayOfWeek(new Date(dayOfWeek).getDay())}:*\n`;
    const scheduleEntries = scheduleWeekDays.get(dayOfWeek) as any[];

    if (scheduleEntries.length !== 0) {
      for (const scheduleEntry of scheduleEntries) {
        scheduleFormatted += formatSchedule(scheduleEntry);
      }
    } else {
      scheduleFormatted += "🎉 Нет пар\n";
    }

    scheduleFormatted += nextMsgSymbol;
  }

  return scheduleFormatted;
};

const getDateString = (date: Date = new Date()) =>
  date.toLocaleString().substring(3, 10);
const daysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate();

const getDaysArray = async (
  date: Date,
  ctx: Scenes.WizardContext
): Promise<string[]> => {
  // date.setDate(1);
  const dateCopy = new Date(date);
  dateCopy.setDate(1);

  const totalDays = daysInMonth(date.getFullYear(), date.getMonth() + 1);
  const btnsPerRow = 7;
  // if month has 31 day and starts at saturday or sunday one more row needed
  const rows = dateCopy.getDay() < 6 ? 5 : totalDays < 31 ? 5 : 6;
  // const rows = totalDays < 31 ? 5 : 6;
  const totalButtons = btnsPerRow * rows;
  const days: string[] = [];
  const schedule = await userStore.get(ctx.chat?.id)?.getMonthSchedule(date);

  // week days names
  for (let i = 0; i < 7; i++) {
    days.push(getDayOfWeekShort(i));
  }

  // empty buttons before
  dateCopy.setDate(1);
  for (let count = 0; count < dateCopy.getDay() - 1; count++) {
    days.push(" ");
  }

  // actual buttons
  for (let count = 0; count < totalDays; count++) {
    dateCopy.setDate(count + 1);

    const currentDate = formatDate(dateCopy);

    if (schedule?.data.some((elem: any) => elem.date === currentDate)) {
      days.push("🟢" + String(count + 1));
    } else {
      days.push("🔴" + String(count + 1));
    }
  }

  // empty buttons after
  dateCopy.setDate(1);
  for (
    let count = 0;
    count < totalButtons - totalDays - dateCopy.getDay() + 1;
    count++
  ) {
    days.push(" ");
  }

  return days;
};

const scheduleTodaySubmenu = new MenuTemplate<Scenes.WizardContext>(
  async (ctx) => await getScheduleFormatted(ctx, "Раписание на сегодня")
);
scheduleTodaySubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const scheduleTomorrowSubmenu = new MenuTemplate<Scenes.WizardContext>(
  async (ctx) => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return await getScheduleFormatted(ctx, "Раписание на завтра", date);
  }
);
scheduleTomorrowSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const scheduleWeekSubmenu = new MenuTemplate<Scenes.WizardContext>(
  async (ctx) => {
    const msg = await getWeekScheduleMarkdown(ctx);

    if (msg.length < maxMsgLength) {
      return {
        text: msg,
        parse_mode: "Markdown",
      };
    } else {
      return "❗️ Сообщение оказалось слишком длинным. Попробуйте посмотреть отдельно по дням.";
    }
  }
);
scheduleWeekSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const monthScheduleEntrySubmenu = new MenuTemplate<any>(async (ctx) => {
  const day = ctx.match[1].match(/\d+| /)?.[0]; // extract number or space symbol
  const dayParsed = parseInt(day);
  const date = new Date();
  const currentMonth = getSessionValue<number>(ctx, scheduleMonthKey);

  if (!dayParsed) {
    return "🎉 Нет пар";
  }

  if (currentMonth) {
    date.setMonth(currentMonth);
  }

  date.setDate(dayParsed);

  return await getScheduleFormatted(
    ctx,
    `Расписание на ${day}.${getDateString(date)}`,
    date
  );
});
monthScheduleEntrySubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const monthScheduleSubmenu = new MenuTemplate<Scenes.WizardContext>((ctx) => {
  const date = new Date();
  const currentMonth = getSessionValue<number>(ctx, scheduleMonthKey);

  if (currentMonth) {
    date.setMonth(currentMonth);
  }

  return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
});
monthScheduleSubmenu.chooseIntoSubmenu(
  "schedule-month-days",
  async (ctx) => {
    const date = new Date();
    const currentMonth = getSessionValue<number>(ctx, scheduleMonthKey);

    if (currentMonth) {
      date.setMonth(currentMonth);
    }

    return await getDaysArray(date, ctx);
  },
  monthScheduleEntrySubmenu,
  { columns: 7 }
);

const scheduleMonthKey = "scheduleMonthDate";
monthScheduleSubmenu.interact("<", "prevMonth", {
  do: (ctx) => {
    const currentMonth =
      getSessionValue<number>(ctx, scheduleMonthKey) ?? new Date().getMonth();

    if (currentMonth <= 0) return false;

    const newMonth = currentMonth - 1;
    setSessionValue(ctx, scheduleMonthKey, newMonth);

    return true;
  },
  hide: (ctx) => {
    const currentMonth =
      getSessionValue<number>(ctx, scheduleMonthKey) ?? new Date().getMonth();
    return currentMonth <= 0;
  },
});
monthScheduleSubmenu.interact(">", "nextMonth", {
  do: (ctx) => {
    const currentMonth =
      getSessionValue<number>(ctx, scheduleMonthKey) ?? new Date().getMonth();

    if (currentMonth >= maxMonths) return false;

    const newMonth = currentMonth + 1;
    setSessionValue(ctx, scheduleMonthKey, newMonth);

    return true;
  },
  hide: (ctx) => {
    const currentMonth =
      getSessionValue<number>(ctx, scheduleMonthKey) ?? new Date().getMonth();
    return currentMonth >= maxMonths;
  },
  joinLastRow: true,
});
monthScheduleSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export {
  scheduleTodaySubmenu,
  scheduleTomorrowSubmenu,
  scheduleWeekSubmenu,
  monthScheduleSubmenu,
};

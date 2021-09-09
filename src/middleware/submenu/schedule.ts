import { getScheduleByDate, getMonthSchedule } from "mystat-api";
import telegraf_inline from "telegraf-inline-menu";
import { Context } from "vm";
import { formatMessage, getUserDataFromSession } from "../../utils.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const getScheduleFormatted = async (ctx: Context, title: string, day?: number): Promise<string> => {
    const date = new Date();

    if (day) {
        date.setDate(day);
    }

    const schedule = await getScheduleByDate(getUserDataFromSession(ctx), date);
    let scheduleFormatted = '';

    if (!schedule.success) {
        return '🚫 При получении расписания возникла ошибка: ' + schedule.error;
    } else if (schedule.data.length === 0) {
        return '🎉 Нет пар';
    }

    for (const scheduleEntry of schedule.data) {
        scheduleFormatted += formatMessage(
            `✏️ Предмет: ${scheduleEntry?.subject_name}`,
            `💡 Преподаватель: ${scheduleEntry?.teacher_name}`,
            `🗝 Аудитория: ${scheduleEntry?.room_name}`,
            `⏰ Время: ${scheduleEntry?.started_at} - ${scheduleEntry?.finished_at}`,
        );
    }

    return [
        title + '\n',
        scheduleFormatted
    ].join('\n');
}

const getDateString = (date: Date = new Date()) => date.toLocaleString().substring(3, 10);
const daysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();
const getDaysArray = async (date: Date, ctx: Context): Promise<string[]> => {
    const totalButtons = 35;
    const totalDays = daysInMonth(date.getFullYear(), date.getMonth() + 1);
    const days: string[] = [];

    const schedule = await getMonthSchedule(getUserDataFromSession(ctx), date);
    // actual buttons
    let date_template = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-'; // smth like '2000-02-'
    for (let count = 0; count < totalDays; count++) {

        date.setDate(count + 1);
        let cur_date = date_template + ('0' + (count + 1)).slice(-2); // smth like '2000-02-' + '02'
        if (schedule.data.find(elem => elem.date === cur_date) === undefined) { // if no lession matches with date
            days.push('🔴' + String(count + 1)); // put red dot
        }
        else {
            days.push('🟢' + String(count + 1)); // put green got
        }
    }

    // empty buttons
    for (let count = 0; count < totalButtons - totalDays; count++) {
        days.push(' ');
    }

    return days;
}

const scheduleTodaySubmenu = new MenuTemplate<Context>(async (ctx) => await getScheduleFormatted(ctx, 'Раписание на сегодня'));
scheduleTodaySubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const scheduleTomorrowSubmenu = new MenuTemplate<Context>(async (ctx) => await getScheduleFormatted(ctx, 'Раписание на завтра', (new Date().getDate() + 1)));
scheduleTomorrowSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const monthScheduleEntrySubmenu = new MenuTemplate<Context>(async (ctx) => {
    const day = ctx.match[1].match(/\d+/)[0];
    console.log(day);

    if (day === ' ') {
        return '🎉 Нет пар';
    }

    return await getScheduleFormatted(ctx, `Расписание на ${day}.${getDateString()}`, parseInt(day));
});
monthScheduleEntrySubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const monthScheduleSubmenu = new MenuTemplate<Context>(() => `Расписание на ${getDateString()}`);
monthScheduleSubmenu.chooseIntoSubmenu('schedule-month-days', async (ctx) => await getDaysArray(new Date(), ctx), monthScheduleEntrySubmenu, { columns: 7 });
monthScheduleSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export {
    scheduleTodaySubmenu,
    scheduleTomorrowSubmenu,
    monthScheduleSubmenu
}
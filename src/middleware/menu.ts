import { createBackMainMenuButtons, MenuMiddleware, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { getScheduleByDate } from "mystat-api";
import { getUserDataFromSession } from "../utils.js";
import { MystatResponse } from "../types.js";

const menuTemplate = new MenuTemplate<Context>(() => 'Выберите действие');

const homeworkSubmenu = new MenuTemplate<Context>(ctx => ctx.match[1]);
homeworkSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

// menuTemplate.interact('Домашние задания', 'homework', {
//     do: async (ctx) => {
//         return false;
//     }
// });

// menuTemplate.chooseIntoSubmenu('homework-options', ['Текущие', 'Выполненные', 'Просроченные', 'Удаленные'], homeworkSubmenu, { columns: 1 });

const scheduleTomorrowSubmenu = new MenuTemplate<Context>(async (ctx) => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const schedule: MystatResponse = await getScheduleByDate(getUserDataFromSession(ctx), tomorrowDate);
    let scheduleFormatted: string = '';

    if (!schedule.success) {
        return '🚫 При получении расписания возникла ошибка: ' + schedule.error;
    } else if (schedule.data.length <= 0) {
        return '🎉 У вас завтра нет пар';
    }

    for (const scheduleEntry of schedule.data) {
        scheduleFormatted += [
            `✏️ Предмет: ${scheduleEntry.subject_name}`,
            `💡 Преподаватель: ${scheduleEntry.teacher_name}`,
            `🗝 Аудитория: ${scheduleEntry.room_name}`,
            `⏰ Время: ${scheduleEntry.started_at} - ${scheduleEntry.finished_at}`,
            '\n'
        ].join('\n');
    }

    return [
        'Раписание на завтра\n',
        scheduleFormatted
    ].join('\n');
});
scheduleTomorrowSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

menuTemplate.submenu('Расписание на завтра', 'schedule-tomorrow', scheduleTomorrowSubmenu);

const menuMiddleware = new MenuMiddleware('menu/', menuTemplate);

export default menuMiddleware;
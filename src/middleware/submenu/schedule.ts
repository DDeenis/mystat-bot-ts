import { getScheduleByDate } from "mystat-api";
import { createBackMainMenuButtons, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { MystatResponse } from "../../types.js";
import { formatMessage, getUserDataFromSession } from "../../utils.js";

const scheduleTodaySubmenu = new MenuTemplate<Context>(async (ctx) => {
    const todayDate = new Date();

    const schedule: MystatResponse = await getScheduleByDate(getUserDataFromSession(ctx), todayDate);
    let scheduleFormatted = '';

    if (!schedule.success) {
        return '🚫 При получении расписания возникла ошибка: ' + schedule.error;
    } else if (schedule.data.length <= 0) {
        return '🎉 У вас сегодня нет пар';
    }

    for (const scheduleEntry of schedule.data) {
        scheduleFormatted += formatMessage(
            `✏️ Предмет: ${scheduleEntry.subject_name}`,
            `💡 Преподаватель: ${scheduleEntry.teacher_name}`,
            `🗝 Аудитория: ${scheduleEntry.room_name}`,
            `⏰ Время: ${scheduleEntry.started_at} - ${scheduleEntry.finished_at}`,
        );
    }

    return [
        'Раписание на сегодня\n',
        scheduleFormatted
    ].join('\n');
});
scheduleTodaySubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const scheduleTomorrowSubmenu = new MenuTemplate<Context>(async (ctx) => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const schedule: MystatResponse = await getScheduleByDate(getUserDataFromSession(ctx), tomorrowDate);
    let scheduleFormatted = '';

    if (!schedule.success) {
        return '🚫 При получении расписания возникла ошибка: ' + schedule.error;
    } else if (schedule.data.length <= 0) {
        return '🎉 У вас завтра нет пар';
    }

    for (const scheduleEntry of schedule.data) {
        scheduleFormatted += formatMessage(
            `✏️ Предмет: ${scheduleEntry.subject_name}`,
            `💡 Преподаватель: ${scheduleEntry.teacher_name}`,
            `🗝 Аудитория: ${scheduleEntry.room_name}`,
            `⏰ Время: ${scheduleEntry.started_at} - ${scheduleEntry.finished_at}`,
        );
    }

    return [
        'Раписание на завтра\n',
        scheduleFormatted
    ].join('\n');
});
scheduleTomorrowSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export {
    scheduleTodaySubmenu,
    scheduleTomorrowSubmenu
}
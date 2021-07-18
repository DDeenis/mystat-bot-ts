import { getFutureExams } from "mystat-api";
import { createBackMainMenuButtons, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { formatMessage, getUserDataFromSession } from "../../utils.js";

const futureExamsSubmenu = new MenuTemplate<Context>(async (ctx) => {
    const futureExams = await getFutureExams(getUserDataFromSession(ctx));

    if (!futureExams.success) {
        return '🚫 При получении расписания экзаменов возникла ошибка: ' + futureExams.error;
    } else if (futureExams.data.length === 0) {
        return '🎉 У вас нет назначеных экзаменов';
    }

    let futureExamsFormatted = '';

    for (const exam of futureExams.data) {
        futureExamsFormatted += formatMessage(
            `✏️ Предмет: ${exam?.spec}`,
            `⏰ Дата: ${exam?.date}`
        );
    }

    return [
        'Будущие экзамены',
        futureExamsFormatted
    ].join('\n');
});
futureExamsSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default futureExamsSubmenu;
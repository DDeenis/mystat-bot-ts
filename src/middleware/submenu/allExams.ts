import { getExams } from "mystat-api";
import { Telegraf } from "telegraf";
import telegraf_inline from "telegraf-inline-menu";
const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;
import { Context } from "vm";
import { formatMessage, getSessionValue, getUserDataFromSession, setSessionValue } from "../../utils.js";

const getExamsList = async (ctx: Context): Promise<string[]> => {
    const exams = await getExams(getUserDataFromSession(ctx));

    if (!exams.success) {
        return [];
    }

    setSessionValue<any[]>(ctx, 'exams', exams.data);

    return exams.data.map(e => e.spec.substring(0, 20) + '…');
}

const allExamsEntrySubmenu = new MenuTemplate<Context>(async (ctx) => {
    const match: string = ctx.match[1];
    const exam = getSessionValue<any[]>(ctx, 'exams').find(e => e.spec.substring(0, 20) + '…' === match);

    const examFormatted = formatMessage(
        `✏️ Предмет: ${exam?.spec}`,
        `⏰ Дата: ${exam?.date}`,
        `💰 Преподаватель: ${exam?.teacher}`,
        `🕯 Оценка: ${exam?.mark}`
    );

    return [
        exam?.spec,
        examFormatted
    ].join('\n');
});
allExamsEntrySubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const allExamsSubmenu = new MenuTemplate<Context>(() => 'Все экзамены');
allExamsSubmenu.chooseIntoSubmenu('exams', async (ctx) => await getExamsList(ctx), allExamsEntrySubmenu, { columns: 2 });
allExamsSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default allExamsSubmenu;
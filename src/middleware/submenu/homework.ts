import { createBackMainMenuButtons, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { getHomeworkList } from "mystat-api";
import { HomeworkStatus } from "../../types.js";
import { formatMessage, getSessionValue, getUserDataFromSession, setSessionValue } from "../../utils.js";

const HomeworkStatusTypes = Object.freeze({
    Overdue: 'Просроченные',
    Checked: 'Выполненные',
    Uploaded: 'Загруженные',
    Active: 'Текущие',
    Deleted: 'Удаленные'
});

const homeworkStatusList = [
    HomeworkStatusTypes.Active,
    HomeworkStatusTypes.Checked,
    HomeworkStatusTypes.Uploaded,
    HomeworkStatusTypes.Overdue,
    HomeworkStatusTypes.Deleted
];

function getHomeworkStatusByMatch(match: string): number {
    switch (match) {
        case HomeworkStatusTypes.Active:
            return HomeworkStatus.Active;
        
        case HomeworkStatusTypes.Checked:
            return HomeworkStatus.Checked;
        
        case HomeworkStatusTypes.Deleted:
            return HomeworkStatus.Deleted;
        
        case HomeworkStatusTypes.Overdue:
            return HomeworkStatus.Overdue;
    
        case HomeworkStatusTypes.Uploaded:
            return HomeworkStatus.Uploaded;
        
        default:
            return -1;
    }
}

async function getHomeworksByMatch(ctx: any): Promise<any[]> {
    const match: string = ctx.match[1];
    const homeworkStatus = getHomeworkStatusByMatch(match);
    const homeworks = await getHomeworkList(getUserDataFromSession(ctx), homeworkStatus);
    // const data = homeworks.success ? homeworks.data.map(h => h.name_spec.slice(0, 12) + '…') : [];
    setSessionValue<unknown[]>(ctx, 'homeworks', homeworks.data);

    return homeworks.data;
}

const selectedHomeworkSubmenu = new MenuTemplate<Context>((ctx) => {
    console.log(ctx.match);
    
    return ctx.match[2];
});
selectedHomeworkSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const selectedHomeworkListSubmenu = new MenuTemplate<Context>((ctx) => ctx.match[1]);
// error on long path
// selectedHomeworkListSubmenu.chooseIntoSubmenu('hl', async (ctx) => await getHomeworksByMatch(ctx), selectedHomeworkSubmenu, { columns: 2 });

selectedHomeworkListSubmenu.manualRow(async (ctx: Context) => {
    const homeworks = await getHomeworksByMatch(ctx);

    return [homeworks.slice(0, 3).map(h => ({
        text: h.name_spec,
        relativePath: 'hl:' + h.id
    }))];
});

selectedHomeworkListSubmenu.manualRow(async (ctx: Context) => {
    const homeworks = await getHomeworksByMatch(ctx);

    return [homeworks.slice(3, homeworks?.length).map(h => ({
        text: h.name_spec,
        relativePath: 'hl:' + h.id,
    }))];
});

selectedHomeworkListSubmenu.manualAction(/hl:(\d+)$/, async (ctx: Context, path: string) => {
    const parts: string[] = path.split(':');
    const id: number = parseInt(parts[parts.length - 1]);
    const homework = getSessionValue<any[]>(ctx, 'homeworks')?.find(h => h.id === id);

    await ctx.reply(
        formatMessage(
            `✏️ Предмет: ${homework.name_spec}`,
            `📖 Тема: ${homework.theme}`,
            `💡 Преподаватель: ${homework.fio_teach}`,
            `📅 Дата выдачи: ${homework.creation_time}`,
            `❕ Сдать до: ${homework.completion_time}`,
            `✒️ Комментарий: ${homework.comment}`,
            `📁 Путь к файлу: ${homework.file_path}`,
            `📂 Путь к загруженному файлу: ${homework.homework_stud.file_path}`,
            `✅ Проверенно: ${homework.homework_stud.creation_time}`,
            `🎉 Оценка: ${homework.homework_stud.mark}`
        )
    );
    
    return '.'
});

selectedHomeworkListSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const homeworkSubmenu = new MenuTemplate<Context>(() => 'Выберите тип домашнего задания');
homeworkSubmenu.chooseIntoSubmenu('ho', homeworkStatusList, selectedHomeworkListSubmenu, { columns: 1 });
homeworkSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default homeworkSubmenu;
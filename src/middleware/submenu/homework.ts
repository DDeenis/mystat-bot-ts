import { createBackMainMenuButtons, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { getHomeworkList } from "mystat-api";
import { HomeworkStatus } from "../../types.js";
import { getUserDataFromSession } from "../../utils.js";

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

async function getHomeworksByMatch(ctx: any): Promise<string[]> {
    const match: string = ctx.match[1];
    const homeworkStatus = getHomeworkStatusByMatch(match);
    const homeworks = await getHomeworkList(getUserDataFromSession(ctx), homeworkStatus);
    const data = homeworks.success ? homeworks.data.map(h => h.name_spec.slice(0, 12) + '…') : [];

    return data;
}

const selectedHomeworkSubmenu = new MenuTemplate<Context>((ctx) => ctx.match[2]);
selectedHomeworkSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const selectedHomeworkListSubmenu = new MenuTemplate<Context>((ctx) => ctx.match[1]);
// error on long path
selectedHomeworkListSubmenu.chooseIntoSubmenu('hl', async (ctx) => await getHomeworksByMatch(ctx), selectedHomeworkSubmenu, { columns: 2 });
selectedHomeworkListSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const homeworkSubmenu = new MenuTemplate<Context>(() => 'Выберите тип домашнего задания');
homeworkSubmenu.chooseIntoSubmenu('ho', homeworkStatusList, selectedHomeworkListSubmenu, { columns: 1 });
homeworkSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default homeworkSubmenu;
import { getGroupLeaders } from "mystat-api";
import { createBackMainMenuButtons, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { cropString, formatMessage, getSessionValue, getUserDataFromSession, setSessionValue } from "../../utils.js";

const studentsField = 'students';

const formatStudentName = (source: string) => cropString(source, 24);

const getStudents = async (ctx: Context): Promise<string[]> => {
    const students = await getGroupLeaders(getUserDataFromSession(ctx));

    if (!students.success) {
        console.log(students.error);
        return [];
    }

    setSessionValue<any[]>(ctx, studentsField, students.data);

    return students.data.map(s => formatStudentName(s.full_name));
}

const studentSubmenu = new MenuTemplate<Context>(async (ctx) => {
    const match = ctx.match[1];
    const students = getSessionValue<any[]>(ctx, studentsField);
    const student = students.find(s => formatStudentName(s.full_name) === match);

    if (!student) {
        return '🚫 При получении списка группы возникла ошибка';
    }

    const studentFormatted = formatMessage(
        `📝 Имя: ${student.full_name}`,
        `📊 Количество очков: ${student.amount}`,
        `📱 Фото: ${student.photo_path}`,
        `🔑 ID: ${student.id}`
    );

    return [
        student.full_name,
        studentFormatted
    ].join('\n');
});
studentSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const groupSubmenu = new MenuTemplate<Context>(() => 'Список группы');
groupSubmenu.chooseIntoSubmenu('lst', async (ctx) => await getStudents(ctx), studentSubmenu, { columns: 2 });
groupSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default groupSubmenu;
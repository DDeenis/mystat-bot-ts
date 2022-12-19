import { MystatStudentInfo } from "mystat-api/dist/types.js";
import telegraf_inline from "telegraf-inline-menu";
import { Context } from "vm";
import userStore from "../../store/userStore.js";
import {
  cropString,
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const studentsField = "students";

const formatStudentName = (source: string) => cropString(source, 24);

const getStudents = async (ctx: Context): Promise<string[]> => {
  const students = await userStore.get(ctx.chat?.id)?.getGroupLeaders();

  if (!students || !students.success) {
    console.log(students?.error);
    return [];
  }

  setSessionValue<MystatStudentInfo[]>(ctx, studentsField, students.data);

  return students.data.map((s: any) => formatStudentName(s.full_name));
};

const studentSubmenu = new MenuTemplate<Context>(async (ctx) => {
  const match = ctx.match[1];
  const students = getSessionValue<MystatStudentInfo[]>(ctx, studentsField);
  const student = students.find(
    (s) => formatStudentName(s.full_name) === match
  );

  if (!student) {
    return "🚫 При получении списка группы возникла ошибка";
  }

  const studentFormatted = formatMessage(
    `📝 Имя: ${student.full_name}`,
    `📊 Количество очков: ${student.amount}`,
    `📱 Фото: [фото](${student.photo_path})`,
    `🔑 ID: ${student.id}`
  );

  const text = [student.full_name, studentFormatted].join("\n");

  return {
    text,
    parse_mode: "Markdown",
  };
});
studentSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const groupSubmenu = new MenuTemplate<Context>(() => "Список группы");
groupSubmenu.chooseIntoSubmenu(
  "lst",
  async (ctx) => await getStudents(ctx),
  studentSubmenu,
  { columns: 2 }
);
groupSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export default groupSubmenu;

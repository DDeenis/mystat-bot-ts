import { StudentInfo } from "mystat-api";
import telegraf_inline from "telegraf-inline-menu";
import { getErrorMessage } from "../../helpers/logger.js";
import userStore from "../../store/userStore.js";
import {
  cropString,
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";
import { Context, deunionize } from "telegraf";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const studentsField = "students";

const formatStudentName = (source: string) => cropString(source, 24);

const getStudents = async (ctx: Context) => {
  const students = await userStore.get(ctx.chat?.id)?.getGroupLeaders();

  if (!students) {
    console.error("Failed to get students");
    return [];
  }

  setSessionValue<StudentInfo[]>(ctx, studentsField, students);

  const fullNames = students.map((s) => formatStudentName(s.full_name));
  const sudmenuMap: Record<number, string> = {};
  for (let i = 0; i < fullNames.length; i++) {
    sudmenuMap[i] = fullNames[i];
  }
  return sudmenuMap;
};

const studentSubmenu = new MenuTemplate<Context>(async (ctx) => {
  const match = deunionize<any>(ctx).match[1] as number;
  const students = getSessionValue<StudentInfo[]>(ctx, studentsField);
  const student = students[match];

  if (!student) {
    return getErrorMessage("Not found");
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
groupSubmenu.chooseIntoSubmenu("lst", getStudents, studentSubmenu, {
  columns: 2,
});
groupSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export default groupSubmenu;

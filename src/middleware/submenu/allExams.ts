import telegraf_inline from "telegraf-inline-menu";
import { Scenes } from "telegraf";
import userStore from "../../store/userStore.js";
import {
  cropString,
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";
import { Exam } from "mystat-api";

const formatString = (source: string): string => cropString(source, 20);

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const getExamsList = async (ctx: Scenes.WizardContext) => {
  const exams = await userStore.get(ctx.chat?.id)?.getAllExams();

  if (!exams) {
    return [];
  }

  setSessionValue<Exam[]>(ctx, "exams", exams);

  const examsNamesFormatted = exams.map((e) => formatString(e.spec));
  const submenuMap: Record<number, string> = {};
  for (let i = 0; i < examsNamesFormatted.length; i++) {
    submenuMap[i] = examsNamesFormatted[i];
  }

  return submenuMap;
};

const allExamsEntrySubmenu = new MenuTemplate<any>(async (ctx) => {
  const match: number = ctx.match[1];
  const exam = getSessionValue<Exam[]>(ctx, "exams")[match];

  const examFormatted = formatMessage(
    `✏️ Предмет: ${exam?.spec}`,
    `⏰ Дата: ${exam?.date}`,
    `💰 Преподаватель: ${exam?.teacher}`,
    `🕯 Оценка: ${exam?.mark}`
  );

  return [exam?.spec, examFormatted].join("\n");
});
allExamsEntrySubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const allExamsSubmenu = new MenuTemplate<Scenes.WizardContext>(
  () => "Все экзамены"
);
allExamsSubmenu.chooseIntoSubmenu("exams", getExamsList, allExamsEntrySubmenu, {
  columns: 2,
});
allExamsSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export default allExamsSubmenu;

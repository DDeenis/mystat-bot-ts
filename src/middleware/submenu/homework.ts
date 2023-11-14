import { Homework, HomeworkStatus, HomeworkType } from "mystat-api";
import telegraf_inline from "telegraf-inline-menu";
import { Scenes } from "telegraf";
import userStore from "../../store/userStore.js";
import {
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

enum HomeworkStatusTypes {
  Overdue = "🔥 Просроченные",
  Checked = "📩 Выполненные",
  Uploaded = "📥 Загруженные",
  Active = "📨 Текущие",
  Deleted = "🗑 Удаленные",
}

const homeworkStatusList = {
  [HomeworkStatus.Active]: HomeworkStatusTypes.Active,
  [HomeworkStatus.Checked]: HomeworkStatusTypes.Checked,
  [HomeworkStatus.Uploaded]: HomeworkStatusTypes.Uploaded,
  [HomeworkStatus.Overdue]: HomeworkStatusTypes.Overdue,
  [HomeworkStatus.Deleted]: HomeworkStatusTypes.Deleted,
};

const homeworkStatusTitles = {
  [HomeworkStatusTypes.Active]: HomeworkStatus.Active,
  [HomeworkStatusTypes.Checked]: HomeworkStatus.Checked,
  [HomeworkStatusTypes.Uploaded]: HomeworkStatus.Uploaded,
  [HomeworkStatusTypes.Overdue]: HomeworkStatus.Overdue,
  [HomeworkStatusTypes.Deleted]: HomeworkStatus.Deleted,
};

async function getHomeworksByMatch(ctx: any): Promise<Homework[]> {
  const match: string = ctx.match[1];
  const homeworkStatus = homeworkStatusTitles[match as HomeworkStatusTypes];

  const homeworks = await userStore.get(ctx.chat?.id)?.getHomeworkList({
    page: getSessionValue<number>(ctx, "page") || 1,
    status: homeworkStatus,
    type: HomeworkType.Homework,
  });
  setSessionValue<Homework[]>(ctx, "homeworks", homeworks?.data ?? []);

  return homeworks?.data ?? [];
}

const selectedHomeworkSubmenu = new MenuTemplate<any>((ctx) => {
  return ctx.match[2];
});
selectedHomeworkSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const selectedHomeworkListSubmenu = new MenuTemplate<any>(
  (ctx) => ctx.match[1]
);

const homeworkInfoSubmenu = new MenuTemplate<any>(async (ctx) => {
  const index: number = ctx.match[2];
  const homework = getSessionValue<Homework[]>(ctx, "homeworks")?.[index];

  return await formatMessage(
    `✏️ Предмет: ${homework?.name_spec}`,
    `📖 Тема: ${homework?.theme}`,
    `💡 Преподаватель: ${homework?.fio_teach}`,
    `📅 Дата выдачи: ${homework?.creation_time}`,
    `❕ Сдать до: ${homework?.completion_time}`,
    `✒️ Комментарий: ${homework?.comment}`,
    `📁 Путь к файлу: ${homework?.file_path}`,
    `📂 Путь к загруженному файлу: ${
      homework?.homework_stud?.file_path || "Нет ссылки"
    }`,
    `✅ Проверенно: ${
      homework?.homework_stud?.creation_time || "Нет информации"
    }`,
    `🎉 Оценка: ${homework?.homework_stud?.mark || "Нет информации"}`
  );
});
homeworkInfoSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

selectedHomeworkListSubmenu.chooseIntoSubmenu(
  "hwi",
  async (ctx: Scenes.WizardContext) => {
    const homeworks = await getHomeworksByMatch(ctx);

    const homeworksFormatted = homeworks.map((h) => {
      const creationTime = new Date(h.creation_time);
      return `${creationTime.getDate()}.${creationTime.getMonth() + 1}: ${
        h.name_spec
      }`;
    });
    const submenuMap: Record<number, string> = {};
    for (let i = 0; i < homeworksFormatted.length; i++) {
      submenuMap[i] = homeworksFormatted[i];
    }

    return submenuMap;
  },
  homeworkInfoSubmenu,
  { columns: 2 }
);

selectedHomeworkListSubmenu.pagination("hw-pg", {
  getTotalPages: async (ctx) => {
    const hwPerPage = 6;
    const hwCount = (await getHomeworksByMatch(ctx))?.length;
    const currentPage = getSessionValue<number>(ctx, "page") || 1;
    return hwCount >= hwPerPage ? currentPage + 1 : currentPage;
  },
  setPage: (ctx, page) => setSessionValue<number>(ctx, "page", page),
  getCurrentPage: (ctx) => getSessionValue<number>(ctx, "page"),
});

selectedHomeworkListSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const homeworkSubmenu = new MenuTemplate<Scenes.WizardContext>(
  () => "Выберите тип домашнего задания"
);
homeworkSubmenu.chooseIntoSubmenu(
  "hw-opt",
  homeworkStatusList,
  selectedHomeworkListSubmenu,
  { columns: 1 }
);
homeworkSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export default homeworkSubmenu;

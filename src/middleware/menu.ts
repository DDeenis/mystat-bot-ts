import telegraf_inline from "telegraf-inline-menu";
import { Scenes } from "telegraf";
import { deleteUser } from "../database/database.js";
import userStore from "../store/userStore.js";
import allExamsSubmenu from "./submenu/allExams.js";
import futureExamsSubmenu from "./submenu/futureExams.js";
import groupSubmenu from "./submenu/group.js";
import homeworkSubmenu from "./submenu/homework.js";
import botInfoSubmenu from "./submenu/botInfo.js";
import {
  monthScheduleSubmenu,
  scheduleTodaySubmenu,
  scheduleTomorrowSubmenu,
  scheduleWeekSubmenu,
} from "./submenu/schedule.js";

const MenuTemplate = telegraf_inline.MenuTemplate;
const MenuMiddleware = telegraf_inline.MenuMiddleware;

export const menuTemplate = new MenuTemplate<Scenes.WizardContext>(
  () => "Выберите действие"
);

menuTemplate.submenu(
  "🗓Расписание на сегодня",
  "schedule-today",
  scheduleTodaySubmenu
);
menuTemplate.submenu(
  "🗓Расписание на завтра",
  "schedule-tomorrow",
  scheduleTomorrowSubmenu
);
menuTemplate.submenu(
  "📅Расписание на неделю",
  "schedule-week",
  scheduleWeekSubmenu
);
menuTemplate.submenu(
  "📅Расписание на месяц",
  "schedule-month",
  monthScheduleSubmenu
);
menuTemplate.submenu("✉️Домашние задания", "hw", homeworkSubmenu);
menuTemplate.submenu("🕯Будущие экзамены", "future-exams", futureExamsSubmenu);
menuTemplate.submenu("⚰️Все экзамены", "all-exams", allExamsSubmenu);
// menuTemplate.submenu("📄Новости", "news", newsSubmenu);
menuTemplate.submenu("⛏Группа", "grp", groupSubmenu);
// menuTemplate.submenu("🖨Информация о себе", "p-info", personalInfoSubmenu);
menuTemplate.submenu("🤡О боте", "bot-info", botInfoSubmenu);
menuTemplate.interact("🚪Выйти", "logout", {
  do: async (ctx) => {
    const chatId = ctx.chat?.id;

    if (chatId) {
      userStore.remove(chatId);
      await deleteUser(chatId);
      await ctx.reply(
        "Вы вышли из аккаунта. Используйте /login чтобы войти снова."
      );
    }
    return false;
  },
});

export const menuMiddleware = new MenuMiddleware("menu/", menuTemplate);

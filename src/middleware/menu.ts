import telegraf_inline from "telegraf-inline-menu";
import { Context } from "vm";
import { deleteUser } from "../database/database.js";
import { setUserDataToSession } from "../utils.js";
import allExamsSubmenu from "./submenu/allExams.js";
import futureExamsSubmenu from "./submenu/futureExams.js";
import groupSubmenu from "./submenu/group.js";
import homeworkSubmenu from "./submenu/homework.js";
import newsSubmenu from "./submenu/news.js";
import personalInfoSubmenu from "./submenu/personalInfo.js";
import { monthScheduleSubmenu, scheduleTodaySubmenu, scheduleTomorrowSubmenu } from "./submenu/schedule.js";

const MenuTemplate = telegraf_inline.MenuTemplate;
const MenuMiddleware = telegraf_inline.MenuMiddleware;

const menuTemplate = new MenuTemplate<Context>(() => 'Выберите действие');

menuTemplate.submenu('🗓Расписание на сегодня', 'schedule-today', scheduleTodaySubmenu);
menuTemplate.submenu('🗓Расписание на завтра', 'schedule-tomorrow', scheduleTomorrowSubmenu);
menuTemplate.submenu('📅Расписание на месяц', 'schedule-month', monthScheduleSubmenu);
menuTemplate.submenu('✉️Домашние задания', 'hw', homeworkSubmenu);
menuTemplate.submenu('🕯Будущие экзамены', 'future-exams', futureExamsSubmenu);
menuTemplate.submenu('⚰️Все экзамены', 'all-exams', allExamsSubmenu);
menuTemplate.submenu('📄Новости', 'news', newsSubmenu);
menuTemplate.submenu('⛏Группа', 'grp', groupSubmenu);
menuTemplate.submenu('🖨Информация о себе', 'p-info', personalInfoSubmenu);
menuTemplate.interact('🚪Выйти', 'logout', {
    do: async (ctx) => {
        await setUserDataToSession(ctx, { username: '', password: '' });
        await deleteUser(ctx.chat?.id);
        await ctx.reply('Вы вышли из аккаунта. Используйте /login чтобы войти снова.');
        return false;
    }
})

const menuMiddleware = new MenuMiddleware('menu/', menuTemplate);

export default menuMiddleware;
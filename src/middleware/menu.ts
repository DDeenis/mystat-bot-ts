import { MenuMiddleware, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { getUserByChatId } from "../database/database.js";
import { setUserDataToSession } from "../utils.js";
import homeworkSubmenu from "./submenu/homework.js";
import { scheduleTodaySubmenu, scheduleTomorrowSubmenu } from "./submenu/schedule.js";

const menuTemplate = new MenuTemplate<Context>(async (ctx: Context) => {
    const chatId = ctx.chat?.id;

    if (!chatId) {
        return '🚫 Что-то пошло не так.';
    }

    const user = await getUserByChatId(chatId);

    if (user) {
        setUserDataToSession(ctx, user);
    }

    return 'Выберите действие';
});

menuTemplate.submenu('Расписание на сегодня', 'schedule-today', scheduleTodaySubmenu);
menuTemplate.submenu('Расписание на завтра', 'schedule-tomorrow', scheduleTomorrowSubmenu);
menuTemplate.submenu('Домашние задания', 'hw', homeworkSubmenu);

const menuMiddleware = new MenuMiddleware('menu/', menuTemplate);

export default menuMiddleware;
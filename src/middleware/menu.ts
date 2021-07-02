import { MenuMiddleware, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import homeworkSubmenu from "./submenu/homework.js";
import { monthScheduleSubmenu, scheduleTodaySubmenu, scheduleTomorrowSubmenu } from "./submenu/schedule.js";

const menuTemplate = new MenuTemplate<Context>(() => 'Выберите действие');

menuTemplate.submenu('Расписание на сегодня', 'schedule-today', scheduleTodaySubmenu);
menuTemplate.submenu('Расписание на завтра', 'schedule-tomorrow', scheduleTomorrowSubmenu);
menuTemplate.submenu('Расписание на месяц', 'schedule-month', monthScheduleSubmenu);
menuTemplate.submenu('Домашние задания', 'hw', homeworkSubmenu);

const menuMiddleware = new MenuMiddleware('menu/', menuTemplate);

export default menuMiddleware;
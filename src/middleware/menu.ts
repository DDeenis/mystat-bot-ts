import { MenuMiddleware, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import homeworkSubmenu from "./submenu/homework.js";
import { scheduleTomorrowSubmenu } from "./submenu/schedule.js";

const menuTemplate = new MenuTemplate<Context>(() => 'Выберите действие');

menuTemplate.submenu('Расписание на завтра', 'schedule-tomorrow', scheduleTomorrowSubmenu);
menuTemplate.submenu('Домашние задания', 'hw', homeworkSubmenu);

const menuMiddleware = new MenuMiddleware('menu/', menuTemplate);

export default menuMiddleware;
import { Scenes, session, Telegraf } from 'telegraf';
import { UserSession } from './types.js';
import dotenv from "dotenv";
import scenes from './scenes.js';
import loginMiddleware from './middleware/login.js';
import menuMiddleware from './middleware/menu.js';

dotenv.config();

const token = process.env?.BOT_TOKEN;

if (!token) {
    throw new Error('Bot token is not provided');
}

const userSession = new UserSession();
const loginScene = scenes.login;

const stage = new Scenes.Stage<Scenes.WizardContext>([loginScene], { ttl: 360 });
const bot = new Telegraf<Scenes.WizardContext>(token);

bot.use(session());
bot.use(stage.middleware());
bot.use(loginMiddleware);
bot.use(menuMiddleware);

bot.command('login', (ctx) => loginMiddleware.replyToContext(ctx));
bot.command('menu', (ctx) => menuMiddleware.replyToContext(ctx));

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

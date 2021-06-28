import { deunionize, MiddlewareFn, Scenes, session, Telegraf } from 'telegraf';
import { MenuTemplate, MenuMiddleware, deleteMenuFromContext, editMenuOnContext } from "telegraf-inline-menu";
import { UserSession } from './types.js';
import { config } from "dotenv";
import scenes from './scenes.js';
import { Context } from 'vm';

config();

const token = process.env?.BOT_TOKEN;

if (!token) {
    throw new Error('Bot token is not provided');
}

const bot = new Telegraf<Scenes.WizardContext>(token);

const userSession = new UserSession();

const loginScene = scenes.login(userSession);

const stage = new Scenes.Stage<Scenes.WizardContext>([loginScene], { ttl: 360 });

const loginMenuTemplate = new MenuTemplate((ctx: Context) => `Здравствуйте, ${ctx.from.first_name}`);

loginMenuTemplate.interact('Войти в mystat', 'login-btn', {
    do: async (ctx) => {
        ctx.scene.enter('login');

        return false;
    },
});

const loginMiddleware = new MenuMiddleware('login/', loginMenuTemplate);

bot.use(session());
bot.use(stage.middleware());
bot.use(loginMiddleware);

bot.command('login', (ctx) => loginMiddleware.replyToContext(ctx));

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

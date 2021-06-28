import { deunionize, Scenes } from "telegraf";
import { UserSession } from "./types";
import { authUser} from "mystat-api"

const loginScene = (userSession: UserSession) => {
    return new Scenes.WizardScene<Scenes.WizardContext>(
        'login',
        async (ctx) => {
            await ctx.reply('📲 Отправьте свой логин от mystat');
            return ctx.wizard.next();
        },
        async (ctx) => {
            const username = deunionize(ctx.message)?.text;

            if (!username) {
                return await ctx.reply('Логин должен быть текстом');
            }

            userSession.username = username;

            await ctx.reply('🔑 Теперь оправьте свой пароль от mystat');

            return ctx.wizard.next();
        },
        async (ctx) => {
            const password = deunionize(ctx.message)?.text;

            if (!password) {
                return await ctx.reply('Пароль должен быть текстом');
            }

            userSession.password = password;

            ctx.reply('🔍 Обработка информации');

            const authData = await authUser(userSession.username, userSession.password);
            const isAuth = (await authData).success;
            
            if (!isAuth) {
                return await ctx.reply('🔒 При входе возникла ошибка. Проверьте логин и пароль.');
            }

            await ctx.reply('🔓 Вход успешно выполнен');
            return await ctx.scene.leave();
        }
    );
}

export default {
    login: loginScene
}
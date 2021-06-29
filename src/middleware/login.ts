import { MenuMiddleware, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";

const loginMenuTemplate = new MenuTemplate((ctx: Context) => `Здравствуйте, ${ctx.from.first_name}`);

loginMenuTemplate.interact('Войти в mystat', 'login-btn', {
    do: async (ctx) => {
        ctx.scene.enter('login');

        return false;
    },
});

const loginMiddleware = new MenuMiddleware('login/', loginMenuTemplate);

export default loginMiddleware;
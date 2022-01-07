import { Scenes } from "telegraf";
import telegraf_inline from "telegraf-inline-menu";

const MenuTemplate = telegraf_inline.MenuTemplate;
const MenuMiddleware = telegraf_inline.MenuMiddleware;

const loginMenuTemplate = new MenuTemplate<Scenes.WizardContext>(
  (ctx) => `Здравствуйте, ${ctx.from?.first_name}`
);

loginMenuTemplate.interact("Войти в mystat", "login-btn", {
  do: async (ctx) => {
    await ctx.scene.enter("login");

    return false;
  },
});

const loginMiddleware = new MenuMiddleware("login/", loginMenuTemplate);

export default loginMiddleware;

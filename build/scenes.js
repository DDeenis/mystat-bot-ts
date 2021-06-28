var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { deunionize, Scenes } from "telegraf";
import { authUser } from "mystat-api";
const loginScene = (userSession) => {
    return new Scenes.WizardScene('login', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.reply('📲 Отправьте свой логин от mystat');
        return ctx.wizard.next();
    }), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const username = (_a = deunionize(ctx.message)) === null || _a === void 0 ? void 0 : _a.text;
        if (!username) {
            return yield ctx.reply('Логин должен быть текстом');
        }
        userSession.username = username;
        yield ctx.reply('🔑 Теперь оправьте свой пароль от mystat');
        return ctx.wizard.next();
    }), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const password = (_b = deunionize(ctx.message)) === null || _b === void 0 ? void 0 : _b.text;
        if (!password) {
            return yield ctx.reply('Пароль должен быть текстом');
        }
        userSession.password = password;
        ctx.reply('🔍 Обработка информации');
        const authData = yield authUser(userSession.username, userSession.password);
        const isAuth = (yield authData).success;
        if (!isAuth) {
            return yield ctx.reply('🔒 При входе возникла ошибка. Проверьте логин и пароль.');
        }
        yield ctx.reply('🔓 Вход успешно выполнен');
        return yield ctx.scene.leave();
    }));
};
export default {
    login: loginScene
};

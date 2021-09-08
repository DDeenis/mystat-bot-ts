import { getProfileInfo, getUserSettings } from "mystat-api";
import telegraf_inline from "telegraf-inline-menu";
const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;
import { Context } from "vm";
import { formatMessage, getUserDataFromSession } from "../../utils.js";

const personalInfoSubmenu = new MenuTemplate<Context>(async (ctx) => {
    const info = await getProfileInfo(getUserDataFromSession(ctx));
    const settings = await getUserSettings(getUserDataFromSession(ctx));

    if (!info.success || !settings.success) {
        return '🚫 При получении информации о профиле возникла ошибка: ' + (info.error ? info.error : settings.error);
    }

    const i = info.data as any;
    const s = settings.data as any;

    const infoFromatted = formatMessage(
        `📝 ФИО: ${i.full_name}`,
        `🧭 Группа: ${i.group_name}`,
        `🖥 Поток: ${i.stream_name}`,
        `🔍 Фото: <a href="${i.photo}">фото</a>`,
        `💰 Количество монет: ${i.gaming_points[1].points}`,
        `💎 Количество кристаллов: ${i.gaming_points[0].points}`,
        `📈 Всего поинтов: ${i.gaming_points[0].points + i.gaming_points[1].points}`,
        `💡 Количество достижений: ${i.achieves_count}`,
        `⚙️ Уровень профиля: ${i.level}`,
        `📡 Почта для входа в Azure: ${s.azure_login}`,
        `🪓 Почта: ${s.email}`,
        `📱 Телефон: ${s.phones[0].phone_number}`
    );

    return {
        text: infoFromatted,
        parse_mode: 'HTML'
    };
});
personalInfoSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));
export default personalInfoSubmenu;
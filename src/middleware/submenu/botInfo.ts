import { Scenes } from "telegraf";
import telegraf_inline from "telegraf-inline-menu";
import { formatMessage } from "../../utils.js";

const tgUsernames = ["@ddeenis", "@BeloMaximka"];

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const botInfoSubmenu = new MenuTemplate<Scenes.WizardContext>(async () => {
  const infoFromatted = formatMessage(
    "Бот создан для легкого доступа к расписанию и другим функциям mystat из телеграма. Код бота открытый, если вы не доверяете конкретно этому боту, можете скачать код с github и захостить своего бота.",
    "",
    "Github: https://github.com/DDeenis/mystat-bot-ts",
    `По вопросам писать ${tgUsernames.join(" или ")}`
  );

  return {
    text: infoFromatted,
  };
});

botInfoSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));
export default botInfoSubmenu;

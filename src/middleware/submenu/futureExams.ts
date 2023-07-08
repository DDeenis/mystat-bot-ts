import telegraf_inline from "telegraf-inline-menu";
import { Scenes } from "telegraf";
import userStore from "../../store/userStore.js";
import { formatMessage } from "../../utils.js";
import { getErrorMessage } from "../../helpers/logger.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const futureExamsSubmenu = new MenuTemplate<Scenes.WizardContext>(
  async (ctx) => {
    const futureExams = await userStore.get(ctx.chat?.id)?.getFutureExams();

    if (!futureExams) {
      return getErrorMessage();
    } else if (futureExams.length === 0) {
      return "🎉 У вас нет назначеных экзаменов";
    }

    let futureExamsFormatted = "";

    for (const exam of futureExams) {
      futureExamsFormatted += formatMessage(
        `✏️ Предмет: ${exam?.spec}`,
        `⏰ Дата: ${exam?.date}`
      );
    }

    return ["Будущие экзамены", futureExamsFormatted].join("\n");
  }
);
futureExamsSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export default futureExamsSubmenu;

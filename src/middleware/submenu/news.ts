import telegraf_inline from "telegraf-inline-menu";
import TurndownService from "turndown";
import { Scenes } from "telegraf";
import userStore from "../../store/userStore.js";
import {
  cropString,
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;
const htmlConverter = new TurndownService();

const newsField = "news";
const formatNews = (n: string): string => cropString(n, 20);

const getNewsList = async (ctx: Scenes.WizardContext): Promise<string[]> => {
  const news = await userStore.get(ctx.chat?.id)?.getNews();

  if (!news || !news.success) {
    console.log(news?.error);
    return [];
  }

  setSessionValue<any[]>(ctx, newsField, news.data);

  return news.data.map((n: any) => formatNews(n.theme));
};

const newsEntrySubmenu = new MenuTemplate<any>(async (ctx) => {
  const match = ctx.match[1];
  const newsList = getSessionValue<any[]>(ctx, newsField);

  const newsEntry = newsList.find((n) => formatNews(n.theme) === match);
  const newsEntryDetails = await userStore
    .get(ctx.chat?.id)
    ?.getNewsDetails(newsEntry.id_bbs);

  if (!newsEntry || !newsEntryDetails || !newsEntryDetails.success) {
    return (
      "🚫 При получении новостей возникла ошибка: " + newsEntryDetails?.error
    );
  }

  const body: string = (newsEntryDetails.data as any)?.text_bbs;
  const convertedBody = htmlConverter.turndown(body);
  const newsEntryFormatted = formatMessage(
    `✏️ Тема: ${newsEntry?.theme}`,
    `📅 Дата: ${newsEntry?.time}`,
    convertedBody
  );

  return {
    text: newsEntryFormatted,
    parse_mode: "Markdown",
  };
});
newsEntrySubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

const newsSubmenu = new MenuTemplate<Scenes.WizardContext>(() => "Новости");
newsSubmenu.chooseIntoSubmenu(
  "news-list",
  async (ctx) => await getNewsList(ctx),
  newsEntrySubmenu,
  {
    columns: 2,
  }
);
newsSubmenu.manualRow(createBackMainMenuButtons("⬅️ Назад"));

export default newsSubmenu;

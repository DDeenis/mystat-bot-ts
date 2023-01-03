import telegraf_inline from "telegraf-inline-menu";
import { Scenes } from "telegraf";
import userStore from "../../store/userStore.js";
import {
  cropString,
  formatMessage,
  getSessionValue,
  setSessionValue,
} from "../../utils.js";
import { convert } from "html-to-text";
import { MystatNewsEntry } from "mystat-api/dist/types.js";

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;

const newsField = "news";
const formatNews = (n: string): string => cropString(n, 20);

const getNewsList = async (ctx: Scenes.WizardContext): Promise<string[]> => {
  const news = await userStore.get(ctx.chat?.id)?.getNews();

  if (!news || !news.success) {
    console.log(news?.error);
    return [];
  }

  setSessionValue<MystatNewsEntry[]>(ctx, newsField, news.data);

  return news.data.map((n) => formatNews(n.theme));
};

const newsEntrySubmenu = new MenuTemplate<any>(async (ctx) => {
  const match = ctx.match[1];
  const newsList = getSessionValue<MystatNewsEntry[]>(ctx, newsField);

  const newsEntry = newsList.find((n) => formatNews(n.theme) === match);

  if (!newsEntry) {
    return "🚫 При получении новостей возникла ошибка: " + "Not found";
  }

  const newsEntryDetails = await userStore
    .get(ctx.chat?.id)
    ?.getNewsDetails(newsEntry.id_bbs);

  if (!newsEntryDetails || !newsEntryDetails.success) {
    return (
      "🚫 При получении новостей возникла ошибка: " + newsEntryDetails?.error
    );
  }

  const body: string = newsEntryDetails.data?.text_bbs;
  let convertedBody = convert(body)
    .split("\n")
    .filter((val) => Boolean(val))
    .join("\n\n");

  const possibleEncryptedImgStart = convertedBody.indexOf("[data:image");

  if (possibleEncryptedImgStart !== -1) {
    convertedBody = convertedBody.substring(0, possibleEncryptedImgStart);
  }

  const newsEntryFormatted = formatMessage(
    `✏️ Тема: ${newsEntry?.theme}`,
    `📅 Дата: ${newsEntry?.time}`,
    convertedBody
      .split("\n")
      .filter((val) => Boolean(val))
      .join("\n\n")
  );

  return {
    text: newsEntryFormatted,
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

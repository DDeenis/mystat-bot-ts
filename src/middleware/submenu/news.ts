import {getNews, getNewsDetails} from 'mystat-api';
import telegraf_inline from 'telegraf-inline-menu';
import TurndownService from 'turndown';
import {Context} from 'vm';
import {cropString, formatMessage, getSessionValue, getUserDataFromSession, setSessionValue} from '../../utils.js';

const createBackMainMenuButtons = telegraf_inline.createBackMainMenuButtons;
const MenuTemplate = telegraf_inline.MenuTemplate;
const htmlConverter = new TurndownService();

const newsField = 'news';
const formatNews = (n: string): string => cropString(n, 20);

const getNewsList = async (ctx: Context): Promise<string[]> => {
  const news = await getNews(getUserDataFromSession(ctx));

  if (!news.success) {
    console.log(news.error);
    return [];
  }

  setSessionValue<any[]>(ctx, newsField, news.data);

  return news.data.map((n) => formatNews(n.theme));
};

const newsEntrySubmenu = new MenuTemplate<Context>(async (ctx: Context) => {
  const match = ctx.match[1];
  const newsList = getSessionValue<any[]>(ctx, newsField);

  const newsEntry = newsList.find((n) => formatNews(n.theme) === match);
  const newsEntryDetails = await getNewsDetails(getUserDataFromSession(ctx), newsEntry.id_bbs);

  if (!newsEntry || !newsEntryDetails.success) {
    return '🚫 При получении новостей возникла ошибка: ' + newsEntryDetails.error;
  }

  const convertedBody = htmlConverter.turndown((newsEntryDetails.data as any)?.text_bbs);
  const newsEntryFormatted = formatMessage(
    `✏️ Тема: ${newsEntry?.theme}`,
    `📅 Дата: ${newsEntry?.time}`,
    convertedBody,
  );

  return {
    text: newsEntryFormatted,
    parse_mode: 'Markdown',
  };
});
newsEntrySubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const newsSubmenu = new MenuTemplate<Context>(() => 'Новости');
newsSubmenu.chooseIntoSubmenu('news-list', async (ctx: Context) => await getNewsList(ctx), newsEntrySubmenu, {
  columns: 2,
});
newsSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default newsSubmenu;

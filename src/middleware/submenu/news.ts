import { getNews, getNewsDetails } from "mystat-api";
import { createBackMainMenuButtons, MenuTemplate } from "telegraf-inline-menu";
import { Context } from "vm";
import { cropString, formatMessage, getSessionValue, getUserDataFromSession, setSessionValue } from "../../utils.js";

const newsField = 'news';
const formatNews = (n: string): string => cropString(n, 20);
const removeHTMLFromNews = (body: string): string => {
    return body
        .replace(/<[^>]*>?/gm, '\n')
        .replace(/(\n\n\n\n)/gm, '\n\n')
        .replace(/(\n\n\n)/gm, '\n\n')
        .replace(/(\n\n)/gm, '\n');
}

const getNewsList = async (ctx: Context): Promise<string[]> => {
    const news = await getNews(getUserDataFromSession(ctx));

    if (!news.success) {
        console.log(news.error);
        return [];
    }

    setSessionValue<any[]>(ctx, newsField, news.data);

    return news.data.map(n => formatNews(n.theme));
}

const newsEntrySubmenu = new MenuTemplate<Context>(async (ctx: Context) => {
    const match = ctx.match[1];
    const newsList = getSessionValue<any[]>(ctx, newsField);

    const newsEntry = newsList.find(n => formatNews(n.theme) === match);
    const newsEntryDetails = await getNewsDetails(getUserDataFromSession(ctx), newsEntry.id_bbs);

    if (!newsEntry || !newsEntryDetails.success) {
        return '🚫 При получении новостей возникла ошибка';
    }

    const newsEntryFormatted = formatMessage(
        `✏️ Тема: ${newsEntry?.theme}\n`,
        `📅 Дата: ${newsEntry?.time}\n`,
        removeHTMLFromNews((newsEntryDetails.data as any)?.text_bbs)
    );

    return newsEntryFormatted;
});
newsEntrySubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

const newsSubmenu = new MenuTemplate<Context>(() => 'Новости');
newsSubmenu.chooseIntoSubmenu('news-list', async (ctx: Context) => await getNewsList(ctx), newsEntrySubmenu, { columns: 2 });
newsSubmenu.manualRow(createBackMainMenuButtons('⬅️ Назад'));

export default newsSubmenu;
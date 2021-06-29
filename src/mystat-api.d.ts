declare module 'mystat-api' {
    import('./types');
    import { IUserData, MystatResponse, HomeworkStatus } from './types';

    function authUser(username: string, password: string): MystatResponse;
    function getMonthSchedule(userData: IUserData, date: Date): MystatResponse;
    function getScheduleByDate(userData: IUserData, date: Date): MystatResponse;
    function getReviews(userData: IUserData): MystatResponse;
    function getVisits(userData: IUserData): MystatResponse;
    function getAttendance(userData: IUserData): MystatResponse;
    function getHomeworkList(userData: IUserData, homeworkStatus?: HomeworkStatus, page?: number, type?: 0 | 1): MystatResponse;
    function getNews(userData: IUserData): MystatResponse;
    function getNewsDetails(userData: IUserData, newsId: number): MystatResponse;
    function getExams(userData: IUserData): MystatResponse;
    function getFutureExams(userData: IUserData): MystatResponse;
    function getStreamLeaders(userData: IUserData): MystatResponse;
    function getGroupLeaders(userData: IUserData): MystatResponse;
    function getActivity(userData: IUserData): MystatResponse;
    function getProfileInfo(userData: IUserData): MystatResponse;
    function getUserSettings(userData: IUserData): MystatResponse;
}
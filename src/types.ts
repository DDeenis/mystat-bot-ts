export interface IUserData {
    username: string;
    password: string;
}

export interface MystatResponse {
    success: boolean;
    error: string | null;
    data: any[];
}

export enum HomeworkStatus {
    Overdue,
    Checked,
    Uploaded,
    Active,
    Deleted = 5
}

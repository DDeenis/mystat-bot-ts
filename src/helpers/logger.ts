export class ConsoleLogger {
  prefix?: string;

  constructor(prefix?: string) {
    this.prefix = prefix;
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  formatMessage(logLevel: string, message: string) {
    const parts = [logLevel, message];

    if (this.prefix) parts.splice(0, 0, this.prefix);

    return parts.join(" ");
  }

  log(message: string) {
    console.log(this.formatMessage("[INFO]", message));
  }

  warning(message: string) {
    console.warn(this.formatMessage("[WARNING]", message));
  }

  error(message: string) {
    console.error(this.formatMessage("[ERROR]", message));
  }
}

export const getErrorMessage = (error?: string | null) =>
  `🚫 При выполнении действия возникла ошибка: ${
    error ?? "Unknown error"
  }\nСвяжитесь с разработчиками через пункт 'О боте'`;

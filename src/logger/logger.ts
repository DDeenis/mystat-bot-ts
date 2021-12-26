class ConsoleLogger {
  log(message: string) {
    console.log(message);
  }

  warning(message: string) {
    console.warn("[WARNING] " + message);
  }

  error(message?: string) {
    console.error("[ERROR] " + message);
  }
}

export const logger = new ConsoleLogger();

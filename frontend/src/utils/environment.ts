// Environment configuration utility
interface EnvironmentConfig {
    apiBaseUrl: string
    appTitle: string
    appVersion: string
    debug: boolean
    socketUrl: string
    logLevel: 'debug' | 'info' | 'warn' | 'error'
}

class Environment {
    private static _config: EnvironmentConfig | null = null

    static get config(): EnvironmentConfig {
        if (!this._config) {
            this._config = {
                apiBaseUrl: import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3334',
                appTitle: import.meta.env.VITE_APP_TITLE || 'Docker Web Desktop',
                appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
                debug: import.meta.env.VITE_DEBUG === 'true',
                socketUrl: import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3334',
                logLevel: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info'
            }
        }
        return this._config
    }

    static get isDevelopment(): boolean {
        return import.meta.env.DEV
    }

    static get isProduction(): boolean {
        return import.meta.env.PROD
    }

    static get mode(): string {
        return import.meta.env.MODE
    }

    static log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 }
        const configLevel = levels[this.config.logLevel]
        const messageLevel = levels[level]

        if (messageLevel >= configLevel) {
            console[level](`[${this.config.appTitle}] ${message}`, ...args)
        }
    }

    static debug(message: string, ...args: any[]): void {
        this.log('debug', message, ...args)
    }

    static info(message: string, ...args: any[]): void {
        this.log('info', message, ...args)
    }

    static warn(message: string, ...args: any[]): void {
        this.log('warn', message, ...args)
    }

    static error(message: string, ...args: any[]): void {
        this.log('error', message, ...args)
    }
}

export default Environment
export type { EnvironmentConfig }
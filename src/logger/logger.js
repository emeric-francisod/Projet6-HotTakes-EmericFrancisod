import winston from 'winston';
import 'winston-daily-rotate-file';
import ConfigManager, { defaultConfigManager } from '../config/ConfigManager.js';
import process, { exit } from 'node:process';
import morgan from 'morgan';
import { validateStringArgument } from '../utils/utils-functions.js';

/* Creates Winston options object */
const winstonOptions = { exitOnError: true };

/*
    Defines the format to use for logging.

    printfFormat:
        Formats the message to print.
        Displays the level and the date.
        If the stack property is defined, then it is used as a message, otherwise user the message property.
*/
function printfFormat({ level, message, timestamp, label, stack, splat, ...metadata }) {
    let formatedMessage = `${level}\t${timestamp}\t\t`;

    if (!stack) {
        formatedMessage += label ? `[${label}] ` : '';
        formatedMessage += message;
    } else {
        formatedMessage += label ? `[${label}] ` : '[Error]';
        formatedMessage += ' ' + stack;
    }

    if (metadata && Object.keys(metadata).length > 0) {
        formatedMessage += ' ' + JSON.stringify(metadata);
    }
    return formatedMessage;
}

let format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(printfFormat),
    winston.format.splat()
);

winstonOptions.format = format;

/*
    Create transports. Depending on the environment, the transports will be different:
        In testing, it will be done in files in the test folder.
        In production, it will be done in files.
        In development, it will be done in the console.
*/
let loggerTransports = [];
const commonDailyRotateFileTransportsParameters = {
    datePattern: 'YYYY-MM-DD',
    extension: '.log',
    maxSize: '20m',
};

if (ConfigManager.compareEnvironment('test')) {
    loggerTransports.push(
        new winston.transports.DailyRotateFile({
            ...commonDailyRotateFileTransportsParameters,
            filename: 'test-log-%DATE%',
            dirname: './test/temp/logs',
            maxFiles: '1',
        })
    );
} else if (ConfigManager.compareEnvironment('development')) {
    loggerTransports.push(
        new winston.transports.Console({
            format: winston.format.combine(format, winston.format.colorize({ all: true })),
        })
    );
} else {
    loggerTransports.push(
        new winston.transports.DailyRotateFile({
            ...commonDailyRotateFileTransportsParameters,
            filename: 'log-%DATE%',
            dirname: './logs',
            zippedArchive: true,
        })
    );
}

winstonOptions.transports = loggerTransports;

/* Defines the logging levels, max logging level and colors. */
let levels;
let colors;
let level;
let levelsError;

try {
    levels = defaultConfigManager.getConfig('logging.levels.levelsValues');
    winstonOptions.levels = levels;

    colors = defaultConfigManager.getConfig('logging.levels.levelsColors');
    winston.addColors(colors);

    if (ConfigManager.compareEnvironment('development')) {
        level = 'debug';
    } else if (ConfigManager.compareEnvironment('test')) {
        level = 'error';
    } else {
        level = defaultConfigManager.getConfig('logging.levels.maxLevel');
    }
    winstonOptions.level = level;
} catch (error) {
    // Errors will be logged after the logger is created.
    // If the values are not set, Winston will user the default ones.
    levelsError = error;
}

/* Creates the logger. */
const Logger = winston.createLogger(winstonOptions);
export default Logger;

/**
 * Returns logging function.
 * The returned function logs the message with a debug level and the given namespace as a label. It takes the info object to log as a parameter.
 * @param {string} namespace - Namespace to use as a label, allowing the grouping of logging messages.
 * @returns {Function} Returns the logging function.
 */
export function createDebugNamespace(namespace) {
    return (info) => {
        let labelledInfo = { label: namespace };

        if (validateStringArgument(info)) {
            labelledInfo.message = info;
        } else {
            Object.assign(labelledInfo, info);
        }

        Logger.debug(labelledInfo);
    };
}

/* Morgan logger configuration */
const stream = {
    write: (message) => Logger.http({ message, label: 'HTTP' }),
};
export const morganMiddleware = morgan('dev', { stream });

/*
    Handles uncaught exceptions and unhandled rejections. Prints those exceptions and exit the program.
*/
process.on('uncaughtException', (error, origin) => {
    Logger.fatal(error);
    exit(1);
});

/* Log printing */
const loggerDebug = createDebugNamespace('hottakes:logger');

loggerDebug('Loggers created');

if (levelsError) {
    Logger.error(levelsError);
}

if (!levels) {
    Logger.warn("Couldn't set custom loggin levels. Default values will be used.");
} else {
    loggerDebug({ message: 'Custom logging levels: %o', splat: [levels] });
}

if (!colors) {
    Logger.warn("Couldn't set custom colors. Default colors will be used");
} else {
    loggerDebug({ message: 'Custom logging colors: %o', splat: [colors] });
}

if (!level) {
    Logger.warn("Couldn't set the maximum level to log. Default one will be used");
} else {
    loggerDebug({ message: 'Maximum level to log : "%s"', splat: [level] });
}

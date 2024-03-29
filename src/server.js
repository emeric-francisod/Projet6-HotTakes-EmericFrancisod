import Logger, { createDebugNamespace } from './logger/logger.js';
import http from 'node:http';
import app from './app.js';
import { normalizePort, getConnectionInformations, errorHandler } from './utils/utils-server.js';
import ConfigManager from './config/ConfigManager.js';

const serverDebug = createDebugNamespace('hottakes:server');

// Get the port
let port;
try {
    port = normalizePort(ConfigManager.getEnvVariable('PORT'));
    serverDebug(`Use port ${port}.`);
} catch (error) {
    port = normalizePort('3000');
    Logger.error(error);
    Logger.warn(`The port can't be normalized. Use defaut port ${port} instead`);
}

app.set('port', port);

// Create the server
const server = http.createServer(app);
serverDebug('HTTP server created');

// Add event listeners
server.on('error', errorHandler);
server.on('listening', () => {
    const connectionInformations = getConnectionInformations(server, port);
    Logger.info(`Server listening on ${connectionInformations}`);
});

// Launch the server
serverDebug('Launch server');
server.listen(port);

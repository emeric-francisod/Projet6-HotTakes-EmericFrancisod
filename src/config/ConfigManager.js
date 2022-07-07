/**
 * Manages server configuration.
 * Allows for easy access to configuration settings, as well as all environment variable.
 * Custom environment variables should be inserted in the CLI, or included with dotenv using preloading.
 */
export default class ConfigManager {
    /**
     * Stores configuration settings.
     * @private
     * @member {Object}
     */
    #configurationSettings = {};

    /**
     * Initialises the configurationSettings and the environment property.
     * @param {Object} [config={}] - Configuration object. Default to empty object if no configuration object is used.
     */
    constructor(config = {}) {
        if (config) {
            this.#configurationSettings = config;
        }
    }

    /**
     * Compare the givent environment with the current environment.
     * @param {string} environment - The environment name to test.
     * @return {boolean} Returns true if the given environment is the current environment, and false otherwise.
     * @static
     */
    static compareEnvironment(environment) {
        if (typeof environment !== 'string' && !(environment instanceof String)) {
            throw { message: 'Configuration access error: the environment name must be a valid string.' };
        }

        if (environment === process.env.NODE_ENV || (!process.env.NODE_ENV && environment === 'development')) {
            return true;
        }

        return false;
    }

    /**
     * Static method to return the value of an environment variable.
     * @param {string} variableName - Name of the environment variable. It is case insensitive.
     * @returns Returns the value of the environment variable.
     * @throws Throws an error if the variable name isn't a valid string or if the environment variable doesn't exist.
     * @static
     */
    static getEnvVariable(variableName) {
        //Throw an error if the setting path is not a string
        if (typeof variableName !== 'string' && !(variableName instanceof String)) {
            throw { message: 'Configuration access error: the variable name must be a valid string.' };
        }

        //Return the environment variable if there is one
        if (process.env[variableName]) {
            return process.env[variableName];
        }

        throw { message: `Configuration access error: the environment variable ${variableName} doesn't exist` };
    }

    /**
     * Non static version of the ConfigManager.getEnvVariable method.
     * @see ConfigManager.getEnvVariable
     */
    getEnvVariable(variableName) {
        return ConfigManager.getEnvVariable(variableName);
    }

    /**
     * Returns the fetched configuration setting.
     * @param {string} [setting=''] - Setting path. It should follow the JavaScript notation. If the property is nested inside others, the path should look like 'ancestor.parent.property'. If one propety is an element of an array, the path should be 'parent[i]' where i is the index in the array. An empty string is equivalent to the root of the settings and returns the entire configurationSettings property.
     * @returns Returns the value of the setting. If the setting is an array, returns the array. If the settings contains other settings, return an object containing all the settings.
     * @throws {Object} Throws an error if the setting path is invalid or if the setting doesn't exists.
     */
    getConfig(setting = '') {
        //Throw an error if the setting path is not a string
        if (typeof setting !== 'string' && !(setting instanceof String)) {
            throw { message: 'Configuration access error: the setting name must be a valid string.' };
        }

        //Return all the settings if the value is an empty string
        if (setting === '') {
            return this.#configurationSettings;
        }

        //Parse the setting path and return the setting, or an error.
        const settingPath = setting.split('.');
        let currentSetting = this.#configurationSettings;

        for (let settingPathNode of settingPath) {
            let settingNodeDetails = settingPathNode.split('[');

            if (!currentSetting[settingNodeDetails[0]]) {
                throw {
                    message: `Configuration access error: the setting or environment variable ${setting} doesn't exist.`,
                };
            }

            currentSetting = currentSetting[settingNodeDetails[0]];

            if (settingNodeDetails[1]) {
                let settingIndex = parseInt(settingNodeDetails[1], 10);
                if (isNaN(settingIndex)) {
                    throw {
                        message: `Configuration access error: the index of the setting node ${settingNodeDetails[0]} must be a valid number.`,
                    };
                }
                currentSetting = currentSetting[settingIndex];
            }
        }

        return currentSetting;
    }
}

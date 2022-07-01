import { validationResult } from 'express-validator';
import { errorFormatter } from '../utils/utils-validation.js';

/**
 * Field validation middleware.
 * This middleware must be used after the express-validator middleware. It handles the errors generated by the validation.
 * If no error is generated, then the next middleware is called, otherwise a response with status 400 is sent.
 * @param {Express.Request} req - Express request object.
 * @param {Express.Response} res - Express response object.
 * @param next - Next middleware to execute.
 */
export const validateFields = (req, res, next) => {
    try {
        validationResult(req).throw();
        next();
    } catch (error) {
        res.status(400).json({ error: error.formatWith(errorFormatter).array() });
    }
};

import express from 'express';
import { body } from 'express-validator';
import { createSauce } from '../controllers/sauce-controller.js';
import { validateFields } from '../middlewares/field-validation.js';
import { bodyJsonParse } from '../middlewares/body-json-parse.js';
import { checkAuthentication, checkOwnership } from '../middlewares/authentication.js';
import multer from '../middlewares/multer.js';
import { multerCheckFileExists } from '../middlewares/multer.js';

const router = express.Router();

/**
 * Creates a sauce.
 * Checks that the user is authenticated.
 * Use the multer middleware to parse the request body and save the image.
 * Parses the body to JSON.
 * Validates and sanitize data:
 *      name is required and is a string,
 *      manufacturer is required and is a string,
 *      description is required and is a string,
 *      mainPepper is required and is a string
 *      heat is required and is a number between 1 and 10
 * Uses the createSauce controller.
 */
router.post(
    '/',
    checkAuthentication,
    multer,
    multerCheckFileExists,
    bodyJsonParse('sauce'),
    body('sauce.name')
        .exists({ checkNull: true })
        .withMessage("The sauce's name is required")
        .bail()
        .isString()
        .withMessage("The sauce's name should be a string")
        .bail()
        .escape(),
    body('sauce.manufacturer')
        .exists({ checkNull: true })
        .withMessage("The sauce's manufacturer is required")
        .bail()
        .isString()
        .withMessage("The sauce's manufacturer should be a string")
        .bail()
        .escape(),
    body('sauce.description')
        .exists({ checkNull: true })
        .withMessage("The sauce's description is required")
        .bail()
        .isString()
        .withMessage("The sauce's description should be a string")
        .bail()
        .escape(),
    body('sauce.mainPepper')
        .exists({ checkNull: true })
        .withMessage("The sauce's main pepper is required")
        .bail()
        .isString()
        .withMessage("The sauce's main pepper should be a string")
        .bail()
        .escape(),
    body('sauce.heat')
        .exists({ checkNull: true })
        .withMessage("The sauce's heat is required")
        .bail()
        .isInt({ min: 1, max: 10 })
        .withMessage("The sauce's heat should be a number between 1 and 10")
        .bail()
        .toInt(),
    validateFields,
    createSauce
);

export default router;
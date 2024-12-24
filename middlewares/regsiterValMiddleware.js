// backend/middlewares/registerValMiddleware.js

const { z } = require('zod');
const registerSchema = require('../validations/registrationFormValidation');

/**
 * Middleware to validate registration data using Zod schema.
 * It also transforms specific fields to match the backend model.
 * 
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 * @returns {Function} - Express middleware function.
 */
const registerValidate = (schema) => async (req, res, next) => {
    try {
        console.log("Original Request Body:", req.body);

        // === 1. Transform 'sibling_studying' from string to boolean ===
        if (typeof req.body.sibling_studying === 'string') {
            req.body.sibling_studying = req.body.sibling_studying.toLowerCase() === 'true';
        }

        // === 2. Transform 'dob_*' fields into a 'dob' object ===
        const { dob_day, dob_month, dob_year, dob_in_words } = req.body;
        if (dob_day && dob_month && dob_year && dob_in_words) {
            req.body.dob = {
                day: dob_day,
                month: dob_month,
                year: dob_year,
                in_words: dob_in_words
            };
        }

        // === 3. Transform 'sibling_*' fields into 'sibling_details' object ===
        const { sibling, sibling_name, sibling_class } = req.body;
        if (sibling === 'yes' && sibling_name && sibling_class) {
            req.body.sibling_details = {
                name: sibling_name,
                class: sibling_class
            };
        }

        // === 4. Rename 'last_school_attended' to 'school_last_attended' ===
        if (req.body.last_school_attended) {
            req.body.school_last_attended = req.body.last_school_attended;
        }
        delete req.body.last_school_attended;

        // === 5. Remove the now unused fields ===
        delete req.body.dob_day;
        delete req.body.dob_month;
        delete req.body.dob_year;
        delete req.body.dob_in_words;
        delete req.body.sibling;
        delete req.body.sibling_name;
        delete req.body.sibling_class;
        // Remove 'username' field entirely if present
        if ('username' in req.body) {
            delete req.body.username;
        }

        console.log("Transformed Request Body:", req.body);

        // === 6. Perform validation using Zod schema ===
        const validatedData = await schema.parseAsync(req.body);

        // === 7. Attach validated data to request object ===
        req.body = validatedData;

        // Proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error("Zod Validation Error:", error);
        if (error instanceof z.ZodError) {
            // Format Zod errors for better readability
            const formattedErrors = error.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation Error',
                errors: formattedErrors,
            });
        } else {
            // Handle unexpected errors
            return res.status(500).json({
                statusCode: 500,
                message: 'An unexpected error occurred during validation',
            });
        }
    }
}

module.exports = registerValidate;

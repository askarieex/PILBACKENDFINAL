const { z } = require('zod');

const loginValidate = (schema) => async (req, res, next) => {
    try {
        // Validate the request body using the Zod schema
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next(); // Continue to the next middleware or route handler if validation passes

    } catch (error) {
        // If validation fails, pass the error to the centralized error handler
        if (error instanceof z.ZodError) {
            return next({
                statusCode: 400,
                message: 'Validation Error',
                errors: error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        } else {
            return next({
                statusCode: 500,
                message: 'An unexpected error occurred during validation',
            });
        }
    }
}

module.exports = loginValidate

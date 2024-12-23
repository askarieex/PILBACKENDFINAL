const { z } = require('zod');

const regsiterValidate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (error) {
        console.error("Zod Validation Error:", error);
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

module.exports = regsiterValidate;

/**
 * [VITAM OS] Zero-Failure Schema Validator
 * Ensures incoming request bodies match institutional standards before hitting controllers.
 */
module.exports = (schema) => (req, res, next) => {
    const errors = [];
    for (const [key, rules] of Object.entries(schema)) {
        const value = req.body[key];
        
        if (rules.required && (value === undefined || value === null || value === "")) {
            errors.push(`${key} is required.`);
        }
        
        if (value !== undefined && value !== null && value !== "") {
            if (rules.type && typeof value !== rules.type) {
                if (rules.type === "number" && !isNaN(Number(value))) {
                    // allow string numbers if they're valid
                } else {
                    errors.push(`${key} must be a ${rules.type}.`);
                }
            }
            if (rules.min !== undefined) {
                if (typeof value === "string" && value.length < rules.min) {
                    errors.push(`${key} must be at least ${rules.min} characters.`);
                } else if (typeof value === "number" && value < rules.min) {
                    errors.push(`${key} must be at least ${rules.min}.`);
                }
            }
            if (rules.max !== undefined) {
                if (typeof value === "string" && value.length > rules.max) {
                    errors.push(`${key} must be at most ${rules.max} characters.`);
                } else if (typeof value === "number" && value > rules.max) {
                    errors.push(`${key} must be at most ${rules.max}.`);
                }
            }
            if (rules.regex && !rules.regex.test(String(value))) {
                errors.push(`${key} format is invalid.`);
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            code: "VALIDATION_ERROR",
            msg: "Institutional data integrity check failed.",
            errors,
            requestId: req.id
        });
    }

    next();
};

import { validationResult } from "express-validator";

// Check for validation error and deny request if present
export function checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ validation_errors: errors.array() });
    } else {
        next();
    }
}

import { body } from "express-validator";

export const registerRules = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Full name must be 2–80 characters"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username may only contain letters, numbers and underscores"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain a letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
];

export const loginRules = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordRules = [
  body("email").trim().isEmail().withMessage("A valid email is required"),
];

export const onboardingRules = [
  body("technologies").isArray({ min: 1 }).withMessage("Pick at least one technology"),
  body("experienceLevel")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Choose your experience level"),
  body("interests").optional().isArray(),
];

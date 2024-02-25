import {body} from 'express-validator'

export const loginValidator = [
  body('username', 'username is Empty').not().isEmpty(),
  body('password', 'The minimum password length is 8 characters').isLength({min: 6}),
]

export const registerValidator = [
  body('username', 'username is Empty').not().isEmpty(),
  body('email', 'Invalid email').isEmail(),
  body('password', 'password is Empty').not().isEmpty(),
  body('password', 'The minimum password length is 8 characters').isLength({min: 8}),
  body('password', 'Password must contain at least one letter, one number, and one special character')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
]
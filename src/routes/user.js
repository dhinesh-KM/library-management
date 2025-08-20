import {Router} from 'express'
import {authjwt} from '../middlewares/authmiddleware.js'
import {login, register} from '../controllers/user.js'
import { validate_payload } from '../validation/validator.js'
import { registerSchema } from '../validation/schema.js'

const router = Router()

router.post('/register', validate_payload(registerSchema), register)
router.post('/login',login)

export default router
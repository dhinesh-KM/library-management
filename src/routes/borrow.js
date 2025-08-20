import {Router} from 'express'
import {authjwt, authorize} from '../middlewares/authmiddleware.js'
import { validate_payload } from '../validation/validator.js'
import { borrowBook, returnBook, borrowHistory } from '../controllers/borrow.js'

const router = Router()

router.use(authjwt)
router.post('/:bookId', authorize('member'), borrowBook)
router.post('/return/:borrowId', authorize('member'), returnBook)
router.get('/history',authorize('member'), borrowHistory)


export default router
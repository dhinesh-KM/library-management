import {Router} from 'express'
import {authjwt, authorize} from '../middlewares/authmiddleware.js'
import { addBook, updateBook, deleteBook, listBooks } from '../controllers/book.js' 
import { validate_payload } from '../validation/validator.js'
import { bookCreateSchema, bookUpdateSchema } from '../validation/schema.js'

const router = Router()

router.use(authjwt)
router.post('/', authorize('admin'), validate_payload(bookCreateSchema), addBook)
router.get('/', listBooks)
router.patch('/:id',authorize('admin'), validate_payload(bookUpdateSchema), updateBook)
router.delete('/:id', authorize('admin'), deleteBook)


export default router
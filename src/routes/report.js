import {Router} from 'express'
import {authjwt, authorize} from '../middlewares/authmiddleware.js'
import { activeMembers, availability, mostBorrowed, availabilityPerTitle } from '../controllers/report.js'

const router = Router()

router.use(authjwt)
router.get('/most-borrowed', authorize('admin'), mostBorrowed)
router.get('/active-members', authorize('admin'), activeMembers)
router.get('/library-availability', authorize('admin'), availability)
router.get('/books-availability', authorize('admin'), availabilityPerTitle)


export default router
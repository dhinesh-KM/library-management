import { Borrow } from "../models/borrow.js"
import { Book } from "../models/book.js"
import { CustomError } from "../utility/customerror.js"
import { status } from "http-status"
import {successResponse} from '../utility/utils.js'

export const borrowBook = async(req,res,next) => {
    const bookId = req.params.bookId
    try{
        const book = await Book.findById(bookId)

        if (!book)
            throw new CustomError("Book not found", status.NOT_FOUND)

        await Borrow.create({user: req.user.id,book: book._id})

        if (book.copies > 0)
            book.copies -= 1
        
        await book.save()

        return successResponse(res,null,"Book borrowed successfully",status.CREATED)

    } 
    catch (err) {
        next(err)
    }
}


export const returnBook = async(req,res,next) => {
    const borrowId = req.params.borrowId
    try{

        const borrow = await Borrow.findById(borrowId).populate("book")
        if (!borrow)
            throw new CustomError("Borrow record not found", status.NOT_FOUND)

        if (borrow.returnDate) 
            throw new CustomError("Book already returned", status.BAD_REQUEST)

        if (String(borrow.user) !== String(req.user.id))
            throw new CustomError("Not your borrow record", status.BAD_REQUEST)

        borrow.returnDate = new Date()
        await borrow.save()

        borrow.book.copies += 1
        await borrow.book.save()

        return successResponse(res,null,"Book returned successfully")

    }
    catch(err){
        next(err)
    }
}

export const borrowHistory = async(req,res,next) => {
    try{
        const history = await Borrow.find({ user: req.user.id })
                                .populate("book", "title author isbn")
                                .select("_id user borrowDate returnDate createdAt")
                                .sort({ borrowDate: -1 })

        return successResponse(res,{history},null)
    }
    catch(err){
        next(err)
    }
}
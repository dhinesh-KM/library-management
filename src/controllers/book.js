import express from "express"
import {Book} from "../models/book.js"
import { Borrow } from "../models/borrow.js"
import { CustomError } from "../utility/customerror.js"
import {successResponse} from '../utility/utils.js'
import { secretKey } from "../config/config.js"
import {status} from 'http-status'
import { isPositiveInt } from "../utility/utils.js"
import moment from 'moment'

const router = express.Router()

export const addBook = async(req, res, next) => {
    const {title, author, isbn, publicationDate, genre, copies} = req.body
    const parsedDate =  moment(publicationDate, "DD-MM-YYYY").format("YYYY-MM-DD")

    try{
        const existing_isbn = await Book.findOne({isbn})

        if (existing_isbn)
            throw new CustomError("ISBN already exists",status.CONFLICT)

        await Book.create({title,author,isbn,publicationDate: parsedDate,genre,copies})
        return successResponse(res,null,'Book added successfully.',status.CREATED)

    }
    catch(err){
        next(err)
    }
        
}

export const updateBook = async(req, res, next) => {
    const data = req.body
    const {id} = req.params

    try{
        if (data.isbn)
            {
                const existing_isbn = await Book.findOne({ _id: { $ne: id }, isbn: data.isbn })
                if (existing_isbn) 
                    throw new CustomError("ISBN already exists",status.CONFLICT)
            }

        const updated_book = await Book.findByIdAndUpdate(id, data)
        if (!updated_book) 
            throw new CustomError("Book not found", status.NOT_FOUND)

        return successResponse(res,null,'Book updated successfully.',status.OK)

    }
    catch(err){
        next(err)
    }
        
}

export const deleteBook =  async (req, res, next) => {
    const { id } = req.params
    try{
        const book = await Book.findById(id)

        if (!book) 
            throw new CustomError("Book not found", status.NOT_FOUND)

        if (book.isDeleted) 
            throw new CustomError("Book already deleted", status.BAD_REQUEST)

        const activeBorrows = await Borrow.findOne({ book: id, returnDate: null })
        if (activeBorrows) 
            throw new CustomError("Cannot delete book: some copies are currently borrowed",status.BAD_REQUEST)


        // soft delete
        book.isDeleted = true
        await book.save()
        
        return successResponse(res,null,'Book deleted successfully.',status.OK)
    }
    catch(err){
        next(err)
    }
}

export const listBooks =  async (req, res, next) => {
  try{
        const { limit = 10, after, author, genre, q } = req.query

        if (!isPositiveInt(limit)) 
                throw new CustomError("limit must be a positive integer",status.BAD_REQUEST)
        

        const filter = {}
        // Case-insensitive exact match for author
        if (author) filter.author = new RegExp(`^${author}$`, "i")

        // Case-insensitive exact match for genre
        if (genre) filter.genre = new RegExp(`^${genre}$`, "i")

        if (q) {
            const regex = new RegExp(q, "i") // "i" for case-insensitive
            filter.$or = [
                { title: regex },
                { author: regex }
            ]
        }

        if (after) filter._id = { $lt: after }

        filter.copies = {$gt: 0}

        const items = await Book.findActive(filter)
            .sort({_id: -1})
            .limit(Number(limit) + 1) // fetch 1 extra to check if there’s a next page
            .select("title author isbn publicationDate genre copies createdAt _id")

        const hasNextPage = items.length > limit
        if (hasNextPage) items.pop() // remove the extra one

        return successResponse(res, {books: items,hasNextPage,endCursor: items.length ? items[items.length - 1]._id : null})
    
    } 
    catch (err) {
        next(err)
    }
}



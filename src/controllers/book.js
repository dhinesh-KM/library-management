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

        const existing_book = await Book.findOne({title,author,genre})
        if (existing_book)
            throw new CustomError("book already exist with same title, author, genre.",status.CONFLICT)

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
        const currentBook = await Book.findById(id)
        if (!currentBook) 
            throw new CustomError("Book not found", status.NOT_FOUND)

        const title = data.title || currentBook.title
        const author = data.author || currentBook.author   
        const genre = data.genre || currentBook.genre

        if (data.isbn)
            {
                const existing_isbn = await Book.findOne({ _id: { $ne: id }, isbn: data.isbn })
                if (existing_isbn) 
                    throw new CustomError("ISBN already exists",status.CONFLICT)
            }

        const existing_book = await Book.findOne({ _id: { $ne: id }, title, author, genre })
        if (existing_book)
            throw new CustomError("book already exist with same title, author, genre.",status.CONFLICT)


        for (const key in data) {
            if (key === 'publicationDate') {
                currentBook[key] = moment(data[key], "DD-MM-YYYY").format("YYYY-MM-DD")
            } else {
                currentBook[key] = data[key]        
            }
        }
        await currentBook.save()

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
        const { limit = 10, after, author, genre, q, before } = req.query
        let hasNextPage = false
        let hasPrevPage = false
        let sort = {_id: -1}

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
    

        if (before) {
            filter._id = { $gt: before}
            sort = {_id: 1}
        }


        filter.copies = {$gt: 0}

        let items = await Book.findActive(filter)
            .sort(sort)
            .limit(Number(limit))
            .select("title author isbn publicationDate genre copies createdAt _id")


        if (before) items = items.reverse() // restore order

        // Check if there’s a previous page
        if (items.length > 0) {
            const firstId = items[0]._id
            const prevExists = await Book.exists({ _id: { $gt: firstId } })
            hasPrevPage = !!prevExists
        }

        // Check if there’s a next page
        if (items.length > 0) {
            const lastId = items[items.length - 1]._id
            const nextExists = await Book.exists({ _id: { $lt: lastId } })
            hasNextPage = !!nextExists
        }
        
        const data ={
            books: items,
            pageInfo:{
                hasNextPage,
                nextCursor: items.length ? items[items.length - 1]._id : null,
                hasPrevPage,
                prevCursor: items.length ? items[0]._id : null
            }
        }
        return successResponse(res,data )
    
    } 
    catch (err) {
        next(err)
    }
}

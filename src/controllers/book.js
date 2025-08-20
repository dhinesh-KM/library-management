import express from "express";
import {Book} from "../models/book.js";
import { CustomError } from "../utility/customerror.js";
import {successResponse} from '../utility/success_response.js'
import { secretKey } from "../config/config.js";
import {status} from 'http-status'
import { isPositiveInt } from "../utility/utils.js";

const router = express.Router();

export const addBook = async(req, res, next) => {
    console.log("====")
    const {title, author, isbn, publicationDate, genre, copies} = req.body;

    try{
        const existing_isbn = await Book.findOne({isbn})
        console.log("-=-=-",existing_isbn)
        if (existing_isbn)
            throw new CustomError("ISBN already exists",status.CONFLICT)

        await Book.create({title,author,isbn,publicationDate,genre,copies});
        return successResponse(res,null,'Book added successfully.',status.CREATED)

    }
    catch(err){
        next(err)
    }
        
}

export const updateBook = async(req, res, next) => {
    const data = req.body;
    const {id} = req.params;

    try{
        if (data.isbn)
            {
                const existing_isbn = await Book.findOne({ _id: { $ne: id }, isbn: data.isbn });
                if (existing_isbn) 
                    throw new CustomError("ISBN already exists",status.CONFLICT)
            }

        const updated_book = await Book.findByIdAndUpdate(id, data);
        if (!updated_book) 
            throw new CustomError("Book not found", status.NOT_FOUND)

        return successResponse(res,null,'Book updated successfully.',status.OK)

    }
    catch(err){
        next(err)
    }
        
}

export const deleteBook =  async (req, res) => {
    const { id } = req.params;
    try{
        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) 
            throw new CustomError("Book not found", status.NOT_FOUND)

        return successResponse(res,null,'Book deleted successfully.',status.OK)
    }
    catch(err){
        next(err)
    }
};

export const listBooks =  async (req, res) => {
  try{
      const { limit = 10, after, sort = "-createdAt", author, genre, q } = req.query;

      if (!isPositiveInt(limit)) {
        return res.status(400).json({ message: "limit must be a positive integer" });
      }

      const filter = {};
      if (author) filter.author = author;
      if (genre) filter.genre = genre;
      if (q) filter.$text = { $search: q };

      // Cursor condition
      if (after) {
        filter._id = { $gt: after }; // assuming ascending order
      }

      const items = await Book.find(filter)
        .sort(sort)
        .limit(Number(limit) + 1); // fetch 1 extra to check if there’s a next page

      const hasNextPage = items.length > limit;
      if (hasNextPage) items.pop(); // remove the extra one

      return successResponse(res, {books: items,hasNextPage,endCursor: items.length ? items[items.length - 1]._id : null},null)
    
    } 
    catch (err) {
        next(err)
    }
};

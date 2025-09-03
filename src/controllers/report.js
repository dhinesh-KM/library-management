import { Borrow } from "../models/borrow.js"
import { Book } from "../models/book.js"
import { CustomError } from "../utility/customerror.js"
import { status } from "http-status"
import {successResponse} from '../utility/utils.js'

export const mostBorrowed =  async (req, res, next) => {
    try {
        const result = await Borrow.aggregate([
            // Group by book ID and count how many times each book was borrowed
            { $group: { _id: "$book", borrowCount: { $sum: 1 } } },

            // Sort the books by borrow count in descending order
            { $sort: { borrowCount: -1 } },

            // Limit the result to top 5 most borrowed books
            { $limit: 5 },

            // Join with the "books" collection to get book details
            { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "book" } },

            // Flatten the joined array to an object
            { $unwind: "$book" },

            // Select only the fields needed in the result
            { $project: { _id: 0, title: "$book.title", author: "$book.author", borrowCount: 1 } }
            ])
        return successResponse(res,{most_borrowed:result})

    } 
    catch (err) {
        next(err)
  }
}

export const activeMembers =  async (req, res, next) => {
    try {
        const result = await Borrow.aggregate([
            // Group by user ID and count how many times each user borrowed books
            { $group: { _id: "$user", borrowCount: { $sum: 1 } } },

            // Sort users by borrow count in descending order
            { $sort: { borrowCount: -1 } },

            // Limit to top 5 users
            { $limit: 5 },

            // Join with the "users" collection to get user details
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },

            // Flatten the joined array into an object 
            { $unwind: "$user" },

            // Select only the fields needed in the result
            { $project: { _id: 0, name: "$user.name", email: "$user.email", borrowCount: 1 } }
        ])
        return successResponse(res,{active_members:result})
    } 
    catch (err) {
        next(err)
    }
}

export const availability =  async (req, res) => {
    try {

        // Group all documents together using _id: null
        const totalBooksAgg = await Book.aggregate([{ 
            $group: { 
                _id: null,  // null means all documents are treated as one group
                total: { $sum: "$copies" } // sum the "copies" field across all books
            } 
        }])

        const borrowedBooks = await Borrow.countDocuments({ returnDate: null })

        const totalBooks = totalBooksAgg[0]?.total + borrowedBooks|| 0
        const availableBooks = totalBooks - borrowedBooks

        const data = {
            totalBooks,
            borrowedBooks,
            availableBooks
        }

        return successResponse(res,{total_available_books:data})
    } 
    catch (err) {
        next(err)
    }
}


export const availabilityPerTitle = async(req,res,next) =>{
    try{
        const borrowedCounts = await Book.aggregate([

            // Only consider non-deleted books
            { $match: { isDeleted: false }},

            // Lookup to find all borrow records for each book
            { $lookup: { from: "borrows", localField: "_id", foreignField: "book", as: "borrowedInfo" }},

            // Project the required fields and calculate borrowed and available copies
            { $project: {   title: 1,
                            totalCopies: { $add: ["$copies", { $size: "$borrowedInfo" }] }, 
                            borrowedCopies: { $size: "$borrowedInfo" }, 
                            availableCopies: "$copies" } }
        ])       

        return successResponse(res,{available_per_book:borrowedCounts})
    }
    catch (err) {
        next(err)
    }

}
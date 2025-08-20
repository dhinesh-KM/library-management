import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true, index: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    publicationDate: { type: Date, required: true },
    genre: { type: String, required: true, index: true },
    copies: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);


bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ author: 1, genre: 1 });
bookSchema.index({ title: "text" }); 


export const Book =  mongoose.model("Book", bookSchema);

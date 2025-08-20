import express from "express";
import {logger} from './config/logger.js';
import {connectdb} from './config/database.js'
import userRoutes from './routes/user.js'
import bookRoutes from './routes/book.js'
import {ErrorHandler} from './middlewares/errorhandler.js'
import { CustomError } from "./utility/customerror.js";
import {status} from 'http-status'


connectdb();

const app = express();
app.use(express.json());

app.get('/get', (req, res) => {
    res.send('Hello World!')
  })

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/book", bookRoutes)

app.use('*',(req, res, next) => {
    next(new CustomError('Resource not found', status.NOT_FOUND))
})

app.use(ErrorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

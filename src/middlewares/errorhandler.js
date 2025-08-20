import {logger} from '../config/logger.js'

// Error handler middleware for error
export const ErrorHandler = (err,req,res,next) => {
    logger.info(`\n${err.stack}\n`)


    res.status(err.status_code || 500).json({'error': true, 'msg': err.message})
}


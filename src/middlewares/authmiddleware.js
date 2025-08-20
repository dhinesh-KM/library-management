import jwt from 'jsonwebtoken'
import {CustomError} from '../utility/customerror.js'
import {secretKey} from '../config/config.js'
import status from 'http-status'

export const authjwt = async(req,res,next) => {
    const token = req.header('Authorization')

    if (!token)
        return  next(new CustomError("Unauthorized",status.UNAUTHORIZED)) 


    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
        
        if (err) {
            if (err.name == "JsonWebTokenError")
                return  next(new CustomError("Invalid token",status.BAD_REQUEST)) 

            if (err.name == "TokenExpiredError")
                return next(new CustomError("Token Expired", status.BAD_REQUEST))

            return res.status(status.INTERNAL_SERVER_ERROR).json({'msg': err.message})
        }
        req.user = decoded
        next() 
      })
    
}

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role))
        throw new CustomError("You don't have permission to do this operation",status.UNAUTHORIZED)
      
      next()
    } 
    catch (err) {
      next(err)
    }
  }
}






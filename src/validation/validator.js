
import {CustomError} from '../utility/customerror.js';

function result(req,res,next,value,error)
{
    if (error)
        //console.log( "---",error.message)
        throw new CustomError(error.message.replace(/"/g, '') , 400)
    req.body = value;
    next();

}

export const validate_payload =  ( schema ) => {
    return (req, res, next) => {
        console.log("000000")
        const {value,error} = schema.validate(req.body, {abortEarly : false,  stripUnknown: true });

        //console.log("v:",value,"\ne:",error)
        return result(req,res,next,value,error);
    }
}
import Joi from 'joi'
import moment from 'moment'

const date_validator = (value, helpers) => {
    const date = moment(value, "DD-MM-YYYY")

    if (!date.isValid())
        return helpers.message('published date must be in the format DD-MM-YYYY')

    if ( date.isSameOrAfter(moment(), 'day'))
        return helpers.message("published date should be a past date")

    return value
}

export const registerSchema = Joi.object(
    {
        name : Joi.string().required(),
        email : Joi.string().email().messages({'string.email': 'Invalid email address.'}),
        password : Joi.string().min(6).required(),
    }
).options({ stripUnknown: true })

export const bookCreateSchema = Joi.object(
    {
        title: Joi.string().trim().required(),
        author: Joi.string().trim().required(),
        isbn: Joi.string().trim().required(), 
        // publicationDate: Joi.date().required(),
        publicationDate: Joi.string().required().custom(date_validator, 'custom date validation'),
        genre: Joi.string().trim().required(),
        copies: Joi.number().integer().greater(0).required()
    }
).options({ stripUnknown: true })

export const bookUpdateSchema = Joi.object(
    {
        title: Joi.string().trim(),
        author: Joi.string().trim(),
        isbn: Joi.string().trim(),  
        publicationDate: Joi.string().custom(date_validator, 'custom date validation'),
        genre: Joi.string().trim(),
        copies: Joi.number().integer().greater(0),
    }
).min(1) // require at least one field to be provided
 .options({ stripUnknown: true })

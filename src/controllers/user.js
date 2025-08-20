import express from "express"
import jwt from "jsonwebtoken"
import {User} from "../models/user.js"
import { CustomError } from "../utility/customerror.js"
import {successResponse} from '../utility/utils.js'
import { secretKey } from "../config/config.js"
import status from "http-status"



const router = express.Router()

// Generate JWT
const generateToken = (id,role) => jwt.sign({ id:id, role:role }, secretKey, { expiresIn: "1h" })

// Register
export const register = async (req, res, next) => {
  const { name, email, password } = req.body
  let {role} = req.query

  if (!role || role.length == 0)
    role = 'member'

  try {
    const userExists = await User.findOne({ email })

    if (userExists) 
      throw new CustomError("User already exists",status.CONFLICT)

    await User.create({ name, email, password, role })

    return successResponse(res,null, "User registered successfully", status.CREATED)

  } catch (err) {
    next(err)
  }
}



// Login
export const login = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) 
      throw new CustomError("Invalid credentials",status.BAD_REQUEST)
   
    const token = generateToken(user._id,user.role)
    const data = { id: user._id, name: user.name, email: user.email, role: user.role, token: token }
    return successResponse(res,data, "Login successful")
    
  } catch (err) {
    next(err)
  }
}


export default router

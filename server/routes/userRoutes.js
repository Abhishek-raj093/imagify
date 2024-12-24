import express from 'express'
import {paymentStripe, registerUser, userCredits} from '../controllers/userController.js'
import {loginUser} from '../controllers/userController.js'
import userAuth from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/credits', userAuth, userCredits)
userRouter.post('/pay-stripe', userAuth, paymentStripe)

export default userRouter

//http://localhost:4000/api/user/register
//http://localhost:4000/api/user/login
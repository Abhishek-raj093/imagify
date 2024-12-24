import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import transitionModel from "../models/transactionModel.js";

export const registerUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.json({sucrss:false, message:'Missing Details'})
        }

        const salt = await bcrypt.genSalt(10)
        const handedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: handedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.json({success: true, token, user: {name: user.name}})

    }catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email})

        if(!user) {
            return res.json({success: false, message: 'User does not exist'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.json({success: true, token, user: {name: user.name}})

        }else{
            return res.json({success: false, message: 'Invalid credentials'})
        }

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})

    }
}
const userCredits = async (req, res)=>{
    try {
        const {userId} = req.body

        const user = await userModel.findById(userId) 
        res.json({success: true, credits: user.creditBalance, user: {name: user.name}})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

const stripeInstance = new Stripe({
    key_publishable: process.env.PUBLISHABLE_KEY,
    key_secret: process.env.SECRET_KEY
});

const paymentStripe = async(req, res)=>{
    try {
        const {userId, planId} = req.body

        const userData = await userModel.findById(userId)

        if (!userId || !planId) {
            return res.json({success: false, message: 'Missing Details'})
        }

        let credits, plan, amount, date

        switch (planId) {
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
            break;

            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
            break;

            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
            break;

            default:
                return res.json({success: false, message: 'plan not found'});
        }

        date = Date.now();

        const transactionData = {
            userId, plan, amount, credits, date
        }

        const newTransaction = await transitionModel.create(transitionModel)

        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY,
            recept: newTransaction._id,
        }

        await stripeInstance.invoiceRenderingTemplates.create(SchemaTypeOptions, (error, order)=>{
            if (error) {
                console.log(error);
                return res.json({success: false, message: error})
            }
            res.json({success: true, order})
        })

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export {userCredits, paymentStripe}
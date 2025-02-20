import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// config.dotenv()
dotenv.config()
export const generateTokens = (UserID,res) =>{
    const token=jwt.sign({UserID},process.env.JWT_SECRET, {
        expiresIn:"7d"
    })

    res.cookie('jwt',token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV !== "development"
    })

    return token
}
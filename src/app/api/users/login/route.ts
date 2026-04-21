import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest){
    try {
        console.log("Login API initiated");
        await connect()

        const reqBody = await request.json()
        const {email, password} = reqBody;
        console.log("Request body parsed for:", email);

        //check if user exists
        console.log("Searching for user...");
        const user = await User.findOne({email})
        if(!user){
            console.log("User not found:", email);
            return NextResponse.json({error: "User does not exist"}, {status: 400})
        }
        console.log("User found, validating password...");
        
        //check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword){
            console.log("Invalid password for user:", email);
            return NextResponse.json({error: "Invalid password"}, {status: 400})
        }
        console.log("Password validated, creating token...");
        
        //create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }
        //create token
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {expiresIn: "1d"})
        console.log("Token generated successfully");

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        })
        response.cookies.set("token", token, {
            httpOnly: true, 
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        })
        console.log("Cookies set, returning response");
        return response;

    } catch (error: any) {
        console.error("Login error details:", error);
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
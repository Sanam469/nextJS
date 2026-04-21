import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";


export async function POST(request: NextRequest){
    try {
        console.log("Signup API initiated");
        await connect()
        
        const reqBody = await request.json()
        const {username, email, password} = reqBody
        console.log("Request body parsed:", { username, email, password: password ? "****" : "missing" });

        //check if user already exists
        console.log("Checking if user exists...");
        const user = await User.findOne({email})

        if(user){
            console.log("User already exists:", email);
            return NextResponse.json({error: "User already exists"}, {status: 400})
        }

        //hash password
        console.log("Hashing password...");
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        console.log("Creating new user...");
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()
        console.log("User saved successfully:", savedUser._id);

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser
        })

    } catch (error: any) {
        console.error("Signup error details:", error);
        return NextResponse.json({error: error.message}, {status: 500})

    }
}
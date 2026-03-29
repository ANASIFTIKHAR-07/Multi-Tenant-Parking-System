import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { Admin } from "../models/admin.model.js";

// I have seeded the admin credentials
const connectDB = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
        
        if (process.env.NODE_ENV !== "production") {
            const existingAdmin = await Admin.findOne({email: "admin@gmail.com"});
            if (!existingAdmin) {
                await Admin.create({
                    name: "Muhammad Saleh",
                    email: process.env.ADMIN_EMAIL,
                    role: "admin",
                    password: process.env.ADMIN_PASSWORD,
                });
                console.log("✅ Admin user seeded successfully.");
            } else {
                console.log("ℹ️ Admin already exists, skipping seed.");
            }
        }
    } catch (error) {
        console.error("MongoDB connection Failed!", error); 
        process.exit(1) 
    }
}

export default connectDB
import { ApiError } from "../utils/ApiError.js";


export const isAdmin = (req, res, next)=> {
    if (!req.user || req.user?.role !== "admin") {
        throw new ApiError(403,"Only Admins can access, Invalid Access!")
    }
    next();
}
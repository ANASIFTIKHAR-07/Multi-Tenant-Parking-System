import express, { json, urlencoded } from "express"
import cookieParser from "cookie-parser"
import mongoSanitize from "express-mongo-sanitize"
import xss from "xss-clean"
import helmet from "helmet"
import cors from "cors"
import { ApiError } from "./utils/ApiError.js"



const app = express()

// Trust reverse proxy (e.g., Render, Railway, Nginx) so secure cookies work
app.set('trust proxy', 1)

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
))

app.use(helmet())

app.use(mongoSanitize({
    replaceWith: '_'   
  }))
app.use(xss())
app.use(cookieParser());
app.use(urlencoded({limit: "16kb", extended: true}));
app.use(json({limit: "16kb"}));




//  Routes Imports And Declaration
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js"
import csvRouter from "./routes/csv.routes.js"

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/csv", csvRouter)

// Health check — used by frontend to wake Render from cold start
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof ApiError;
  const message =
    statusCode >= 500 && !isOperational
      ? "Internal Server Error"
      : err.message || "Internal Server Error";
  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors: err.errors || [],
    data: null,
  });
});

export { app }
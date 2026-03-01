import express, { Application } from "express";
import middlewareConfig from "./config/index";
import { isAuthenticated } from "./middleware/jwt.middleware";
import errorHandler from "./error-handiling/index";

const app: Application = express();

// Middleware
middlewareConfig(app);


// Routes
import apartmentRoutes from "./routes/apartment.routes";
app.use("/api/apartment", apartmentRoutes);

import bookingRoutes from "./routes/booking.routes";
app.use("/api/booking", bookingRoutes);

import authRoutes from "./routes/auth.routes";
app.use("/auth", authRoutes);

import fileUploadRoutes from "./routes/fileUpload.routes";
app.use("/api/fileupload", fileUploadRoutes);

// Error handling
errorHandler(app);

// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on  http://localhost:${PORT}`);
});

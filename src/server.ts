import express, { Application } from "express";

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
import apartmentRoutes from "./routes/apartment.routes";
app.use("/api/apartment", apartmentRoutes);

import bookingRoutes from "./routes/booking.routes";
app.use("/api/booking", bookingRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on  http://localhost:${PORT}`);
});

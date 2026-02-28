import express, { Application, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.get("/api/apartments", async (req: Request, res: Response) => {
  try {
    const apartments = await prisma.apartment.findMany({
      include: { bookings: true },
    });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch apartments" });
  }
});

app.get("/api/apartments/:id", async (req: Request, res: Response) => {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: req.params.id as string },
      include: { bookings: true },
    });

    if (!apartment) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(apartment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch apartment" });
  }
});

app.post("/api/apartments", async (req: Request, res: Response) => {
  try {
    const { name, description, price_per_day, size, capacity, images } =
      req.body;
    const apartment = await prisma.apartment.create({
      data: { name, description, price_per_day, size, capacity, images },
    });
    res.status(201).json(apartment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create apartment" });
  }
});

app.put("/api/apartments/:id", async (req: Request, res: Response) => {
  try {
    const { name, description, price_per_day, size, capacity, images } =
      req.body;
    const apartment = await prisma.apartment.update({
      where: { id: req.params.id as string },
      data: { name, description, price_per_day, size, capacity, images },
    });
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update apartment" });
  }
});

app.delete("/api/apartments/:id", async (req: Request, res: Response) => {
  try {
    await prisma.apartment.delete({
      where: { id: req.params.id as string },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete apartment" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import express, { Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const apartments = await prisma.apartment.findMany({
      include: { bookings: true },
    });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch apartments" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
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

router.post("/", async (req: Request, res: Response) => {
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

router.put("/:id", async (req: Request, res: Response) => {
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

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.apartment.delete({
      where: { id: req.params.id as string },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete apartment" });
  }
});

export default router;
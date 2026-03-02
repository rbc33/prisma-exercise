import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import express, { Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apartments = await prisma.apartment.findMany({
      include: { bookings: true },
    });
    res.json(apartments);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price_per_day, size, capacity, images } =
      req.body;
    const apartment = await prisma.apartment.create({
      data: { name, description, price_per_day, size, capacity, images },
    });
    res.status(201).json(apartment);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price_per_day, size, capacity, images } =
      req.body;
    const apartment = await prisma.apartment.update({
      where: { id: req.params.id as string },
      data: { name, description, price_per_day, size, capacity, images },
    });
    res.json(apartment);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: "Invalid apartment ID" });
    }
    
    await prisma.apartment.delete({
      where: { id: id as string },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Apartment not found" });
    }
    next(error);
  }
});

export default router;
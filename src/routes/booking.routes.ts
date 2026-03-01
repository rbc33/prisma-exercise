import { Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();


router.post("/", async (req: Request, res: Response) => {
  try {
    const { apartment_id, guest_name, check_in, check_out } =
      req.body;
    const apartment = await prisma.booking.create({
      data: { apartment_id, guest_name, check_in, check_out },
    });
    res.status(201).json(apartment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create apartment" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const apartments = await prisma.booking.findMany();
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch apartments" });
  }
});



router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.booking.delete({
      where: { id: req.params.id as string },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete apartment" });
  }
});

export default router;
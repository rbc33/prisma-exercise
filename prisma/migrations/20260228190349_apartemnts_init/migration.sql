-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_per_day" DOUBLE PRECISION NOT NULL,
    "size" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "images" TEXT[],

    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

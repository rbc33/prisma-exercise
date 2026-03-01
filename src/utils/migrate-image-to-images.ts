import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/your-db-name";

async function migrateImageToImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const apartmentsCollection = db.collection("apartments");

    // Find all documents with 'image' field
    const documentsWithImage = await apartmentsCollection
      .find({ image: { $exists: true } })
      .toArray();

    console.log(
      `Found ${documentsWithImage.length} apartments with 'image' field`,
    );

    if (documentsWithImage.length === 0) {
      console.log("No documents to migrate");
      await mongoose.connection.close();
      return;
    }

    // Update each document
    for (const doc of documentsWithImage) {
      const imageValue = doc.image;

      // Convert image to images array
      let imagesArray: string[];
      if (Array.isArray(imageValue)) {
        imagesArray = imageValue;
      } else if (typeof imageValue === "string") {
        imagesArray = [imageValue];
      } else {
        console.log(`Skipping document ${doc._id} - invalid image value`);
        continue;
      }

      // Update the document: rename 'image' to 'images'
      await apartmentsCollection.updateOne(
        { _id: doc._id },
        {
          $set: { images: imagesArray },
          $unset: { image: "" },
        },
      );

      console.log(`✓ Migrated apartment ${doc._id}: ${doc.name}`);
    }

    console.log("\n✅ Migration completed successfully!");
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
migrateImageToImages();

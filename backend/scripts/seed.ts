import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Category } from "../src/models/Category";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swathi-publications";

const mockCategories = [
  { id: "politics", slug: "politics", name: "Politics", description: "Policy, elections, governance.", isActive: true, order: 1 },
  { id: "business", slug: "business", name: "Business", description: "Markets, economy, enterprise.", isActive: true, order: 2 },
  { id: "technology", slug: "technology", name: "Technology", description: "Innovation, startups, AI.", isActive: true, order: 3 },
  { id: "science", slug: "science", name: "Science", description: "Research, discovery, climate.", isActive: true, order: 4 },
  { id: "sports", slug: "sports", name: "Sports", description: "Live scores, features, opinion.", isActive: true, order: 5 },
  { id: "culture", slug: "culture", name: "Culture", description: "Arts, cinema, literature.", isActive: true, order: 6 }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    for (const cat of mockCategories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          isActive: cat.isActive,
          sortOrder: cat.order,
        });
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category ${cat.name} already exists.`);
      }
    }
    
    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();

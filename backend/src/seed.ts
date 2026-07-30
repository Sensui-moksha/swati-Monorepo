import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User";
import { Category } from "./models/Category";
import { Article } from "./models/Article";
import { Book } from "./models/Book";
import { Author } from "./models/Author";
import { Publication } from "./models/Publication";
import { CommerceOrder } from "./models/CommerceOrder";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swathi-publications";

export async function seedIfEmpty() {
  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    await seed();
  }
}

export async function seed() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // 1. Seed Admin User
    let admin = await User.findOne({ email: "admin@swathi.com" });
    if (!admin) {
      admin = new User({
        email: "admin@swathi.com",
        username: "admin",
        password: "Password123!",
        fullName: "System Admin",
        role: "admin",
        isActive: true,
        emailVerified: true,
      });
      await admin.save();
      console.log("Created Admin User: admin@swathi.com / Password123!");
    } else {
      console.log("Admin User already exists.");
    }

    // 2. Seed Test User
    let testUser = await User.findOne({ email: "user@swathi.com" });
    if (!testUser) {
      testUser = new User({
        email: "user@swathi.com",
        username: "testuser",
        password: "Password123!",
        fullName: "Test Reader",
        role: "user",
        isActive: true,
        emailVerified: true,
      });
      await testUser.save();
      console.log("Created Test User: user@swathi.com / Password123!");
    } else {
      console.log("Test User already exists.");
    }

    // 3. Seed Author
    let authorDoc = await Author.findOne({ slug: "dr-s-raman" });
    if (!authorDoc) {
      authorDoc = await Author.create({
        name: "Dr. S. Raman",
        slug: "dr-s-raman",
        bio: "Senior Researcher and Academic Author",
        email: "raman@swathi.com",
        isActive: true,
        isFeatured: true,
      });
      console.log("Created Author: Dr. S. Raman");
    }

    // 4. Seed Categories
    const categoryNames = [
      { name: "Politics", slug: "politics", description: "Political news and policy analysis" },
      { name: "Science", slug: "science", description: "Scientific discoveries and research" },
      { name: "Technology", slug: "technology", description: "Tech industry and digital trends" },
      { name: "Business", slug: "business", description: "Economy, markets and finance" },
      { name: "Culture", slug: "culture", description: "Arts, books and cultural essays" },
      { name: "Opinion", slug: "opinion", description: "Perspectives and editorial columns" },
    ];

    const categoryMap = new Map();
    for (const cat of categoryNames) {
      let existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        existing = await Category.create({
          ...cat,
          isActive: true,
          order: 1,
        });
        console.log(`Created Category: ${cat.name}`);
      }
      categoryMap.set(cat.slug, existing._id);
    }

    // 5. Seed Articles
    await Article.deleteMany({});
    const articlesData = [
      {
        title: "The Long Road to Cleaner Urban Air",
        slug: "the-long-road-to-cleaner-urban-air",
        content: "Urban air quality continues to challenge planners and public health officials globally. New sensor networks and satellite imaging now offer fine-grained pollution tracking across major industrial corridors.\n\nCities implementing low-emission zones are seeing measurable improvements in respiratory health metrics within 24 months of policy enactment.",
        summary: "An in-depth look at urban air quality policies and sensor networks.",
        excerpt: "An in-depth look at urban air quality policies and sensor networks across major industrial corridors.",
        coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
        category: categoryMap.get("science"),
        author: admin._id,
        status: "published",
        isFeatured: true,
        isBreaking: true,
        publishedAt: new Date(),
        readingTime: 5,
        viewCount: 1420,
        likeCount: 98,
      },
      {
        title: "An Editor's Note on Truth in Slow Journalism",
        slug: "an-editors-note-on-truth-in-slow-journalism",
        content: "In an era dominated by instant notifications and breaking news alerts, slow journalism prioritizes context over speed, depth over volume.\n\nOur commitment at Swathi Publications is to provide considered analysis that stands the test of time.",
        summary: "Reflections on context, accuracy and depth in modern editorial work.",
        excerpt: "Reflections on context, accuracy and depth in modern editorial work and independent reporting.",
        coverImage: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop",
        category: categoryMap.get("opinion"),
        author: admin._id,
        status: "published",
        isFeatured: true,
        isBreaking: true,
        publishedAt: new Date(),
        readingTime: 4,
        viewCount: 2840,
        likeCount: 210,
      },
      {
        title: "Chipmakers Chart a Post-Subsidy Landscape",
        slug: "chipmakers-chart-a-post-subsidy-landscape",
        content: "Semiconductor manufacturers worldwide are restructuring capital investment strategies as government subsidy programs transition into operational oversight phases.\n\nFoundries are prioritizing energy-efficient packaging technologies and localized supply chain redundancy.",
        summary: "Analyzing capital allocations and semiconductor supply chains.",
        excerpt: "Analyzing capital allocations and semiconductor supply chains in advanced computing.",
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
        category: categoryMap.get("technology"),
        author: admin._id,
        status: "published",
        isFeatured: true,
        isBreaking: true,
        publishedAt: new Date(),
        readingTime: 6,
        viewCount: 3120,
        likeCount: 175,
      },
    ];

    for (const art of articlesData) {
      try {
        await Article.create(art);
      } catch (err: any) {
        if (err.code !== 11000) {
          console.error("Article seed error:", err.message);
        }
      }
    }
    console.log("Seeded sample articles.");

    // 6. Seed Books
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      const booksData = [
        {
          title: "Modern Physics: Principles & Foundations",
          slug: "modern-physics-principles-and-foundations",
          author: authorDoc._id,
          description: "A comprehensive review of modern quantum mechanics and relativity theory.",
          price: 499,
          status: "published",
          isFeatured: true,
        },
        {
          title: "Indian Polity & Constitutional Governance",
          slug: "indian-polity-and-constitutional-governance",
          author: authorDoc._id,
          description: "Essential reference manual for public administration and constitutional law.",
          price: 599,
          status: "published",
          isTrending: true,
        },
      ];

      for (const b of booksData) {
        await Book.create(b);
      }
      console.log("Seeded sample books.");
    }

    // 7. Seed Publications
    const pubCount = await Publication.countDocuments();
    if (pubCount === 0) {
      await Publication.create({
        name: "Swathi Weekly Issue #187",
        slug: "swathi-weekly-issue-187",
        type: "weekly",
        description: "Cover story on global trade dynamics, clean tech innovations, and regional literature reviews.",
        issueCount: 187,
      });
      console.log("Seeded sample publication.");
    }

    // 8. Seed Orders
    const orderCount = await CommerceOrder.countDocuments();
    if (orderCount === 0) {
      await CommerceOrder.create([
        {
          orderNumber: "ORD-2026-1001",
          user: testUser._id,
          status: "completed",
          subtotal: 499,
          total: 499,
          currency: "INR",
          items: [
            {
              type: "book",
              title: "Modern Physics: Principles & Foundations",
              quantity: 1,
              unitPrice: 499,
              totalPrice: 499,
            },
          ],
        },
        {
          orderNumber: "ORD-2026-1002",
          user: testUser._id,
          status: "completed",
          subtotal: 599,
          total: 599,
          currency: "INR",
          items: [
            {
              type: "book",
              title: "Indian Polity & Constitutional Governance",
              quantity: 1,
              unitPrice: 599,
              totalPrice: 599,
            },
          ],
        },
        {
          orderNumber: "ORD-2026-1003",
          user: admin._id,
          status: "processing",
          subtotal: 999,
          total: 999,
          currency: "INR",
          items: [
            {
              type: "custom",
              title: "Swathi Annual Membership Plan",
              quantity: 1,
              unitPrice: 999,
              totalPrice: 999,
            },
          ],
        },
      ]);
      console.log("Seeded sample orders.");
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();

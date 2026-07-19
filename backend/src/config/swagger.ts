import { env } from "./index";
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerConfig = {
  enabled: env.SWAGGER_ENABLED,
  path: env.SWAGGER_PATH,
  options: {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Prototype v0 API",
        version: "1.0.0",
        description:
          "API documentation for Prototype v0 - A modern content management platform",
        contact: {
          name: "API Support",
          email: "support@prototype-v0.com",
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Error message" },
              errors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
              stack: { type: "string", example: "Error stack trace" },
            },
          },
          Success: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Success message" },
              data: { type: "object" },
              meta: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  total: { type: "number" },
                  totalPages: { type: "number" },
                },
              },
            },
          },
          User: {
            type: "object",
            properties: {
              _id: { type: "string", example: "507f1f77bcf86cd799439011" },
              email: {
                type: "string",
                format: "email",
                example: "user@example.com",
              },
              username: { type: "string", example: "johndoe" },
              fullName: { type: "string", example: "John Doe" },
              avatar: {
                type: "string",
                format: "uri",
                example: "https://example.com/avatar.jpg",
              },
              role: {
                type: "string",
                enum: ["user", "editor", "admin"],
                example: "user",
              },
              isActive: { type: "boolean", example: true },
              emailVerified: { type: "boolean", example: true },
              lastLoginAt: { type: "string", format: "date-time" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Article: {
            type: "object",
            properties: {
              _id: { type: "string", example: "507f1f77bcf86cd799439011" },
              title: {
                type: "string",
                example: "Getting Started with TypeScript",
              },
              slug: {
                type: "string",
                example: "getting-started-with-typescript",
              },
              excerpt: {
                type: "string",
                example: "Learn TypeScript basics in this comprehensive guide.",
              },
              content: {
                type: "string",
                example: "<p>Full article content...</p>",
              },
              coverImage: {
                type: "string",
                format: "uri",
                example: "https://example.com/cover.jpg",
              },
              author: { $ref: "#/components/schemas/User" },
              category: { $ref: "#/components/schemas/Category" },
              tags: {
                type: "array",
                items: { type: "string" },
                example: ["typescript", "javascript", "programming"],
              },
              status: {
                type: "string",
                enum: ["draft", "published", "archived"],
                example: "published",
              },
              publishedAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00Z",
              },
              readTime: { type: "number", example: 5 },
              views: { type: "number", example: 1250 },
              likes: { type: "number", example: 42 },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Category: {
            type: "object",
            properties: {
              _id: { type: "string", example: "507f1f77bcf86cd799439012" },
              name: { type: "string", example: "Technology" },
              slug: { type: "string", example: "technology" },
              description: {
                type: "string",
                example: "Technology articles and tutorials",
              },
              color: { type: "string", example: "#3B82F6" },
              icon: { type: "string", example: "laptop" },
              parent: {
                type: "string",
                nullable: true,
                example: "507f1f77bcf86cd799439013",
              },
              order: { type: "number", example: 1 },
              isActive: { type: "boolean", example: true },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Media: {
            type: "object",
            properties: {
              _id: { type: "string", example: "507f1f77bcf86cd799439014" },
              filename: { type: "string", example: "image.jpg" },
              originalName: { type: "string", example: "my-photo.jpg" },
              mimeType: { type: "string", example: "image/jpeg" },
              size: { type: "number", example: 1024000 },
              url: {
                type: "string",
                format: "uri",
                example: "https://example.com/uploads/image.jpg",
              },
              alt: { type: "string", example: "A beautiful landscape" },
              width: { type: "number", example: 1920 },
              height: { type: "number", example: 1080 },
              uploadedBy: { $ref: "#/components/schemas/User" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          Newsletter: {
            type: "object",
            properties: {
              _id: { type: "string", example: "507f1f77bcf86cd799439015" },
              email: {
                type: "string",
                format: "email",
                example: "subscriber@example.com",
              },
              isActive: { type: "boolean", example: true },
              subscribedAt: { type: "string", format: "date-time" },
              unsubscribedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
            },
          },
          PaginationMeta: {
            type: "object",
            properties: {
              page: { type: "number", example: 1 },
              limit: { type: "number", example: 10 },
              total: { type: "number", example: 100 },
              totalPages: { type: "number", example: 10 },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
  },
};

export const swaggerSpec = swaggerJsdoc(swaggerConfig.options);

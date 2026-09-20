import { StoragePath } from "../models/StoragePath";
import { User } from "../models/User";
import { Publication } from "../models/Publication";
import { ReadingProgress } from "../models/ReadingProgress";
import mongoose, { Types } from "mongoose";

describe("Phase 4: Database Schema, Index & Constraint Validation", () => {
  describe("Index Definition Integrity", () => {
    it("should define unique index on StoragePath path attribute", () => {
      const pathIndex = StoragePath.schema.indexes().find((idx) => {
        const fields = idx[0];
        return "path" in fields;
      });

      // Path field has unique: true in schema definition
      const pathConfig = StoragePath.schema.path("path") as any;
      expect(pathConfig.options.unique).toBe(true);
    });

    it("should define unique index on User email attribute", () => {
      const emailConfig = User.schema.path("email") as any;
      expect(emailConfig.options.unique).toBe(true);
    });

    it("should define compound index on ReadingProgress user and resourceId", () => {
      const indexes = ReadingProgress.schema.indexes();
      const hasCompoundUserResource = indexes.some((idx) => {
        const fields = idx[0];
        return "user" in fields && "resourceId" in fields;
      });
      expect(hasCompoundUserResource).toBe(true);
    });
  });

  describe("Soft-Delete & Field Validation Rules", () => {
    it("should have isDeleted field defaulted to false on StoragePath schema", () => {
      const isDeletedField = StoragePath.schema.path("isDeleted") as any;
      expect(isDeletedField).toBeDefined();
      expect(isDeletedField.options.default).toBe(false);
    });

    it("should have isActive field defaulted to true on User schema", () => {
      const isActiveField = User.schema.path("isActive") as any;
      expect(isActiveField).toBeDefined();
      expect(isActiveField.options.default).toBe(true);
    });

    it("should validate ObjectId foreign references on Publication publisher", () => {
      const publisherField = Publication.schema.path("publisher") as any;
      expect(publisherField).toBeDefined();
      expect(publisherField.instance).toBe("ObjectId");
    });
  });
});

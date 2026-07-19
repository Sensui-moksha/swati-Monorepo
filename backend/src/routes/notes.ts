import { Router } from "express";
import { noteController } from "../controllers/noteController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
  noteIdSchema,
} from "../validators/notes";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createNoteSchema),
  noteController.createNote.bind(noteController),
);
router.get(
  "/",
  authenticate,
  validate(noteQuerySchema),
  noteController.getNotes.bind(noteController),
);
router.get(
  "/pinned",
  authenticate,
  noteController.getPinnedNotes.bind(noteController),
);
router.get(
  "/tags",
  authenticate,
  noteController.getAllTags.bind(noteController),
);
router.get(
  "/count",
  authenticate,
  noteController.getNoteCount.bind(noteController),
);
router.get(
  "/:noteId",
  authenticate,
  validate(noteIdSchema),
  noteController.getNote.bind(noteController),
);
router.put(
  "/:noteId",
  authenticate,
  validate(updateNoteSchema),
  noteController.updateNote.bind(noteController),
);
router.post(
  "/:noteId/pin",
  authenticate,
  validate(noteIdSchema),
  noteController.togglePin.bind(noteController),
);
router.delete(
  "/:noteId",
  authenticate,
  validate(noteIdSchema),
  noteController.deleteNote.bind(noteController),
);

export default router;

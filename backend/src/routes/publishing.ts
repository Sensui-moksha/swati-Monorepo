import { Router } from "express";
import { protect, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { bookController } from "../controllers/bookController";
import { publicationController } from "../controllers/publicationController";
import { magazineIssueController } from "../controllers/magazineIssueController";
import { authorController } from "../controllers/authorController";
import { publisherController } from "../controllers/publisherController";
import { genreController } from "../controllers/genreController";
import { seriesController } from "../controllers/seriesController";
import { collectionController } from "../controllers/collectionController";
import {
  createBookSchema,
  updateBookSchema,
  createPublicationSchema,
  updatePublicationSchema,
  createMagazineIssueSchema,
  updateMagazineIssueSchema,
  createAuthorSchema,
  updateAuthorSchema,
  createPublisherSchema,
  updatePublisherSchema,
  createGenreSchema,
  updateGenreSchema,
  createSeriesSchema,
  updateSeriesSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "../validators/publishingValidators";

const router = Router();

router.get("/books/featured", bookController.getFeaturedBooks);
router.get("/books/trending", bookController.getTrendingBooks);
router.get("/books/new", bookController.getNewReleases);
router.get("/books/popular", bookController.getPopularBooks);
router.get("/books/category/:categoryId", bookController.getBooksByCategory);
router.get("/books/genre/:genreId", bookController.getBooksByGenre);
router.get("/books/author/:authorId", bookController.getBooksByAuthor);
router.get("/books/publisher/:publisherId", bookController.getBooksByPublisher);
router.get("/books/related/:bookId", bookController.getRelatedBooks);
router.get("/books/slug/:slug", bookController.getBookBySlug);
router.get("/books/:id", bookController.getBook);
router.get("/books", bookController.listBooks);
router.post(
  "/books",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createBookSchema),
  bookController.createBook,
);
router.put(
  "/books/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updateBookSchema),
  bookController.updateBook,
);
router.delete(
  "/books/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  bookController.deleteBook,
);
router.post(
  "/books/:id/restore",
  protect,
  authorize("admin"),
  bookController.restoreBook,
);

router.get("/publications/latest", publicationController.getLatestPublications);
router.get(
  "/publications/archive",
  publicationController.getArchivedPublications,
);
router.get(
  "/publications/slug/:slug",
  publicationController.getPublicationBySlug,
);
router.get("/publications/:id", publicationController.getPublication);
router.get("/publications", publicationController.listPublications);
router.post(
  "/publications",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createPublicationSchema),
  publicationController.createPublication,
);
router.put(
  "/publications/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updatePublicationSchema),
  publicationController.updatePublication,
);
router.delete(
  "/publications/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  publicationController.deletePublication,
);
router.post(
  "/publications/:id/restore",
  protect,
  authorize("admin"),
  publicationController.restorePublication,
);

router.get(
  "/magazine-issues/current",
  magazineIssueController.getCurrentIssues,
);
router.get(
  "/magazine-issues/archive",
  magazineIssueController.getArchivedIssues,
);
router.get(
  "/magazine-issues/slug/:slug",
  magazineIssueController.getIssueBySlug,
);
router.get("/magazine-issues/:id", magazineIssueController.getIssue);
router.get("/magazine-issues", magazineIssueController.listIssues);
router.post(
  "/magazine-issues",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createMagazineIssueSchema),
  magazineIssueController.createIssue,
);
router.put(
  "/magazine-issues/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updateMagazineIssueSchema),
  magazineIssueController.updateIssue,
);
router.delete(
  "/magazine-issues/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  magazineIssueController.deleteIssue,
);
router.post(
  "/magazine-issues/:id/restore",
  protect,
  authorize("admin"),
  magazineIssueController.restoreIssue,
);

router.get("/authors/featured", authorController.getFeaturedAuthors);
router.get("/authors/slug/:slug", authorController.getAuthorBySlug);
router.get("/authors/:id", authorController.getAuthor);
router.get("/authors", authorController.listAuthors);
router.post(
  "/authors",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createAuthorSchema),
  authorController.createAuthor,
);
router.put(
  "/authors/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updateAuthorSchema),
  authorController.updateAuthor,
);
router.delete(
  "/authors/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  authorController.deleteAuthor,
);
router.post(
  "/authors/:id/restore",
  protect,
  authorize("admin"),
  authorController.restoreAuthor,
);

router.get("/publishers/featured", publisherController.getFeaturedPublishers);
router.get("/publishers/slug/:slug", publisherController.getPublisherBySlug);
router.get("/publishers/:id", publisherController.getPublisher);
router.get("/publishers", publisherController.listPublishers);
router.post(
  "/publishers",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createPublisherSchema),
  publisherController.createPublisher,
);
router.put(
  "/publishers/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updatePublisherSchema),
  publisherController.updatePublisher,
);
router.delete(
  "/publishers/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  publisherController.deletePublisher,
);
router.post(
  "/publishers/:id/restore",
  protect,
  authorize("admin"),
  publisherController.restorePublisher,
);

router.get("/genres/slug/:slug", genreController.getGenreBySlug);
router.get("/genres/:id", genreController.getGenre);
router.get("/genres", genreController.listGenres);
router.post(
  "/genres",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createGenreSchema),
  genreController.createGenre,
);
router.put(
  "/genres/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updateGenreSchema),
  genreController.updateGenre,
);
router.delete(
  "/genres/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  genreController.deleteGenre,
);
router.post(
  "/genres/:id/restore",
  protect,
  authorize("admin"),
  genreController.restoreGenre,
);

router.get("/series/slug/:slug", seriesController.getSeriesBySlug);
router.get("/series/:id", seriesController.getSeries);
router.get("/series", seriesController.listSeries);
router.post(
  "/series",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createSeriesSchema),
  seriesController.createSeries,
);
router.put(
  "/series/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updateSeriesSchema),
  seriesController.updateSeries,
);
router.delete(
  "/series/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  seriesController.deleteSeries,
);
router.post(
  "/series/:id/restore",
  protect,
  authorize("admin"),
  seriesController.restoreSeries,
);

router.get(
  "/collections/featured",
  collectionController.getFeaturedCollections,
);
router.get("/collections/slug/:slug", collectionController.getCollectionBySlug);
router.get("/collections/:id", collectionController.getCollection);
router.get("/collections", collectionController.listCollections);
router.post(
  "/collections",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(createCollectionSchema),
  collectionController.createCollection,
);
router.put(
  "/collections/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  validate(updateCollectionSchema),
  collectionController.updateCollection,
);
router.delete(
  "/collections/:id",
  protect,
  authorize("admin", "publisher", "editor"),
  collectionController.deleteCollection,
);
router.post(
  "/collections/:id/restore",
  protect,
  authorize("admin"),
  collectionController.restoreCollection,
);

export default router;

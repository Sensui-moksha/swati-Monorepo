// Re-export with explicit naming to avoid conflicts
export { User } from "./User";
export type {
  IUser,
  IUserModel,
  IUserProfile,
  IUserPreferences,
  IReadingStats,
  ISubscription,
} from "./User";
export { Category } from "./Category";
export type { ICategory, ICategoryModel } from "./Category";
export { Media } from "./Media";
export type { IMedia, IMediaModel, MediaType } from "./Media";
export { Article } from "./Article";
export type { IArticle, IArticleModel, ArticleStatus } from "./Article";
export { ArticleVersion } from "./ArticleVersion";
export type { IArticleVersion, IArticleVersionModel } from "./ArticleVersion";
export { EditorialComment } from "./EditorialComment";
export type {
  IEditorialComment,
  IEditorialCommentModel,
  EditorialCommentStatus,
} from "./EditorialComment";
export { Tag } from "./Tag";
export type { ITag, ITagModel } from "./Tag";
export { Newsletter } from "./Newsletter";
export type {
  INewsletter,
  INewsletterModel,
  NewsletterStatus,
} from "./Newsletter";
export { Plan } from "./Plan";
export type { IPlan, IPlanModel } from "./Plan";
export { CommerceSubscription } from "./CommerceSubscription";
export type {
  ICommerceSubscription,
  ICommerceSubscriptionModel,
} from "./CommerceSubscription";
export { CommerceOrder } from "./CommerceOrder";
export type { ICommerceOrder, ICommerceOrderModel } from "./CommerceOrder";
export { CommercePayment } from "./CommercePayment";
export type {
  ICommercePayment,
  ICommercePaymentModel,
} from "./CommercePayment";
export { CommerceInvoice } from "./CommerceInvoice";
export type {
  ICommerceInvoice,
  ICommerceInvoiceModel,
} from "./CommerceInvoice";
export { CommerceCoupon } from "./CommerceCoupon";
export type { ICommerceCoupon, ICommerceCouponModel } from "./CommerceCoupon";
export { CommercePromotion } from "./CommercePromotion";
export type {
  ICommercePromotion,
  ICommercePromotionModel,
} from "./CommercePromotion";
export { WebhookLog } from "./WebhookLog";
export type { IWebhookLog, IWebhookLogModel } from "./WebhookLog";

// User Module Models
export { Bookmark } from "./Bookmark";
export type { IBookmark, IBookmarkModel, BookmarkType } from "./Bookmark";
export { Favorite } from "./Favorite";
export type { IFavorite, IFavoriteModel, FavoriteType } from "./Favorite";
export { ReadingHistory } from "./ReadingHistory";
export type { IReadingHistory, IReadingHistoryModel } from "./ReadingHistory";
export { ReadingProgress } from "./ReadingProgress";
export type {
  IReadingProgress,
  IReadingProgressModel,
} from "./ReadingProgress";
export { Note } from "./Note";
export type { INote, INoteModel } from "./Note";
export { Highlight } from "./Highlight";
export type { IHighlight, IHighlightModel } from "./Highlight";
export { Notification } from "./Notification";
export type {
  INotification,
  INotificationModel,
  NotificationType,
} from "./Notification";

// Product Module Models
export { Product } from "./Product";
export type { IProduct, IProductModel } from "./Product";
export { ProductVariant } from "./ProductVariant";
export type { IProductVariant, IProductVariantModel } from "./ProductVariant";
export { ProductCategory } from "./ProductCategory";
export type { IProductCategory, IProductCategoryModel } from "./ProductCategory";

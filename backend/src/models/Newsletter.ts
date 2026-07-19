import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type NewsletterStatus =
  "subscribed" | "unsubscribed" | "pending" | "bounced" | "complained";

export interface INewsletter extends Document {
  email: string;
  name?: string;
  status: NewsletterStatus;
  source?: string;
  tags: (Types.ObjectId | ITag)[];
  preferences: {
    frequency: "daily" | "weekly" | "monthly" | "breaking";
    categories: (Types.ObjectId | ICategory)[];
    topics: string[];
    format: "html" | "text";
  };
  subscribedAt?: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  unsubscribedReason?: string;
  bouncedAt?: Date;
  bounceCount: number;
  lastEmailSentAt?: Date;
  lastEmailOpenedAt?: Date;
  lastEmailClickedAt?: Date;
  confirmationToken?: string;
  confirmationTokenExpires?: Date;
  unsubscribeToken?: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  isActive?: boolean;
  isConfirmed?: boolean;
}

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface INewsletterModel extends Model<INewsletter> {
  findByEmail(email: string): Promise<INewsletter | null>;
  findActive(): Promise<INewsletter[]>;
  findByStatus(status: NewsletterStatus): Promise<INewsletter[]>;
  findByTag(tagId: Types.ObjectId): Promise<INewsletter[]>;
  findByCategory(categoryId: Types.ObjectId): Promise<INewsletter[]>;
  findPendingConfirmation(): Promise<INewsletter[]>;
  findBounced(threshold?: number): Promise<INewsletter[]>;
  confirmSubscription(token: string): Promise<INewsletter | null>;
  unsubscribe(token: string): Promise<INewsletter | null>;
  recordBounce(email: string): Promise<INewsletter | null>;
  recordOpen(email: string): Promise<INewsletter | null>;
  recordClick(email: string): Promise<INewsletter | null>;
  recordEmailSent(email: string): Promise<INewsletter | null>;
}

const newsletterSchema = new Schema<INewsletter, INewsletterModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed", "pending", "bounced", "complained"],
      default: "pending",
    },
    source: {
      type: String,
      trim: true,
      maxlength: [100, "Source cannot exceed 100 characters"],
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    preferences: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "breaking"],
        default: "weekly",
      },
      categories: [
        {
          type: Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      topics: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      format: {
        type: String,
        enum: ["html", "text"],
        default: "html",
      },
    },
    subscribedAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    unsubscribedAt: {
      type: Date,
    },
    unsubscribedReason: {
      type: String,
      trim: true,
      maxlength: [500, "Unsubscribe reason cannot exceed 500 characters"],
    },
    bouncedAt: {
      type: Date,
    },
    bounceCount: {
      type: Number,
      default: 0,
      min: [0, "Bounce count cannot be negative"],
    },
    lastEmailSentAt: {
      type: Date,
    },
    lastEmailOpenedAt: {
      type: Date,
    },
    lastEmailClickedAt: {
      type: Date,
    },
    confirmationToken: {
      type: String,
      select: false,
    },
    confirmationTokenExpires: {
      type: Date,
      select: false,
    },
    unsubscribeToken: {
      type: String,
      select: false,
    },
    metadata: {
      ipAddress: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
      referrer: {
        type: String,
        trim: true,
      },
      utmSource: {
        type: String,
        trim: true,
      },
      utmMedium: {
        type: String,
        trim: true,
      },
      utmCampaign: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });
newsletterSchema.index({ confirmedAt: -1 });
newsletterSchema.index({ "preferences.frequency": 1 });
newsletterSchema.index({ "preferences.categories": 1 });
newsletterSchema.index({ confirmationToken: 1 });
newsletterSchema.index({ unsubscribeToken: 1 });
newsletterSchema.index({ bounceCount: 1 });

// Virtual for isActive
newsletterSchema.virtual("isActive").get(function (this: INewsletter) {
  return this.status === "subscribed" && this.confirmedAt !== undefined;
});

// Virtual for isConfirmed
newsletterSchema.virtual("isConfirmed").get(function (this: INewsletter) {
  return this.confirmedAt !== undefined;
});

// Pre-save middleware
newsletterSchema.pre("save", function (next) {
  // Set subscribedAt when status changes to subscribed
  if (
    this.isModified("status") &&
    this.status === "subscribed" &&
    !this.subscribedAt
  ) {
    this.subscribedAt = new Date();
  }

  // Set confirmedAt when status changes from pending to subscribed
  if (
    this.isModified("status") &&
    this.status === "subscribed" &&
    this.isModified("confirmedAt") === false
  ) {
    if (!this.confirmedAt) {
      this.confirmedAt = new Date();
    }
  }

  // Set unsubscribedAt when status changes to unsubscribed
  if (
    this.isModified("status") &&
    this.status === "unsubscribed" &&
    !this.unsubscribedAt
  ) {
    this.unsubscribedAt = new Date();
  }

  // Set bouncedAt when bounceCount increases
  if (
    this.isModified("bounceCount") &&
    this.bounceCount > 0 &&
    !this.bouncedAt
  ) {
    this.bouncedAt = new Date();
  }

  next();
});

// Static method to find by email
newsletterSchema.statics.findByEmail = function (
  email: string,
): Promise<INewsletter | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active subscribers
newsletterSchema.statics.findActive = function (): Promise<INewsletter[]> {
  return this.find({ status: "subscribed", confirmedAt: { $ne: null } }).sort({
    subscribedAt: -1,
  });
};

// Static method to find by status
newsletterSchema.statics.findByStatus = function (
  status: NewsletterStatus,
): Promise<INewsletter[]> {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find by tag
newsletterSchema.statics.findByTag = function (
  tagId: Types.ObjectId,
): Promise<INewsletter[]> {
  return this.find({ tags: tagId, status: "subscribed" }).sort({
    subscribedAt: -1,
  });
};

// Static method to find by category
newsletterSchema.statics.findByCategory = function (
  categoryId: Types.ObjectId,
): Promise<INewsletter[]> {
  return this.find({
    "preferences.categories": categoryId,
    status: "subscribed",
  }).sort({ subscribedAt: -1 });
};

// Static method to find pending confirmations
newsletterSchema.statics.findPendingConfirmation = function (): Promise<
  INewsletter[]
> {
  return this.find({
    status: "pending",
    confirmationTokenExpires: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Static method to find bounced emails
newsletterSchema.statics.findBounced = function (
  threshold: number = 3,
): Promise<INewsletter[]> {
  return this.find({ bounceCount: { $gte: threshold } }).sort({
    bounceCount: -1,
  });
};

// Static method to confirm subscription
newsletterSchema.statics.confirmSubscription = function (
  token: string,
): Promise<INewsletter | null> {
  return this.findOneAndUpdate(
    {
      confirmationToken: token,
      confirmationTokenExpires: { $gt: new Date() },
      status: "pending",
    },
    {
      $set: {
        status: "subscribed",
        confirmedAt: new Date(),
        confirmationToken: undefined,
        confirmationTokenExpires: undefined,
      },
    },
    { new: true },
  );
};

// Static method to unsubscribe
newsletterSchema.statics.unsubscribe = function (
  token: string,
): Promise<INewsletter | null> {
  return this.findOneAndUpdate(
    { unsubscribeToken: token },
    {
      $set: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        unsubscribeToken: undefined,
      },
    },
    { new: true },
  );
};

// Static method to record bounce
newsletterSchema.statics.recordBounce = function (
  email: string,
): Promise<INewsletter | null> {
  return this.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $inc: { bounceCount: 1 },
      $set: { bouncedAt: new Date() },
    },
    { new: true },
  );
};

// Static method to record email open
newsletterSchema.statics.recordOpen = function (
  email: string,
): Promise<INewsletter | null> {
  return this.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { lastEmailOpenedAt: new Date() } },
    { new: true },
  );
};

// Static method to record email click
newsletterSchema.statics.recordClick = function (
  email: string,
): Promise<INewsletter | null> {
  return this.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { lastEmailClickedAt: new Date() } },
    { new: true },
  );
};

// Static method to record email sent
newsletterSchema.statics.recordEmailSent = function (
  email: string,
): Promise<INewsletter | null> {
  return this.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { lastEmailSentAt: new Date() } },
    { new: true },
  );
};

export const Newsletter = mongoose.model<INewsletter, INewsletterModel>(
  "Newsletter",
  newsletterSchema,
);

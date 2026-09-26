import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IPortfolioProject {
  title: string;
  description: string;
  link: string;
  image: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  bio: string;
  skills: string[];
  profilePhoto: string;

  portfolio: IPortfolioProject[];

  createdAt: Date;
  updatedAt: Date;
}

const portfolioProjectSchema =
  new Schema<IPortfolioProject>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      link: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: true,
    }
  );

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    skills: {
      type: [String],
      default: [],
    },

    profilePhoto: {
      type: String,
      default: "",
      trim: true,
    },

    portfolio: {
      type: [portfolioProjectSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>(
  "User",
  userSchema
);

export default User;
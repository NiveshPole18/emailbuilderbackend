import mongoose from "mongoose"

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    config: {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      imageUrl: {
        type: String,
        default: "",
      },
      footer: {
        type: String,
        default: "",
      },
      styles: {
        titleColor: {
          type: String,
          default: "#000000",
        },
        contentColor: {
          type: String,
          default: "#333333",
        },
        backgroundColor: {
          type: String,
          default: "#ffffff",
        },
        fontSize: {
          type: String,
          default: "16px",
        },
      },
    },
  },
  {
    timestamps: true,
  },
)

export const Template = mongoose.model("Template", templateSchema)


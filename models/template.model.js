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
      },
      content: {
        type: String,
        required: true,
      },
      imageUrl: String,
      footer: String,
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
    // Make layout optional since we're using a default layout
    layout: {
      type: String,
      default: "default",
    },
  },
  {
    timestamps: true,
  },
)

export const Template = mongoose.model("Template", templateSchema)


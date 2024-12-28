import { client } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const database = client.db("coffee-store");
const Coffee = database.collection("coffee");

const addCoffee = asyncHandler(async (req, res) => {
  try {
    const { name, chef, supplier, taste, category, details } = req.body;
    if (
      !name ||
      !chef ||
      !supplier ||
      !taste ||
      !category ||
      !details ||
      !req.file
    ) {
      throw new ApiError(404, "All fields are required");
    }
    const coffeeImage = await uploadOnCloudinary(req.file.path);

    if (!coffeeImage.url) {
      throw new ApiError(404, "Image link is required");
    }

    const coffeeDoc = {
      name,
      chef,
      supplier,
      taste,
      category,
      details,
      photo: coffeeImage?.url,
    };

    const result = await Coffee.insertOne(coffeeDoc);

    const addedCoffee = await Coffee.findOne({ _id: result.insertedId });
    if (!addedCoffee) {
      throw new ApiError(
        500,
        "Something went wrong while added coffee details"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          addedCoffee,
          "Successfully Added Coffee Details!!!"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while added coffee details"
    );
  }
});

export const CoffeeController = { addCoffee };

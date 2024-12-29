import { ObjectId } from "mongodb";
import { client } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const database = client.db("coffee-store");
const Coffee = database.collection("coffee");

const addCoffee = asyncHandler(async (req, res) => {
  try {
    const { name, chef, supplier, taste, category, details, price } = req.body;
    if (
      !name ||
      !chef ||
      !supplier ||
      !taste ||
      !category ||
      !details ||
      !price ||
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
      price: parseInt(price),
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

const getAllCoffee = asyncHandler(async (req, res) => {
  const cursor = Coffee.find();
  const coffees = await cursor.toArray();

  return res
    .status(200)
    .json(new ApiResponse(200, coffees, "Successfully Fatched Coffee!!!"));
});

const getACoffee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coffee = await Coffee.findOne({ _id: new ObjectId(id) });

  return res
    .status(200)
    .json(new ApiResponse(200, coffee, "Coffee Fetched Successfully!!!"));
});

const updateCoffeeDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coffeeDetails = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      name: coffeeDetails.name,
      chef: coffeeDetails.chef,
      supplier: coffeeDetails.supplier,
      taste: coffeeDetails.taste,
      category: coffeeDetails.category,
      details: coffeeDetails.details,
      price: coffeeDetails.price,
    },
  };

  const option = { upsert: true };

  const result = await Coffee.updateOne(filter, updateDoc, option);
  if (result.modifiedCount > 0) {
    const updatedCoffee = await Coffee.findOne({ _id: new ObjectId(id) });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCoffee,
          "Coffee Details Updated Successfully!!!"
        )
      );
  } else {
    throw new ApiError(
      500,
      "Something went wrong while updating the coffee details"
    );
  }
});

const deleteACoffee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await Coffee.deleteOne(query);

  if (result.deletedCount > 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully Deleted The Coffee!!!"));
  } else {
    throw new ApiError(
      500,
      "Something went wrong while deleting the coffee!!!"
    );
  }
});

export const CoffeeController = {
  addCoffee,
  getAllCoffee,
  getACoffee,
  updateCoffeeDetails,
  deleteACoffee,
};

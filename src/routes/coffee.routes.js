import { Router } from "express";
import { CoffeeController } from "../controllers/coffee.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/add-coffee")
  .post(upload.single("photo"), CoffeeController.addCoffee);

export default router;

import { Router } from "express";
import { CoffeeController } from "../controllers/coffee.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/add-coffee")
  .post(upload.single("photo"), CoffeeController.addCoffee);

router.route("/all-coffee").get(CoffeeController.getAllCoffee);
router.route("/details/:id").get(CoffeeController.getACoffee);
router.route("/update-details/:id").patch(CoffeeController.updateCoffeeDetails);
router.route("/delete/:id").delete(CoffeeController.deleteACoffee);

export default router;

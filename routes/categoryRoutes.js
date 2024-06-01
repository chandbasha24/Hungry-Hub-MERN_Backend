import express from "express";
import mongoose from "mongoose"; 
import { isAdmin, requireSignIn } from "./../middlewares/authMiddleware.js";
import { categoryController, createCategoryController, 
    deleteCategoryController, singleCategoryController,
     updateCategoryController } from "../controllers/categoryController.js";

const router = express.Router();

// Routes

//create category



router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//create category

router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//getALL  category 
router.get('/get-category',categoryController)

//single category 
router.get("/single-category/:slug",singleCategoryController)

//Delete Category

router.delete("/delete-category/:id",requireSignIn,isAdmin,deleteCategoryController)

export default router;

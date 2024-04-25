const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createCategory,
  getCategory,
  searchCategory,
  deleteCategory,
  updateCategory,    
} = require("../controllers/categoriescontroller");

const router = express.Router();

// Define user routes
router.post("/mastersettings/category", verifyToken, createCategory);
router.get("/mastersettings/category", verifyToken, getCategory);
router.post("/mastersettings/searchcategory", verifyToken, searchCategory);
router.delete("/mastersettings/deletecategory", verifyToken, deleteCategory);
router.put("/mastersettings/updatecategory", verifyToken, updateCategory);

module.exports = router;

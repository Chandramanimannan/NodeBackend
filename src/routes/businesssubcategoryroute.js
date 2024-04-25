const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createBusinesssubcategory,
  getBusinesssubcategory,
  searchBusinesssubcategory,
  deleteBusinesssubcategory,
  updateBusinesssubcategory,    
} = require("../controllers/businesssubcategoriescontroller");

const router = express.Router();

router.post("/mastersettings/businesssubcategory", verifyToken, createBusinesssubcategory);
router.get("/mastersettings/businesssubcategory", verifyToken, getBusinesssubcategory);
router.post("/mastersettings/searchbusinesssubcategory", verifyToken, searchBusinesssubcategory);
router.delete("/mastersettings/deletebusinesssubcategory", verifyToken, deleteBusinesssubcategory);
router.put("/mastersettings/updatebusinesssubcategory", verifyToken, updateBusinesssubcategory);

module.exports = router;

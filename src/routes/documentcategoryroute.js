const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createDocumentcategory,
  getDocumentcategory,
  searchDocumentcategory,
  deleteDocumentcategory,
  updateDocumentcategory,    
} = require("../controllers/documentcategoriescontroller");

const router = express.Router();

router.post("/mastersettings/documentcategory", verifyToken, createDocumentcategory);
router.get("/mastersettings/documentcategory", verifyToken, getDocumentcategory);
router.post("/mastersettings/searchdocumentcategory", verifyToken, searchDocumentcategory);
router.delete("/mastersettings/deletedocumentcategory", verifyToken, deleteDocumentcategory);
router.put("/mastersettings/updatedocumentcategory", verifyToken, updateDocumentcategory);

module.exports = router;

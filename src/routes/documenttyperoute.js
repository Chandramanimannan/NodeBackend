const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createDocumenttype,
  getDocumenttype,
  searchDocumenttype,
  deleteDocumenttype,
  updateDocumenttype,    
} = require("../controllers/documenttypescontroller");

const router = express.Router();

router.post("/mastersettings/documenttype", verifyToken, createDocumenttype);
router.get("/mastersettings/documenttype", verifyToken, getDocumenttype);
router.post("/mastersettings/searchdocumenttype", verifyToken, searchDocumenttype);
router.delete("/mastersettings/deletedocumenttype", verifyToken, deleteDocumenttype);
router.put("/mastersettings/updatedocumenttype", verifyToken, updateDocumenttype);

module.exports = router;

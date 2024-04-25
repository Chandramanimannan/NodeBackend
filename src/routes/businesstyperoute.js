const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
    createBusinesstype,
    getBusinesstype,
    searchBusinesstype,
    deleteBusinesstype,
    updateBusinesstype,
} = require("../controllers/businesstypescontroller");

const router = express.Router();

// Define user routes
router.post("/mastersettings/businesstypes", verifyToken, createBusinesstype);
router.get("/mastersettings/businesstypes", verifyToken, getBusinesstype);
router.post("/mastersettings/searchbusinesstypes", verifyToken, searchBusinesstype);
router.delete("/mastersettings/deletebusinesstypes", verifyToken, deleteBusinesstype);
router.put("/mastersettings/updatebusinesstypes", verifyToken, updateBusinesstype);

module.exports = router;

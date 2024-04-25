const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata,
} = require("../controllers/livetransactiontablecontroller");

const router = express.Router();

router.get("/getlivedata", getLivedata);

module.exports = router;

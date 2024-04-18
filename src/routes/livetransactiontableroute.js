const express = require("express");

const {
  getLivedata,
} = require("../controllers/livetransactiontablecontroller");

const router = express.Router();

router.get("/getlivedata", getLivedata);

module.exports = router;

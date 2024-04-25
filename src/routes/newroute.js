const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { fun } = require("../controllers/newcontroller");

const router = express.Router();

router.post("/new", verifyToken, fun);

module.exports = router;

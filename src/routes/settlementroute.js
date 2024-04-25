const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  createSettlement,
  previewSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
  listSettlement,
  getCompanyList,
  getCurrenciesOfCompany,
  sendEmail,
  getCounts,
} = require("../controllers/settlementscontroller");

const router = express.Router();
const upload = multer();

router.post("/settlements", verifyToken, createSettlement);
router.post("/previewsettlement", verifyToken, previewSettlement);
router.get("/settlements", verifyToken, getSettlement);
router.put("/updatesettlements", verifyToken, updateSettlement);
router.get("/getsettlementrecordforpdf", verifyToken, getSettlementRecordforPDF);
router.get("/listsettlement", verifyToken, listSettlement);
router.get("/companylist", verifyToken, getCompanyList);
router.get("/currenciesforcompany", verifyToken, getCurrenciesOfCompany);
router.post("/sendemail", upload.single("attachment"), verifyToken, sendEmail);
router.get("/settlements/counts", verifyToken, getCounts);

module.exports = router;

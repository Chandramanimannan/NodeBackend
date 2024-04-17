const express = require("express");
const multer = require("multer");

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
} = require("../controllers/settlementscontroller");

const router = express.Router();
const upload = multer();

router.post("/settlements", createSettlement);
router.post("/previewsettlement", previewSettlement);
router.get("/settlements", getSettlement);
router.put("/updatesettlements", updateSettlement);
router.get("/getsettlementrecordforpdf", getSettlementRecordforPDF);
router.get("/listsettlement", listSettlement);
router.get("/companylist", getCompanyList);
router.get("/currenciesforcompany", getCurrenciesOfCompany);
router.post("/sendemail", upload.single("attachment"), sendEmail);

module.exports = router;

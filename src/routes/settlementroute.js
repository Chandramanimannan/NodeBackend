const express = require("express");
const {
  createSettlement,
  previewSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
  listSettlement,
  getCompanyList,
  getCurrenciesOfCompany,
} = require("../controllers/settlementscontroller");

const router = express.Router();

router.post("/settlements", createSettlement);
router.post("/previewsettlement", previewSettlement);
router.get("/settlements", getSettlement);
router.put("/updatesettlements", updateSettlement);
router.get("/getsettlementrecordforpdf", getSettlementRecordforPDF);
router.get("/listsettlement", listSettlement);
router.get("/companylist", getCompanyList);
router.get("/currenciesforcompany", getCurrenciesOfCompany);

module.exports = router;

require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
}

async function getLivedata(req, res) {
  try {
    const apiUrl = "https://centpays.com/apidoc/get_all_transaction";
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON response");
    }
    const apiData = await response.json();
    const data = apiData.data;

    // Get the last processed ID
    const lastProcessedRecord = await LiveTransactionTable.findOne().sort({
      livedata_id: -1,
    });
    console.log("lastProcessedRecord", lastProcessedRecord);
    const maxId = lastProcessedRecord ? lastProcessedRecord.livedata_id : 1;
    console.log("maxId", maxId);
    const newRecords = data.filter((item) => item.id > maxId);
    console.log(newRecords);
    const dataToStore = newRecords.map((item) => ({
      livedata_id: item.id,
      txnid: item.transactionId,
      merchantTxnId: item.mtxnID,
      merchant: item.merchant_name,
      amount: item.amount,
      fee: item.fee,
      merchant_fee: item.merchant_fee,
      backUrl: item.backUrl,
      merchant_id: item.merchant_id,
      transactiondate: formatDateTime(item.transaction_date),
      statusBKP: item.statusBKP,
      Status: item.status,
      isSettled: item.isSettled,
      settledDate: item.settledDate,
      settledTxnId: item.settledTxnId,
      settledAmount: item.settledAmount,
      router: item.router,
      description: item.description,
      email: item.email,
      currency: item.currency,
      env: item.env,
      mode: item.mode,
      paymentgateway: item.payment_mode,
      payment_id: item.payment_id,
      pg_order_key: item.order_key,
      message: item.message,
      webhook_id: item.webhook_id,
      requested_phone: item.requested_phone,
      orderNo: item.requested_orderNumber,
      cname: item.requested_name,
      tempUpdated: item.tempUpdated,
      is_admin_settled: item.is_admin_settled,
      admin_settled_date: item.admin_settled_date,
      admin_settled_amount: item.admin_settled_amount,
      cardtype: item.cardType,
      requestMode: item.requestMode,
      cardnumber: item.cardNo,
      cardExpire: item.cardExpire,
      cardCVC: item.cardCVC,
      pdate: item.pdate,
      country: item.country,
      dels: item.dels,
      web_url: item.web_url,
      mid: item.mid,
      from_temp: item.from_temp,
      accountHolder: item.accountHolder,
      accountBankCode: item.accountBankCode,
      accountNumber: item.accountNumber,
      birthDate: item.birthDate,
      internal_callback: item.internal_callback,
      internal_callback_time: item.internal_callback_time,
    }));

    await LiveTransactionTable.insertMany(dataToStore);

    // If a request is made to the endpoint, send the stored data as a response
    if (req && res) {
      res.json(dataToStore);
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    if (req && res) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

const interval = 3000; // 3 sec interval
setInterval(getLivedata, interval);

module.exports = { getLivedata };

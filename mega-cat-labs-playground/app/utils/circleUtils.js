require('dotenv').config();

const axios = require("axios");
const circleApiUrl = process.env.CIRCLE_API;
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid');
const token = "QVBJX0tFWTo5MDBmNDIwZmVmNTUwMDAzY2ZiM2E0ZTlmZmQxMDkwNDpkZWRiZTI5NDE5MTNiMGY1ODAxNjc2NjJiOWVjNjBiMg";
const merchantWalletID = "1000120134";
async function createTransfer(sellerAddress, amount) {
    if(!sellerAddress || !amount) {
        return false;
    }

    let success = false;
    const url = `${circleApiUrl}/v1/transfers`;
    const data = {
        "source": {
            "type": "wallet",
            "id": merchantWalletID
       },
       "destination": {
            "type": "blockchain",
            "chain": "ETH",
            "address": sellerAddress
       },
       "amount": {
            "currency": "USD",
            "amount": amount.toString(),
       },
       "idempotencyKey" : uuidv4()
    }
    await axios
        .post(
          url,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            console.log("transfer created successfuly", response.data);
            success = true;
        })
        .catch((error) => {
            console.log("error", error);
            success = false;
        });
};

module.exports = {
    createTransfer
}
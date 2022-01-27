/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import * as openpgp from 'openpgp/lightweight';
import { CardDetails } from './card-details';
import { EncryptedValue } from './encrypted-value';
import { RSAPublicKey } from './rsa-public-key';
import { HttpErrorResponse } from '@angular/common/http';
import { CardPaymentResponse } from './card-payment-response';
import { BillingDetails } from './billing-details';
import { BillingResponse } from './billing-response';
import { formatCurrency } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

    public static SANDBOX_CIRCLE_API_BASE_URI: string = 'https://api-sandbox.circle.com/v1';
    private static SANDBOX_BEARER_TOKEN = 'QVBJX0tFWTo5MDBmNDIwZmVmNTUwMDAzY2ZiM2E0ZTlmZmQxMDkwNDpkZWRiZTI5NDE5MTNiMGY1ODAxNjc2NjJiOWVjNjBiMg';

    constructor() { }

    public async getPCIPublicKey(): Promise<RSAPublicKey> {
        const options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${PaymentService.SANDBOX_BEARER_TOKEN}`
            }
        };

        const url = `${PaymentService.SANDBOX_CIRCLE_API_BASE_URI}/encryption/public`;
        return fetch(url, options).then(async (response) => {
          const json = await response.json();
          return json.data;
        }, (error) => {
          console.error('Error fetching public', error);
        });

    }

    public async encryptCardData(dataToEncrypt: CardDetails): Promise<EncryptedValue> {
      const rsaPublicKey = await this.getPCIPublicKey();

      const decodedPublicKey = atob(rsaPublicKey.publicKey);

      const publicKey = await openpgp.readKey({ armoredKey: decodedPublicKey });

      const message = await openpgp.createMessage({ text: JSON.stringify(dataToEncrypt) });

      const encrypted = await openpgp.encrypt({
          message,
          encryptionKeys: publicKey
      });

      const encryptedValue: EncryptedValue = new EncryptedValue(
          btoa(encrypted),
          rsaPublicKey.keyId
      );

      return encryptedValue;
    }

    public uuidv4() {
        // @ts-ignore
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            // eslint-disable-next-line no-bitwise
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    public async processPayment(billingDetails: BillingDetails, cardDetails: CardDetails): Promise<BillingResponse> {
      let card: CardPaymentResponse;
      try {
          card = await this.createCard(cardDetails, billingDetails);
      } catch (error) {
        console.error('Failed to create a card.', error);
        return new BillingResponse('failed', 'Payment failed due to unexpected error with registering card details.');
      }

      const metadata = {
        email: 'satoshi@circle.com',
        phoneNumber: '+14155555555',
        sessionId: 'xxx',
        ipAddress: '172.33.222.1'
      };

      // TODO: Fix amount issue. Circle has a lower limit of $0.50 USD.
      const amount = this.adjustAmount(billingDetails.amount);
      const amountMetdata = {
        'amount': amount,
        'currency': 'USD'
      };
      const source = {
        'id': card.id,
        'type': 'card'
      };
      const payload = {
        'metadata': metadata,
        'amount': amountMetdata,
        'autoCapture': true,
        'source': source,
        'verification': 'none',
        'description': 'Payment',
        'idempotencyKey': this.uuidv4(),
      };
      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PaymentService.SANDBOX_BEARER_TOKEN}`
        },
        body: JSON.stringify(payload)
      };

      const url = `${PaymentService.SANDBOX_CIRCLE_API_BASE_URI}/payments`;

      let paymentResponse;
      try {
        paymentResponse = await fetch(url, options);
        this.validateFetch(paymentResponse);
      } catch(error) {
        console.error('Failed to submit payment', error);
        return new BillingResponse('failed', 'Payment failed due to unexpected error' + error.message);
      }

      const json = await paymentResponse.json();
      return new BillingResponse(json.data.status, json.data.description);
    }

  /**
   * fetch() only rejects the promise if there was a network connectivity issue; it does NOT reject on 4XX or 5XX
   * responses. This method is a helper for handling those.
   */
  public validateFetch(fetchResponse) {
    if(!fetchResponse.ok) {
      const message = `Fetch failed: ${fetchResponse.statusText} for url ${fetchResponse.url}`;
      console.error(message);
      throw Error(fetchResponse.body);
    }
  }

  public async createCard(cardDetails: CardDetails, billingDetails: BillingDetails): Promise<CardPaymentResponse> {
    let encryptedCardDetails;
    try {
      encryptedCardDetails = await this.encryptCardData(cardDetails);
    } catch(error) {
      const message = 'Failed to encrypt card data.';
      console.error(message);
      throw new HttpErrorResponse({
        status: 500,
        statusText: message
      });
    }

    const billingDetailsPayload = {
        name: billingDetails.name,
        city: billingDetails.city,
        country: billingDetails.country,
        line1: billingDetails.line1,
        line2: billingDetails.line2,
        district: billingDetails.district,
        postalCode: billingDetails.postalCode
    };

    // TODO: Pull user metadata.
    const metadata = {
        email: 'satoshi@circle.com',
        phoneNumber: '+12025550180',
        sessionId: 'xxx',
        ipAddress: '172.33.222.1'
    };

    const payload = {
        idempotencyKey: this.uuidv4(),
        expMonth: billingDetails.expMonth,
        expYear: billingDetails.expYear,
        keyId: '',
        encryptedData: '',
        billingDetails: billingDetailsPayload,
        metadata: metadata,
    };

    payload.keyId = encryptedCardDetails.keyId;
    payload.encryptedData = encryptedCardDetails.encryptedData;

    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PaymentService.SANDBOX_BEARER_TOKEN}`
        },
        body: JSON.stringify(payload)
    };

    const url = `${PaymentService.SANDBOX_CIRCLE_API_BASE_URI}/cards`;
    let createCardResponse;
    try {
      createCardResponse = await fetch(url, options);
      this.validateFetch(createCardResponse);
    }
    catch(error) {
      const message = 'Failed to create card';
      console.error(message);
      throw new HttpErrorResponse({
        status: 500,
        statusText: message
      });
    }

    const json = await createCardResponse.json();
    return json.data;
  }

  private adjustAmount(amount: number) {
    let updatedAmount = amount;
    if(amount < 0.50) {
      updatedAmount = 0.50;
    }
    updatedAmount = +updatedAmount.toFixed(2);

    return updatedAmount;
  }
}



import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { PaymentService } from '../payment/payment.service';
import { WalletService } from '../wallet/wallet.service';
import { environment } from 'environments/environment';
import { ErrorsService } from '../errors/errors.service';
import { UpdateOfferSignatureResponseModel } from '../models/update-offer-signature-response.model';
import { OfferCreatedResponseModel } from '../models/offer-created-response.model';
import { PreparedApproveTx } from '../models/prepared-approve-tx.model';

// This interface and declaration  is necessary for typescript + web3 window behavior.
interface Web3Window extends Window {
  ethereum: any;
  web3: any;
}

declare let window: Web3Window;
const baseUrl = environment.apiUrl;
@Injectable()
export class VenlyService {
    window: any;
    activeAccount: string;
    hash: string;
    walletAddress: any;

    private _tokenContractAddress: string =
        '0xf29496580534fac023631f01d83197ba7a8d3762';
    constructor(private httpClient: HttpClient,
                private paymentService: PaymentService,
                private walletService: WalletService,
                private errorService: ErrorsService) {
    }

    getWallet() {
        return this.walletAddress;
    }

    getEthereum() {
        return window.ethereum;
    }

    getOfferDetails(offerId): Observable<any>  {
      const uri = `${baseUrl}/product/offer/${offerId}`;
      return this.httpClient.get(uri);
    }

    async updateOffer(offerCreatedResponse: OfferCreatedResponseModel) {
        const address = await this.walletService.currentAccount;

        if(offerCreatedResponse.transaction.length === 0) {
          console.log('No approval is necessary!');
          const offerId = offerCreatedResponse.offerId;
          const response: any = await this.getOfferDetails(offerId).toPromise();
          const result = await this.signData(response.data.dataToSign, this.addSignature, response.data.id, this.httpClient);
          return;
        } else {
          console.log('Approval is necessary for collection and wallet');
          await this.approve(
              offerCreatedResponse,
              this.approveTransaction,
              this.httpClient,
              this.addSignature,
              this.signData
          );
        }

        return address;
    };

    public async approve(data: OfferCreatedResponseModel, approveTransaction: (data, client, signature, signData) => Observable<any>, client, addSignature, signData) {
      const address = await this.walletService.currentAccount;
      const prepareApproveTx: PreparedApproveTx = data.transaction[0];
      const targetContractAddress = prepareApproveTx.to;
        try {
            const contract = new window.web3.eth.Contract(
                require('./ABI.json'),
                targetContractAddress
            );

            const addressInput = prepareApproveTx.inputs.find(input => input.type === 'address');
            const approvalAddress = addressInput.value;
            const method = contract.methods
            .setApprovalForAll(
              approvalAddress,
                true
            )
            .send({
              from: address
            });

            method
            .on('transactionHash', function(hash) {
                this.hash = hash;
                const formData = new FormData();
                formData.append('offerId', data.offerId);
                formData.append('hash', this.hash);
                approveTransaction.call(this, formData, client, addSignature, signData).subscribe(
                    (response) => {
                      console.log('ApproveTx response', response);
                    }
                );
            });

            method.on('confirmation', (response) => {
              console.log(`Confirmation! ${response}`);
            });

            method.on('receipt', (receipt) => {
              console.log(`Receipt! ${receipt}`);
            });

            method.on('error', (error, receipt) => {
              console.log(`ERROR!! ${error} with receipt ${receipt}`);
            });
        } catch (error) {
            const errorMessage = error.message;
            console.log(errorMessage);
        }
    };

    /**
     * Approve Transaction - Updates the Offer with the transaction hash where approval was made.
     */
    public approveTransaction(data, client, addSignature, signData): Observable<any> {
        return client.post(`${baseUrl}/product/offerTxApprove/`, data).pipe(
            switchMap((response: any) => {
                console.log('response', response.data);
                signData.call(this, response.data.result.dataToSign, addSignature, response.data.result.id, client);
                return of(response);
            })
        );
    }

    /**
     * Sign Data
     */
    public signData = async (data, addSignature, offerId, client)=> {
        const signature = await window.web3.eth.personal.sign(data, this.walletService.currentAccount);
        const formData = new FormData();
        formData.append('offerId', offerId);
        formData.append('dataToSign', signature);

        addSignature.call(this, formData, client).subscribe((signatureResponse: UpdateOfferSignatureResponseModel) => {
          this.processSignatureResponse(signatureResponse);
        });
    };

    /**
     * Add Signature
     */
    public addSignature(data, client): Observable<any> {
        return client.post(`${baseUrl}/product/offerSignature/`, data).pipe(
            switchMap((response: any) => {
                console.log(`Successfully listed for sale! ${response}`);
                return of(response);
            })
        );
    }

    private processSignatureResponse(signatureResponse: UpdateOfferSignatureResponseModel) {
        console.log('Processing signature response for approving offer listing', signatureResponse);
    }
}

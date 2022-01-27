import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from './product';
import { switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { WalletService } from '../wallet/wallet.service';
const baseUrl = environment.apiUrl;

@Injectable()
export class ProductService {
  constructor(private httpClient: HttpClient, private walletService: WalletService) {}

  createProduct(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/create/`, data);
  }
  createCollection(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/createCollection/`, data);
  }
  getCollections(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/getCollections/`, data);
  }

  getProduct(id): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/token/${id}`);
  }

  updateMetadata(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/updateMeta`,data);
  }

  getNFTMetadata(id): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/getNFtMedata/${id}`);
  }

  listingNFT(): Observable<any> {
    const walletAddress = this.walletService.currentAccount;

    return this.httpClient.get(
      `${baseUrl}/product/getNFTsBasedOnWalletAddress/${walletAddress}`
    );
  }

  /**
   * Creates an Offer (Listing) from an NFT.
   *
   * Returns the result of Get prepared Approve tx. If result is [], then no approval is required.
   * If the result is not, then approval is required.
   *
   * @param data
   */
  createForSale(data): Observable<any> {
    return this.httpClient.post(`${baseUrl}/product/createSaleOffer/`, data);
  }

  /**
   * Fetches all listings (offers) owned by Mega Cat Labs marketplace. Filtering must be implemented in UI.
   *
   * @returns An array of listings.
   */
  getAllListings(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/listSaleOffers`);
  }

  specificOffer(id: any): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/offer/${id}`);
  }

  getStats(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/product/getStats`);
  }

  getOrderHistory(): Observable<any> {
    return this.httpClient.get(`${baseUrl}/order/index`);
  }
}

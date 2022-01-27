import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { HttpClientModule } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { WalletService } from '../wallet/wallet.service';
import { Router } from '@angular/router';

const baseUrl = environment.apiUrl;
import { of } from 'rxjs';
describe('ProductService', () => {
    let walletService: WalletService;
    let service: ProductService;
    let httpMock: HttpTestingController;
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    routerMock.navigate.and.returnValue(of(false));
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [
                { provide: ProductService},
                {provide: WalletService},
                { provide: Router, useValue: routerMock }
            ],
        });
        service = TestBed.inject(ProductService);
        walletService = TestBed.inject(WalletService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create product correctly', (done) => {
        const responseObject = {
            product: 'some product',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const data = {
            name: 'Test NFT',
            description: 'Some description about the NFT',
            properties: [{ name: 'Some Name', value: 'Some Value' }],
            images: ['test1.png', 'test2.jpg'],
        };

        service.createProduct(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpMock.expectOne({
            url: `${baseUrl}/product/create/`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should get the NFTs listing correctly', (done) => {
        const responseObject = {
            nfts: []
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };

        service.listingNFT().subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpMock.expectOne({
            url: `${baseUrl}/product/getNFTsBasedOnWalletAddress/${walletService.currentAccount}`,
        });
        expect(requestWrapper.request.method).toEqual('GET');
        requestWrapper.flush(responseObject);
    });

    it('should create NFTs for sale correctly', (done) => {
        const responseObject = {
            product: 'some product',
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };

        const data = {
            tokenId: '#123',
            address: 'some address',
            sellerAddress: walletService.currentAccount,
            price:  0
        };

        service.createForSale(data).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpMock.expectOne({
            url: `${baseUrl}/product/createSaleOffer/`,
        });
        expect(requestWrapper.request.method).toEqual('POST');
        requestWrapper.flush(responseObject);
    });

    it('should get the NFTs offers correctly', (done) => {
        const responseObject = {
            nfts: []
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };

        service.getAllListings().subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpMock.expectOne({
            url: `${baseUrl}/product/listSaleOffers`,
        });
        expect(requestWrapper.request.method).toEqual('GET');
        requestWrapper.flush(responseObject);
    });

    it('should get the single offer correctly', (done) => {
        const responseObject = {
            stats: {}
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };
        const id = 1;

        service.specificOffer(id).subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpMock.expectOne({
            url: `${baseUrl}/product/offer/1`,
        });
        expect(requestWrapper.request.method).toEqual('GET');
        requestWrapper.flush(responseObject);
    });

    it('should get the user dashboard stats correctly', (done) => {
        const responseObject = {
            stats: {}
        };
        let response = null;
        const mockResponse = {
            status: '200',
        };

        service.getStats().subscribe(
            (receivedResponse: any) => {
                response = receivedResponse;
                expect(mockResponse.status.toString()).toEqual('200');
                done();
            },
            (error: any) => {}
        );
        const requestWrapper = httpMock.expectOne({
            url: `${baseUrl}/product/getStats`,
        });
        expect(requestWrapper.request.method).toEqual('GET');
        requestWrapper.flush(responseObject);
    });
});

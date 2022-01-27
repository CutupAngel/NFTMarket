import { Component, HostListener, OnInit } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { Product } from 'app/core/product/product';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalComponent } from 'app/modules/elements/modal/modal.component';
import { CartService } from 'app/core/cart/cart.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { Offer } from 'app/core/models/offer.model';

@Component({
    selector: 'app-collections',
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.scss'],
})
export class LandingCollectionsComponent implements OnInit {
    products: Product[] = [];
    saleNFTs: Product[] = [];
    searchForm: FormGroup;
    layout: string = 'large';
    sort: string = '';
    filter: any = {
        toggle: true,
        status: {
            'toggle': true,
            'buy-now': false,
            'action': false,
            'new': true
        },
        price: {
            toggle: false,
            from: null,
            to: null
        }
    };
    public modalRef: BsModalRef;

    constructor(
        private formBuilder: FormBuilder,
        private productService: ProductService,
        private cartService: CartService,
        private modalService: BsModalService,
        private errorsService: ErrorsService
    ) {}

    ngOnInit(): void {
        //Search Form
        this.searchForm = this.formBuilder.group({
            search: ['', Validators.required],
        });

        this.getSaleNFTs();
    }

    getSaleNFTs(): void {
        this.productService.getAllListings().subscribe((data: {
            data: Offer[];
        }) => {
            const distinctCollections = [];
            const listings = data.data.filter((listing: Offer) => listing.status === 'READY');

            listings.forEach((offer: Offer) => {
                const listing: any = Object.assign({}, offer);
                listing.metadata = offer.nft;
                listing.type = 'buy-now';
                listing.metadata.image = offer.nft.imageUrl;
                const contract = offer.nft.contract;
                const contractAddress =  contract.address;

                listing.collection = contract.name;
                listing.tokenId = offer.nft.id;

                if(distinctCollections.indexOf(contract.address) === -1) {
                  distinctCollections.push(contractAddress);
                }
                this.products.push(listing);
                this.saleNFTs.push(listing);
            });

            console.log(`Found ${this.products.length} products across ${distinctCollections.length} collections`);
        },
        () => {
            this.errorsService.openSnackBar('Something went wrong!', 'Error');
        });
    }

    //Search Products
    searchProducts(): void {
        if (this.searchForm.value.search !== '') {
            const filteredNFTs = this.products.filter(element => element.nft.name.toLowerCase().indexOf(this.searchForm.value.search.toLowerCase()) > -1);
            this.saleNFTs = filteredNFTs;
        }else{
            this.saleNFTs = this.products;
        }
    }

    //Filter Products
    filterProducts(): void {
        switch (this.sort) {
            case 'Listings(Latest)':
                this.saleNFTs.sort((a, b) => {
                    if (b.createdOn > a.createdOn) {return 1; };
                    if (b.createdOn < a.createdOn) {return -1; };
                });
                break;
            case 'Listings(Oldest)':
                this.saleNFTs.sort((a, b) => {
                    if (a.createdOn > b.createdOn) {return 1; };
                    if (a.createdOn < b.createdOn) {return -1; };
                });
                break;
            case 'Price(Highest)':
                this.saleNFTs = this.saleNFTs.sort(
                    (a, b) => Number(b.price) - Number(a.price)
                );
                break;
            case 'Price(Lowest)':
                this.saleNFTs = this.saleNFTs.sort(
                    (a, b) => Number(a.price) - Number(b.price)
                );
                break;
            default:
        }
    }

    handleInputChange(): void {
        if (this.searchForm.value.search !== '') {
            const filteredNFTs = this.products.filter(element => element.nft.name.toLowerCase().indexOf(this.searchForm.value.search.toLowerCase()) > -1);
            this.saleNFTs = filteredNFTs;
        }else{
            this.saleNFTs = this.products;
        }
    }

    addToCart(saleNFT: any) { // TODO: Make this a Product and fix tests and code.
      const item = {
        _id: saleNFT.id,
        name: saleNFT.nft.name,
        tokenId: saleNFT.nft.tokenId,
        image: saleNFT.nft.imageUrl,
        price: saleNFT.price,
        count: 1,
        subTotal: saleNFT.price,
        collection: saleNFT.collection,
        sellerAddress: saleNFT.sellerAddress,
      };

      this.cartService.addItemToCart(item);
    }
}

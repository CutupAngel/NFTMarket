import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ErrorsService } from 'app/core/errors/errors.service';
import { Product } from 'app/core/product/product';
import { ProductService } from 'app/core/product/product.service';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent implements OnInit
{
    newNFTs: number = 0;
    listedForSaleNFTs: number =  0;
    soldNFTs: number =  0;
    totalUsers: number =  0;
    products: Product[] = [];
    saleNFTs: Product[] = [];


    banners = {
            bg: {
                src: 'assets/images/mcl/mcl-mascot-bg.png',
                attr:''
            },
            text: {
                data: 'The MCL Marketplace',
                attr: 'text-transform: uppercase; text-align: left; line-height: 35px; margin: 50px 20px;'
            },
            url: ''
    };

    stats = [
        {
            img: {
                src: 'https://wax.atomichub.io/images/icons/atom.png',
                attr: ''
            },
            title: {
                text: this.newNFTs,
                attr: ''
            },
            details: {
                text:'New NFTs',
                attr: ''
            }
        },
        {
            img: {
                src: 'https://wax.atomichub.io/images/icons/label.png',
                attr: ''
            },
            title: {
                text: this.listedForSaleNFTs,
                attr: ''
            },
            details: {
                text:'Listed for Sale NFT',
                attr: ''
            }
        },
        {
            img: {
                src: 'https://wax.atomichub.io/images/icons/trade.png',
                attr: ''
            },
            title: {
                text: this.soldNFTs,
                attr: ''
            },
            details: {
                text:'Sold NFTs',
                attr: ''
            }
        },
        {
            img: {
                src: 'https://wax.atomichub.io/images/icons/coins.png',
                attr: ''
            },
            title: {
                text: this.totalUsers,
                attr: ''
            },
            details: {
                text:'Total Users',
                attr: ''
            }
        }
    ];

    /**
     * Constructor
     */
     constructor(
        private _productService: ProductService,
        private _errorsService: ErrorsService
    ) {}

    ngOnInit(): void {
        this.getNFTsStats();

        //Get Products
        this.getSaleNFTs();
    }

    getNFTsStats(): void {
        this._productService.getStats().subscribe((data) => {
             console.log('stats:', data.data.new);
             this.newNFTs = data.data.new;
             this.listedForSaleNFTs = data.data.sale;
             this.soldNFTs = data.data.sold;
             this.totalUsers = data.data.users;
        },
        () => {
            this._errorsService.openSnackBar('Something went wrong!', 'Error');
        });
    }
    getSaleNFTs(): void {
        this._productService.getAllListings().subscribe((data) => {
            this.saleNFTs = data?.data;
            this.products = data?.data;
            this.saleNFTs.sort((a, b) => {
                if (b.createdOn > a.createdOn) {return 1; };
                if (b.createdOn < a.createdOn) {return -1; };
            });
        },
        () => {
            this._errorsService.openSnackBar('Something went wrong!', 'Error');
        });
    }

}

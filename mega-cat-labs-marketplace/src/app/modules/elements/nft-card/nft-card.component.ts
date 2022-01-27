import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { CartService } from 'app/core/cart/cart.service';

@Component({
  selector: 'app-nft-card',
  templateUrl: './nft-card.component.html',
  styleUrls: ['./nft-card.component.scss']
})
export class NftCardComponent implements OnInit {

  @Input() nft: any;
  @Input() walletAddress: any;
  @Output() loading = new EventEmitter();

  activeNft: string = '';

  constructor(
    private productService: ProductService,
    private errorsService: ErrorsService,
    private venlyService: VenlyService,
    private _cartService: CartService
  ) { }

  ngOnInit(): void {
  }

  openNft(nft) {
    console.log('TODO: Implement Opening NFT');
  }

  listForSale(nft) {
    const formdata = new FormData();
    const self = this;
    this.loading.emit(true);
    formdata.append('tokenId',nft.tokenId);
    formdata.append('address', nft.metadata.asset_contract.address);
    formdata.append('sellerAddress', this.walletAddress);
    formdata.append('price', nft.price);

    this.productService.createForSale(formdata).subscribe(
      (response) => {
        self.venlyService.updateOffer(response.data).then(() => {
          self.activeNft = '';
          self.loading.emit(false);
          self.errorsService.openSnackBar('NFT successfully listed for sale!', 'Success');
        });
      },
      () => {
        self.errorsService.openSnackBar('Something went wrong!', 'Error');
        self.loading.emit(false);
    });
  }

  timer(value: number){
    const hours: number = Math.floor(value / 3600);
    const minutes: number = Math.floor((value % 3600) / 60);
    return ('00' + hours).slice(-2) + ':' + ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
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

    this._cartService.addItemToCart(item);
  }

}

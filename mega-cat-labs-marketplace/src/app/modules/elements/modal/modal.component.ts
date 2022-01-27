import { Component, Input, OnInit } from '@angular/core';
import { CartService } from 'app/core/cart/cart.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  public saleNFT;

  constructor(
    private modalService: BsModalService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.saleNFT = this.modalService.config.initialState;
    console.log('saleNFT: ', this.modalService.config.initialState);
  }


  addToCart(saleNFT) {
    const item = {
      _id: saleNFT.id,
      name: saleNFT.nft.name,
      tokenId: saleNFT.sellerId,
      image: saleNFT.nft.imageUrl,
      price: saleNFT.price,
      count: 1,
      subTotal: saleNFT.price,
    };

    this.cartService.addItemToCart(item);
    this.modalService.hide();
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService } from 'app/core/cart/cart.service';
@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss'],
})
export class OrderSuccessComponent implements OnInit, OnDestroy{
  products = [];
  constructor(private _cartService: CartService) {}

  ngOnInit(): void {
    this.products = this._cartService.getCartItems();
  }

  ngOnDestroy(): void{
     localStorage.removeItem('cart');
     this._cartService.cartItems = [];
  }

}

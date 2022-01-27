import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from './cartItem';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { environment } from 'environments/environment';
import { WalletService } from '../wallet/wallet.service';

const baseUrl = environment.apiUrl;
@Injectable()
export class CartService {
    cartItems: Array<CartItem>;
    cardProcessingFee: number = 0.0005;

    constructor(private _httpClient: HttpClient, private walletService: WalletService) {
      this.cartItems = JSON.parse(localStorage.getItem('cart')) ?? [];
    }

    /**
     * Get Cart items count
     */
    getItemsCount(): number {
        return this.cartItems.length;
    }

    /**
     * Get Cart items sum
     */
    getItemsSum(): number{
      const sum = this.cartItems.reduce((prev, cur)=>  prev + cur.subTotal, 0);
      return sum;
    }

    /**
     * Add Item to cart
     */
    addItemToCart(item: CartItem){
      const check = this.cartItems.findIndex(cartItem => cartItem._id === item._id);
      if (check !== -1) {
        Swal.fire({
          icon: 'info',
          title: '<p>Item Already In Cart!</p>',
          showConfirmButton: false,
          timer: 2000,
          background: '#5b5353',
          iconColor: 'white'
      });
      } else {
        this.cartItems.push(item);
        Swal.fire({
          icon: 'success',
          title: '<p>Added To Cart Successfully!</p>',
          showConfirmButton: false,
          timer: 2000,
          background: '#5b5353',
          iconColor: 'white'
      });
      }
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    /**
     * Get Cart Items
     */

    getCartItems(): Array<CartItem>{
      return JSON.parse(localStorage.getItem('cart'));
    }

    /**
     * Remove single item from cart
     */
    removeCartItem(id: number){
      this.cartItems = this.cartItems.filter( obj => obj._id !== id);
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    /**
     * Place Order
     */
    placeOrder(): Observable<any> {
      const token = localStorage.getItem('accessToken');
      const header = new HttpHeaders().set(
        'Authorization',
        `Bearer ${token}`
      );
      const user = JSON.parse(localStorage.getItem('user')as string);

      const walletAddress = this.walletService.currentAccount;
      const data = new FormData();
      data.append('total', JSON.stringify(this.getItemsSum()));

      data.append('items', JSON.stringify(this.cartItems));
      data.append('walletAddress', walletAddress);
      data.append('userName',user.id);
      // this.cartItems = [];
      return this._httpClient.post(`${baseUrl}/order/create/`, data, {headers:header});
  }

}

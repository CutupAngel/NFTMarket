import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { CartService } from 'app/core/cart/cart.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { WalletService } from '../../../core/wallet/wallet.service';
import { CartItem } from 'app/core/cart/cartItem';
import { Role } from '../../../core/models/role';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  nav: any = [
    { url: 'home', title: 'Home' },
    { url: 'market', title: 'Market' },
    { url: 'trading', title: 'Trading' }
  ];

  loggedIn: boolean;
  walletAddress: string;
  notInstalled: boolean;
  isAdmin: boolean;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    public walletService: WalletService,
    private ngZone: NgZone,
  ) { }

  ngOnInit(): void {
    this.authService.check().subscribe((authenticated) => {
      this.loggedIn = true;
    });

    this.authService.isAdmin().subscribe((admin) => {
      this.isAdmin = admin;
    });

    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if (accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }
  isAdminRole(): boolean {
    return this.isAdmin;
  }

  getUser(): User {
    return this.authService.user;
  }

  getProducts(): Array<CartItem> {
    return this.cartService.getCartItems();
  }

  getProductsCount(): number {
    return this.cartService.getItemsCount();
  }
}

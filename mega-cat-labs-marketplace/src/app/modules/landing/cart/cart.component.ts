import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PaymentDetailsPopupComponent } from 'app/modules/elements/payment-details-popup/payment-details-popup.component';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
    products = [];
    loggedIn: boolean;
    processingFee: number;
    isDisabled = true;
    etherToUsdExchangeRate = 1.87; // TODO: Get a service to calculate this in real-time
    total = 0;
    isAgree = false;
    public modalRef: BsModalRef;
    constructor(
        private cartService: CartService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private modalService: BsModalService,
        private errorsService: ErrorsService
        ) {}

    ngOnInit(): void {
        this.authService.check().subscribe((authenticated) => {
            this.loggedIn = authenticated;
        });
        this.products = this.cartService.getCartItems();
        this.processingFee = this.cartService.cardProcessingFee;
        this.computeTotal();
    }

    removeProductFromCart(id: number): void {
        this.cartService.removeCartItem(id);
        this.products = this.cartService.getCartItems();
    }

    getProductsSum(): number {
        return this.cartService.getItemsSum();
    }

    checkOut(): void {
        if(this.loggedIn) {
            if(this.products && this.products.length > 0){
                this.modalRef = this.modalService.show(PaymentDetailsPopupComponent, {
                    class: 'mcl-payment-modal'
                });

                // this.products = [];
            } else {
                this.errorsService.openSnackBar('Cart Is Empty!', 'Error');
            }

            /* this.cartService.placeOrder(walletAddress).subscribe(
                () => {
                    localStorage.removeItem('cart');
                    const redirectURL =
                        this.activatedRoute.snapshot.queryParamMap.get(
                            'redirectURL'
                        ) || '/market';
                    // Navigate to the redirect url
                    this.products = [];
                    this.router.navigateByUrl(redirectURL);
                },
                (response) => {
                    console.log('response', response);
                }
            ); */
        }else{
            const redirectURL =
            this.activatedRoute.snapshot.queryParamMap.get(
                'redirectURL'
            ) || '/sign-in';
            // Navigate to the redirect url
            this.router.navigateByUrl(redirectURL);
        }
    }

    addQuantity(index: number) {
        this.products[index].count ++;
        this.products[index].price = this.products[index].price + this.products[index].subTotal;
        this.computeTotal();
    }

    reduceQuantity(index: number) {
        if (this.products[index].count > 0) {
            this.products[index].count --;
            this.products[index].price = this.products[index].price - this.products[index].subTotal;
            this.computeTotal();
        }
    }

    computeTotal() {
        this.total = parseFloat((this.getProductsSum() + this.processingFee).toFixed(5));
    }

    termsCheck() {
        this.isAgree = !this.isAgree;
        console.log(this.isAgree);
    }
}

import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { User } from '../../../core/user/user.types';
import { CartService } from 'app/core/cart/cart.service';
import { PaymentService } from '../../../core/payment/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingDetails } from 'app/core/payment/billing-details';
import { CardDetails } from 'app/core/payment/card-details';
import { BillingResponse } from 'app/core/payment/billing-response';
import { messages } from 'app/mock-api/apps/chat/data';

@Component({
  selector: 'app-payment-details-popup',
  templateUrl: './payment-details-popup.component.html',
  styleUrls: ['./payment-details-popup.component.scss'],
})
export class PaymentDetailsPopupComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  public user;
  paymentDetailsForm: FormGroup;
  public cardNumber: string = null;
  public expiryMonth: number = null;
  public expiryYear: number = null;
  public csv: number = null;

  public name: string = null;
  public city: string = null;
  public country: string = null;
  public line1: string = null;
  public line2: string = null;
  public district: string = null;
  public postalCode: string = null;

  public errorMsg: boolean = false;
  public errorMsg1: boolean = false;

  constructor(
    private authService: AuthService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.paymentDetailsForm = this.formBuilder.group({
      name: [null, Validators.required],
      city: [null, Validators.required],
      country: [null, Validators.required],
      line1: [null, Validators.required],
      line2: [null],
      district: [null, Validators.required],
      postalCode: [null, Validators.required],
      cardNumber: [null, Validators.required],
      expiryMonth: [null, Validators.required],
      expiryYear: [null, Validators.required],
      csv: [null, Validators.required],
    });

    this.user = this.authService.user;
    console.log('auth user', this.user);
  }

  isInvalid(controlForm: AbstractControl) {
    return controlForm.invalid && (controlForm.dirty || controlForm.touched);
  }

  getUser(): User {
    return this.authService.user;
  }

  async processPayment(): Promise<any> {
    const card = this.paymentDetailsForm.value;
    if(this.paymentDetailsForm.valid) {
      const response: BillingResponse = await this.paymentService.processPayment(
        new BillingDetails(
          card.name,
          card.city,
          card.country,
          card.line1,
          card.line2,
          card.district,
          card.postalCode,
          this.cartService.getItemsSum(),
          card.expiryMonth,
          card.expiryYear
        ),
        new CardDetails(card.cardNumber.toString(), card.csv)
      );

      if (response.status !== 'failed' && response.status !== 'action_required') {
        this.cartService.placeOrder().subscribe(
          () => {
            const redirectURL =
              this.activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
              '/order-success';
            // Navigate to the redirect url
            this.modalService.hide();
            this.router.navigateByUrl(redirectURL);
          },
          (errorResponse) => {
            const message = errorResponse.message;
            const error = errorResponse.error;
            console.error(`There was an error attempting to finalize order after payment was successful. ${error.message}. with message ${message}`);
          }
        );
      }
    } else {
      console.log('Please fill up all required field(s)');
    }
  }

  fillTestData() {
    this.paymentDetailsForm.controls.name.setValue('John Snow');
    this.paymentDetailsForm.controls.city.setValue('Beaver Falls');
    this.paymentDetailsForm.controls.country.setValue('US');
    this.paymentDetailsForm.controls.line1.setValue('500 Baum Blvd');
    this.paymentDetailsForm.controls.line2.setValue('');
    this.paymentDetailsForm.controls.district.setValue('US');
    this.paymentDetailsForm.controls.postalCode.setValue('15222');
    this.paymentDetailsForm.controls.expiryMonth.setValue(1);
    this.paymentDetailsForm.controls.cardNumber.setValue('4007400000000007');
    this.paymentDetailsForm.controls.csv.setValue(123);
    this.paymentDetailsForm.controls.expiryYear.setValue(2022);
  }
}

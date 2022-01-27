import { EmailPopupComponent } from './../../elements/email-popup/email-popup.component';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AvatarPopupComponent } from 'app/modules/elements/avatar-popup/avatar-popup.component';
import { PasswordPopupComponent } from 'app/modules/elements/password-popup/password-popup.component';
import { ProductService } from 'app/core/product/product.service';
import { VenlyService } from 'app/core/venly/venly.service';
import { Product } from 'app/core/product/product';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from 'app/modules/elements/modal/modal.component';
import { Router} from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ErrorsService } from 'app/core/errors/errors.service';
import { WalletService } from 'app/core/wallet/wallet.service';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
    user: User;
    products: Product[] = [];
    id: number;
    nfts: any[] = [];
    orders: any[] = [];
    searchForm: FormGroup;
    avatar: string = null;
    public modalRef: BsModalRef;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private productService: ProductService,
        private venlyService: VenlyService,
        private modalService: BsModalService,
        private router: Router,
        private errorsService: ErrorsService,
        private walletService: WalletService
    ) {}

    ngOnInit(): void {
        this.user = this.authService.user;
        if(this.user && this.user.avatar) {
            this.avatar = this.user.avatar;
        } else {
            this.avatar = '../../../../assets/images/avatars/female-01.jpg';
        }

        this.searchForm = this.formBuilder.group({
            search: ['', Validators.required],
        });

        this.getNFTs();

        //Get Orders History
        this.getOrderHistory();
    }

    getUser(): User {
        return this.authService.user;
    }

    openAvatarModal(user) {
        const initialState = user;
        this.modalRef = this.modalService.show(AvatarPopupComponent, {
            initialState,
        });

    }

    openEmailModal(user) {
        const initialState = user;
        this.modalRef = this.modalService.show(EmailPopupComponent, {
            initialState,
        });
    }

    openPasswordModal(user) {
        const initialState = user;
        this.modalRef = this.modalService.show(PasswordPopupComponent, {
            initialState,
        });
    }

    getNFTs(): void {
        this.productService.listingNFT().subscribe((data) => {
            this.nfts = data.data;
        },
        () => {
            this.errorsService.openSnackBar('Something went wrong!', 'Error');
        });
    }

    getOrderHistory(): void {
        this.productService.getOrderHistory().subscribe((data) => {
            this.orders = data.data;
        },
        () => {
            this.errorsService.openSnackBar('Something went wrong!', 'Error');
        });
    }

    openModal(product) {
        const initialState = product;
        this.modalRef = this.modalService.show(ModalComponent, {
            initialState,
        });
    }

    openListModal(nft) {
        Swal.fire({
            title: '<p>Enter The NFT Price</p>',
            input: 'text',
            inputAttributes: {
              autocapitalize: 'off'
            },
            background: '#5b5353',
            confirmButtonColor: '#ea923e',
            cancelButtonColor: '#ea923e',
            showCancelButton: true,
            confirmButtonText: 'List For Sale',
            showLoaderOnConfirm: true,
            preConfirm: (login) => {
                this.modalService.hide();
                const data = JSON.parse(nft.metadata);
                const formdata = new FormData();
                  formdata.append('tokenId',nft.tokenId);
                  formdata.append('address', data['asset_contract'].address);
                  formdata.append('sellerAddress', this.walletService.currentAccount);
                  formdata.append('price', login);
                  this.productService.createForSale(formdata).subscribe(
                      (response) => {
                          const newData = response.data;
                          this.venlyService.updateOffer(newData);
                          const filteredNFTs = this.nfts.filter(item => item.tokenId !== nft.tokenId);
                          this.nfts = filteredNFTs;
                      },
                      () => {
                        this.errorsService.openSnackBar('Something went wrong!', 'Error');
                      });
              },
            allowOutsideClick: () => !Swal.isLoading()
          });
    }

    extractFromJson(obj, key) {
        if (obj !== null) {
            const ob = JSON.parse(obj);
            return ob[key];
        }
    }

}

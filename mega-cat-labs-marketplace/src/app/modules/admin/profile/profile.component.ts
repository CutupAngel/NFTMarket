import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from '../../../core/user/user.types';
import { WalletService } from '../../../core/wallet/wallet.service';
import { ProductService } from 'app/core/product/product.service';
import { ErrorsService } from 'app/core/errors/errors.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenlyService } from 'app/core/venly/venly.service';
import { Offer } from 'app/core/models/offer.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;
  avatar: string = null;
  walletAddress: string;
  mockdata: any = [];
  nfts: any[] = [];
  filteredNFTs: any[] = [];
  activeNft: string = '';
  term: string = '';
  updateAvatarForm: FormGroup;
  isAdmin: boolean =false;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private productService: ProductService,
    private errorsService: ErrorsService,
    private _formBuilder: FormBuilder,
    private venlyService: VenlyService,
  ) { }

  ngOnInit(): void {
    this.user = this.authService.user;
    // Set profile info on init
    this.setAvatar();
    this.setWalletAddress();
    this.updateAvatarForm = this._formBuilder.group({
        image: ['', Validators.required],
    });
    this.authService.isAdmin().subscribe((admin)=>{
      this.isAdmin = admin;
    });

    this.getNFTs();
    this.getPendingOffers();
  }
  getPendingOffers() {
    this.productService.getAllListings().subscribe((data: {
      data: Offer[];
  }) => {
      const distinctCollections = [];
      const pendingListings = data.data.filter((listing: Offer) => listing.status === 'AWAITING_FINALIZING_OFFER' || listing.status === 'FINALIZING_OFFER'
        && (listing.buyerWalletAddress === this.walletAddress || listing.externalBuyerId === this.user.id));

      pendingListings.forEach((offer: Offer) => {
          const listing: any = Object.assign({}, offer);
          listing.metadata = offer.nft;
          listing.type = 'pending';
          listing.metadata.image = offer.nft.imageUrl;
          const contract = offer.nft.contract;
          const contractAddress =  contract.address;

          listing.collection = contract.name;
          listing.tokenId = offer.nft.id;

          if(distinctCollections.indexOf(contract.address) === -1) {
            distinctCollections.push(contractAddress);
          }

          this.nfts.push(listing);
      });
  },
  () => {
      console.error('Error fetching pending listings for user');
  });
  }


  setAvatar(){
    if(this.user && this.user.avatar) {
        this.avatar = this.user.avatar;
    } else {
        this.avatar = 'https://cdn.shopify.com/s/files/1/1494/4102/t/7/assets/pf-5005c27f--IWantYouUncleSam4.png?v=1593416331';
    }
  }

  setWalletAddress(){
    this.walletService.getAccounts().subscribe((accounts) => {
      this.ngZone.run(() => {
        if(accounts.length === 0) {
          this.walletAddress = null;
        } else {
          this.walletAddress = accounts[0];
        }
      });
    });
  }

  getNFTs(): void {
      this.productService.listingNFT().subscribe((data) => {
        if(Boolean(data.data) === false) {
          this.nfts = [];
          return;
        }
        data.data.forEach((nft: any) => {
          nft.metadata = JSON.parse(nft.metadata);
          nft.type = 'listing';
          nft.status = 'OWNED';
          this.nfts.push(nft);
        });
        this.filteredNFTs = this.nfts;
      },
      () => {
          this.errorsService.openSnackBar('Something went wrong!', 'Error');
    });
  }

  search() {
    console.log(this.term);
    this.filteredNFTs = this.nfts.filter(o => o.metadata.name.toLowerCase().includes(this.term.toLowerCase()));
    console.log(this.filteredNFTs);
  }

  onChangeAvatar(event) {
    const reader = new FileReader();
    reader.onload = (onloadEvent: any) => {
      this.avatar = onloadEvent.target.result; // UI element

      this.updateAvatarForm.controls['image'].setValue(event.target.files[0]); // Used in service to update Avatar
      this.updateAvatar();
    };
    reader.onerror = (errorEvent: any) => {
      console.log(`File could not be read: ${errorEvent.target.error.code}`);
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
        console.log(this.updateAvatarForm.value.image);
        const formData = new FormData();
        formData.append('avatar', this.updateAvatarForm.value.image);
        this.authService.updateAvatar(formData).subscribe();
    }
  }

  listForSale(nft) {
    this.loading = true;
    const formdata = new FormData();
    const self = this;
    formdata.append('tokenId',nft.tokenId);
    formdata.append('address', nft.metadata.asset_contract.address);
    formdata.append('sellerAddress', this.walletAddress);
    formdata.append('price', nft.price);

    this.productService.createForSale(formdata).subscribe(
      (response) => {
        const newData = response.data;
        self.venlyService.updateOffer(newData);
        self.loading = false;
        self.activeNft = '';
        this.errorsService.openSnackBar('NFT successfully listed for sale!', 'Success');
      },
      () => {
        this.errorsService.openSnackBar('Something went wrong!', 'Error');
        this.loading = false;
    });
  }

  openNft(nft){
    console.log(nft);
  }

  loader(e){
    this.loading = e;
  }
}

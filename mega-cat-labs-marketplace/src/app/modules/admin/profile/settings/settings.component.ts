import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { WalletService } from '../../../../core/wallet/wallet.service';
import { User } from '../../../../core/user/user.types';
import { FuseValidators } from '@fuse/validators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  walletAddress: string;
  user: User;
  avatar: string = null;
  updateAccountForm: FormGroup;
  updateAvatarForm: FormGroup;

  constructor(
    private authService: AuthService,
    public walletService: WalletService,
    private ngZone: NgZone,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.setAvatar();
    this.setWallet();

    // Set forms
    this.updateAccountForm = this._formBuilder.group({
        username: ['', Validators.required],
        email: [this.user.email, Validators.required],
        bio: [''],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
    },{
        validators: FuseValidators.mustMatch('password', 'confirmPassword')
    });
    this.updateAvatarForm = this._formBuilder.group({
        image: ['', Validators.required],
    });
  }

  setWallet(){
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

  setAvatar(){
    console.log(this.user);
    if(this.user && this.user.avatar) {
        this.avatar = this.user.avatar;
    } else {
        this.avatar = 'https://cdn.shopify.com/s/files/1/1494/4102/t/7/assets/pf-5005c27f--IWantYouUncleSam4.png?v=1593416331';
    }
  }
  copy(){
    navigator.clipboard.writeText(this.walletAddress);
    // @ts-ignore: Unreachable code error
    document.querySelector('.message').style.opacity = 1;
    setTimeout(() => {
      // @ts-ignore: Unreachable code error
      document.querySelector('.message').style.opacity = 0;
     }, 500);
  }

  onChangeAvatar(event) {
    this.updateAvatarForm.controls['image'].setValue(event.target.files[0]);
    this.updateAvatar();
  }

  updateAvatar(): void {
    if (this.updateAvatarForm.value.image) {
        console.log(this.updateAvatarForm.value.image);
        const formData = new FormData();
        formData.append('avatar', this.updateAvatarForm.value.image);
        this.authService.updateAvatar(formData).subscribe();
    }
  }

  submit() {
    console.log(this.updateAccountForm);
  }

}

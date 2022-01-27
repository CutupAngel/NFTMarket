import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { VenlyNftCreatedResponse } from './../../../../core/models/venly/venly-nft-created-response.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import { WalletService } from 'app/core/wallet/wallet.service';
import { NftCreatedPopupComponent } from 'app/modules/elements/nft-created-popup/nft-created-popup.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  formFieldHelpers: string[] = [''];
  createProductForm: FormGroup;
  properties: any[] = [];
  propertiesForm: FormGroup;
  fileError: boolean = false;
  productImages = [];
  fileUrl: any;
  loader: boolean = false;
  collections: any[] =[];
  modalRef: BsModalRef;

  constructor(
      private activatedRoute: ActivatedRoute,
      private formBuilder: FormBuilder,
      private router: Router,
      private productService: ProductService,
      private errorsService: ErrorsService,
      private walletService: WalletService,
      private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.createProductForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        properties: this.properties,
        images: ['', Validators.required],
        selectedCollection : ['', Validators.required],
        supply : [1, Validators.required],
    });

    this.propertiesForm = this.formBuilder.group({
        type: ['property'],
        name: ['', Validators.required],
        value: ['', Validators.required],
    });

    this.productService.getCollections({
        walletAddress : this.walletService.currentAccount
    }).subscribe(
        (res) => {
            console.log(res);
            this.collections = res.collections;
        },
        () => {
            console.log('something went wrong');
        },

    );

  }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create product
     */
    createProduct(): void {
      if (this.createProductForm.invalid) {
          this.fileError = true;
          return;
      }

      // Disable the form
      this.createProductForm.disable();
      this.loader = true;

      const walletAddress = this.walletService.currentAccount;

      const formData = new FormData();
      formData.append('name', this.createProductForm.value.name);
      formData.append('supply', this.createProductForm.value.supply);
      formData.append(
          'description',
          this.createProductForm.value.description
      );
      formData.append('properties', JSON.stringify(this.properties));
      const length = this.createProductForm.value.images.length;
      for(let i=0; i<length; i++){
          formData.append('images', this.createProductForm.value.images[i]);
      }

      const selectedOptionIndex = this.collections.findIndex( coll => coll.name === this.createProductForm.value.selectedCollection);

      const collectionId = this.collections[selectedOptionIndex].collectionId;
      if(collectionId) {
        formData.append('collectionId', this.collections[selectedOptionIndex].collectionId);
      }


      formData.append('walletAddress', walletAddress);

      // Create Product
      this.productService.createProduct(formData).subscribe(
          (response: {
            message: string;
            data: VenlyNftCreatedResponse[];
          }) => {
              const nftCreatedResponse = response.data[0];
              this.showNftCreatedModal(nftCreatedResponse);
              this.errorsService.openSnackBar('Product created successfully!', 'Success');
              this.router.navigateByUrl('/profile');
          },
          () => {
              this.errorsService.openSnackBar('Something went wrong!', 'Error');
              this.createProductForm.enable();
          },
          () => {
              this.createProductForm.enable();
              this.loader = false;
          }
      );
  }

  addToProperties(): void {
      if (this.propertiesForm.invalid) {
          return;
      } else {
          this.properties.push(this.propertiesForm.value);
          this.propertiesForm.reset();
          this.propertiesForm.controls['name'].setErrors(null);
          this.propertiesForm.controls['value'].setErrors(null);
          this.propertiesForm.controls['type'].setValue('property');
      }
  }

  onChange(event) {
      this.fileError = false;
      const images = [];
      if (event.target.files && event.target.files[0]) {
          const filesAmount = event.target.files.length;
          for (let i = 0; i < filesAmount; i++) {
              console.log('image', event.target.files[i]);
              images.push(event.target.files[i]);
              const reader = new FileReader();

              reader.onload = (ev: any) => {
                  console.log(event.target.result);
                  this.productImages.push(ev.target.result);

                  this.createProductForm.patchValue({
                      images: images,
                  });
              };

              reader.readAsBinaryString(event.target.files[i]);
          }
      }

      this.setImageSource(event);
  }

  private setImageSource(changeEvent) {

      const reader = new FileReader();

      reader.onload = (event: any) => {
          this.fileUrl = event.target.result;
      };

      reader.onerror = (event: any) => {
          console.log(`File could not be read: ${event.target.error.code}`);
      };

      reader.readAsDataURL(changeEvent.target.files[0]);
  }

  private showNftCreatedModal(nftCreatedResponse: VenlyNftCreatedResponse) {
    const config: ModalOptions = {
      class: 'nft-created-container',
      initialState: {
        nft: nftCreatedResponse
      }
    };

    this.modalRef = this.modalService.show(NftCreatedPopupComponent, config);
  }
}

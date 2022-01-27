import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { VenlyCollectionResponseModel } from '../../../../core/models/venly-collection-response.model';
import {BsModalRef, BsModalService, ModalOptions} from 'ngx-bootstrap/modal';
import {CollectionCreatedPopupComponent} from '../../../elements/collection-created-popup/collection-created-popup.component';
import { WalletService } from 'app/core/wallet/wallet.service';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  formFieldHelpers: string[] = [''];
  createCollectionForm: FormGroup;

  fileError: boolean = false;
  productImages = [];
  fileUrl: any;
  loader: boolean = false;
  public modalRef: BsModalRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private productService: ProductService,
    private errorsService: ErrorsService,
    private modalService: BsModalService,
    private walletService: WalletService
  ) { }

  ngOnInit(): void {
    this.createCollectionForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      symbol : ['',Validators.required],
      images: ['', Validators.required],
  });

  }
    /**
     * Create Collection
     */
     createCollection(): void {
      if (this.createCollectionForm.invalid) {
          return;
      }

      this.createCollectionForm.disable();
      this.loader = true;

      const walletAddress = this.walletService.currentAccount;

      const formData = new FormData();
      formData.append('name', this.createCollectionForm.value.name);
      formData.append(
          'description',
          this.createCollectionForm.value.description
      );
      formData.append(
        'symbol',
        this.createCollectionForm.value.symbol
    );

      const length = this.createCollectionForm.value.images.length;
      for(let i=0; i<length; i++){
          formData.append('images', this.createCollectionForm.value.images[i]);
      }

      formData.append('walletAddress', walletAddress);
      console.log(formData.toString());

      // Create Product
      this.productService.createCollection(formData).subscribe(
          (response) => {
            this.showCollectionModal(response.collection);
            console.log('Successfully created a collection', response);
            this.errorsService.openSnackBar('Product created successfully!', 'Success');
            // Navigate to the redirect url
            // this.router.navigateByUrl('/profile');
          },
          () => {
            this.errorsService.openSnackBar('Something went wrong!', 'Error');
            this.createCollectionForm.enable();
          },
          () => {
            this.createCollectionForm.enable();
            this.loader = false;
          }
      );
  }



  /**
   * File on change handler
   */

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

                  this.createCollectionForm.patchValue({
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


  private showCollectionModal(collection: VenlyCollectionResponseModel) {
    const config: ModalOptions = {
      class: 'collection-created-container',
      initialState: {
        collection
      }
    };
    this.modalRef = this.modalService.show(CollectionCreatedPopupComponent, config);
  }
}

import { PreparedApproveTx } from './prepared-approve-tx.model';

export class OfferCreatedResponseModel {
  offerId: string;
  transaction: PreparedApproveTx[];
}

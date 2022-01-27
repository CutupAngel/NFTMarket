export interface CartItem {
    _id: number;
    name: string;
    tokenId: string;
    collection?: string; // TODO: Make this required and fix tests.
    image: string;
    price: number;
    count: number;
    subTotal: number;
}

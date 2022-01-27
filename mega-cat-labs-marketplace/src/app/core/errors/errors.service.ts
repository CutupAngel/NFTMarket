import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorsService {
    constructor( private _snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            panelClass: 'custom-css-class',
            duration: 1000,
        });
    }
}

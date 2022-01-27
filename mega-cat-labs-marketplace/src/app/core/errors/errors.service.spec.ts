import { TestBed } from '@angular/core/testing';
import { ErrorsService } from './errors.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ErrorsService', () => {
  let service: ErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [
            MatSnackBarModule
        ],
        providers: [
            { provide: ErrorsService },
        ]
    });
    service = TestBed.inject(ErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});

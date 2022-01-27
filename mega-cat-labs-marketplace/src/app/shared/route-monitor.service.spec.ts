import { TestBed } from '@angular/core/testing';

import { RouteMonitorService } from './route-monitor.service';
import { Router } from '@angular/router';

describe('RouteMonitorService', () => {
  let service: RouteMonitorService;
  const routerMock = jasmine.createSpyObj('Router', ['url', 'events']);
  routerMock.url.and.returnValue('aUrl');
  routerMock.events = {
    subscribe: () => []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    });
    service = TestBed.inject(RouteMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

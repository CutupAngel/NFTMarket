import { TestBed } from '@angular/core/testing';

import { RouteMonitorServiceService } from './route-monitor-service.service';

describe('RouteMonitorServiceService', () => {
  let service: RouteMonitorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteMonitorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

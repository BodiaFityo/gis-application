import { TestBed } from '@angular/core/testing';

import { GisMapService } from './gis-map.service';

describe('GisMapService', () => {
  let service: GisMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GisMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

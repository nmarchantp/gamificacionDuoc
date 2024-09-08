import { TestBed } from '@angular/core/testing';

import { DesafiosService } from './desafios.service';

describe('DesafiosService', () => {
  let service: DesafiosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesafiosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

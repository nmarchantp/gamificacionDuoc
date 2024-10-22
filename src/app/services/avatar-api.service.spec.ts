import { TestBed } from '@angular/core/testing';

import { AvatarApiService } from './avatar-api.service';

describe('AvatarApiService', () => {
  let service: AvatarApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AvatarApiService } from './avatar-api.service';
import { HttpClientModule } from '@angular/common/http';

describe('AvatarApiService', () => {
  let service: AvatarApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(AvatarApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

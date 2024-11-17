import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { SqliteService } from './sqlite.service';

describe('SqliteService', () => {
  let service: SqliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(SqliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthGuard } from './autenticacion.guard'
import { SqliteService } from './sqlite.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSqliteService: jasmine.SpyObj<SqliteService>;

  const isAuthenticatedMock = new BehaviorSubject<boolean>(true);

  beforeEach(() => {
    // Mock del Router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock del SqliteService
    mockSqliteService = jasmine.createSpyObj('SqliteService', [], {
      isAuthenticated: isAuthenticatedMock
    });

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SqliteService, useValue: mockSqliteService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow navigation if user is authenticated', async () => {
    // Configura el mock para devolver `true`
    isAuthenticatedMock.next(true);

    const canActivate = await guard.canActivate();
    if (typeof canActivate === 'boolean') {
      expect(canActivate).toBeTrue();
    }
  });

  it('should redirect to login if user is not authenticated', async () => {
    // Configura el mock para devolver `false`
    isAuthenticatedMock.next(false);

    const canActivate = await guard.canActivate();
    if (typeof canActivate === 'boolean') {
      expect(canActivate).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    }
  });
});

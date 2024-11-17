import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { IconanimatedComponent } from './iconanimated.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IconanimatedComponent', () => {
  let component: IconanimatedComponent;
  let fixture: ComponentFixture<IconanimatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconanimatedComponent],
      imports: [IonicModule.forRoot(), BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(IconanimatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Forzar detección de cambios inicial
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

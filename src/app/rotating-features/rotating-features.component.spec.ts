import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotatingFeaturesComponent } from './rotating-features.component';

describe('RotatingFeaturesComponent', () => {
  let component: RotatingFeaturesComponent;
  let fixture: ComponentFixture<RotatingFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotatingFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RotatingFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

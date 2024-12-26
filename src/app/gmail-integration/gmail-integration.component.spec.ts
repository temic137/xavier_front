import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GmailIntegrationComponent } from './gmail-integration.component';

describe('GmailIntegrationComponent', () => {
  let component: GmailIntegrationComponent;
  let fixture: ComponentFixture<GmailIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GmailIntegrationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GmailIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

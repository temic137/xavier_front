import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotDetailComponent } from './chatbot-detail.component';

describe('ChatbotDetailComponent', () => {
  let component: ChatbotDetailComponent;
  let fixture: ComponentFixture<ChatbotDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatbotDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

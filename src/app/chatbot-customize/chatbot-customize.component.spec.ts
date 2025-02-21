import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotCustomizeComponent } from './chatbot-customize.component';

describe('ChatbotCustomizeComponent', () => {
  let component: ChatbotCustomizeComponent;
  let fixture: ComponentFixture<ChatbotCustomizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotCustomizeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatbotCustomizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

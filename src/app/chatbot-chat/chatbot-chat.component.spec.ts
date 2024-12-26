import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotChatComponent } from './chatbot-chat.component';

describe('ChatbotChatComponent', () => {
  let component: ChatbotChatComponent;
  let fixture: ComponentFixture<ChatbotChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatbotChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

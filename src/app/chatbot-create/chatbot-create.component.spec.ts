import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotCreateComponent } from './chatbot-create.component';

describe('ChatbotCreateComponent', () => {
  let component: ChatbotCreateComponent;
  let fixture: ComponentFixture<ChatbotCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatbotCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

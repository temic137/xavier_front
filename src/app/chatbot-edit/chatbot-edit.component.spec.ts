import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotEditComponent } from './chatbot-edit.component';

describe('ChatbotEditComponent', () => {
  let component: ChatbotEditComponent;
  let fixture: ComponentFixture<ChatbotEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatbotEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

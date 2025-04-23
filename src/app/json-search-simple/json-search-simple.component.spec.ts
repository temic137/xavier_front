import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonSearchSimpleComponent } from './json-search-simple.component';

describe('JsonSearchSimpleComponent', () => {
  let component: JsonSearchSimpleComponent;
  let fixture: ComponentFixture<JsonSearchSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonSearchSimpleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JsonSearchSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

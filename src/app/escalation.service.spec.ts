import { TestBed } from '@angular/core/testing';

import { EscalationService } from './escalation.service';

describe('EscalationService', () => {
  let service: EscalationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscalationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

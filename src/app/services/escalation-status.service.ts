import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EscalationStatusService {
  private hasPendingEscalations = new BehaviorSubject<boolean>(false);

  setPendingStatus(count: number) {
    console.log('Setting pending status with count:', count); // Debug log
    const hasPending = count > 0;
    console.log('Has pending escalations:', hasPending); // Debug log
    this.hasPendingEscalations.next(hasPending);
  }

  getPendingStatus(): Observable<boolean> {
    return this.hasPendingEscalations.asObservable();
  }
} 
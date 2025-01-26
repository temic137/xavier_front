


// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class SseService {
//   private eventSource?: EventSource;

//   constructor() {}

//   getEventSource(url: string): Observable<MessageEvent> {
//     return new Observable(observer => {
//       this.eventSource = new EventSource(url);
     

//       this.eventSource.onmessage = (event) => {
//         observer.next(event);
//       };

//       this.eventSource.onerror = (error) => {
//         observer.error(error);
//       };
//     });
//   }

//   closeEventSource(): void {
//     if (this.eventSource) {
//       this.eventSource.close();
//     }
//   }
// }






import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SseService {

  private eventSource?: EventSource;
  constructor() {}

  getEventSource(url: string): Observable<MessageEvent> {
    return new Observable((observer) => {
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        observer.next(event);
      };

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }

  closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
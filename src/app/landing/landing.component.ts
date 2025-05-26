// import { CommonModule } from '@angular/common';
// import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, PLATFORM_ID, Inject, HostListener } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-landing',
//   standalone: true,
//   imports: [RouterLink, CommonModule],
//   templateUrl: './landing.component.html',
//   styleUrls: ['./landing.component.css']
// })
// export class LandingComponent implements OnInit, AfterViewInit {
//   @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;
//   @ViewChildren('featureItem') featureItems!: QueryList<ElementRef>;
//   @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;
//   private isBrowser: boolean;
//   private taglineInterval: any;
//   private exitingTaglineIndex: number | null = null;
//   selectedFeature: number | null = null;
//   showDetailView: boolean = false;
//   currentSection: number = 0;

//   loadingTaglines: string[] = [
//     "Empowering Your Support Team",
//     "AI That Learns Your Business",
//     "24/7 Customer Happiness",
//     "Built for Scale"
//   ];

//   detailedFeatures = [
//     {
//       title: "Simple Setup",
//       description: "Get started in minutes, not weeks",
//       imageSrc: "assets/landing/train.png",
//       points: [
//         "Upload your PDFs - Instantly extract knowledge from your existing documents, manuals, and guides",
//         "Connect your website - Automatically pull information from your website content and FAQs"
//       ],
//       iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//     },
//     {
//       title: "24/7 Customer Support",
//       description: "Never miss a customer query again",
//       imageSrc: "assets/landing/analytics.png",
//       points: [
//         "Always available - Provide instant responses while your team rests, no staffing required",
//         "Consistent quality - Deliver the same high-quality support experience at 3 PM or 3 AM"
//       ],
//       iconPath: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
//     },
//     {
//       title: "Easy Updates",
//       description: "Keep your AI current with zero technical skills",
//       imageSrc: "assets/landing/editing.png",
//       points: [
//         "One-click updates - Make changes to your AI's knowledge that take effect immediately",
//         "Simple interface - No coding required to maintain and improve your chatbot"
//       ],
//       iconPath: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
//     },
//     {
//       title: "Turn Support into Sales",
//       description: "Generate revenue from customer conversations",
//       imageSrc: "assets/landing/ticket.png",
//       points: [
//         "Automated lead capture - Identify sales opportunities during support conversations",
//         "Customer journey tracking - Follow the path from support inquiry to paying customer",
//         "Smart ticket management - Organize and prioritize support issues based on business impact",
//         "ROI measurement - See exactly how your chatbot contributes to your bottom line"
//       ],
//       iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14h6M9 10h6"
//     }
//   ];

//   currentTaglineIndex = 0;
//   currentTagline: string = this.loadingTaglines[0];
//   isLoading = true;
//   isMobileMenuOpen = false;

//   constructor(
//     @Inject(PLATFORM_ID) platformId: Object,
//     private cdr: ChangeDetectorRef
//   ) {
//     this.isBrowser = isPlatformBrowser(platformId);
//   }

//   ngOnInit() {
//     if (this.isBrowser) {
//       setTimeout(() => {
//         this.isLoading = false;
//       }, 2000);
//       this.startTaglineRotation();
//     }
//     this.currentTagline = this.loadingTaglines[this.currentTaglineIndex];
//     this.cdr.detectChanges(); // Force initial change detection
//   }

//   private startTaglineRotation() {
//     if (this.isBrowser) {
//       // Set initial tagline visibility
//       this.currentTaglineIndex = 0;
//       this.exitingTaglineIndex = null;
//       this.cdr.detectChanges();

//       this.taglineInterval = setInterval(() => {
//         // Mark current tagline as exiting
//         this.exitingTaglineIndex = this.currentTaglineIndex;
//         this.cdr.detectChanges();

//         // Schedule the switch to next tagline after exit animation completes
//         setTimeout(() => {
//           this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.loadingTaglines.length;
//           this.exitingTaglineIndex = null;
//           this.cdr.detectChanges();
//         }, 500); // Match the fadeOut animation duration
//       }, 5000); // Total time each tagline is displayed
//     }
//   }

//   // Helper methods for tagline animation
//   isTaglineActive(index: number): boolean {
//     return index === this.currentTaglineIndex;
//   }

//   isTaglineExiting(index: number): boolean {
//     return index === this.exitingTaglineIndex;
//   }

//   isTaglineVisible(index: number): boolean {
//     return this.isTaglineActive(index) || this.isTaglineExiting(index);
//   }

//   ngAfterViewInit() {
//     if (this.isBrowser) {
//       this.observeTimelineItems();
//       this.observeFeatureItems();
//       this.observeAnimatedElements();
//       this.cdr.detectChanges(); // Force change detection after view init
//     }

//     const text = "Artificial Intelligence";
//     let i = 0;
//     const h1 = document.querySelector('h1 span')!;
//     h1.textContent = "";
//     const type = () => {
//       if (i < text.length) {
//         h1.textContent += text.charAt(i);
//         i++;
//         setTimeout(type, 250);
//       }
//     };
//     setTimeout(type, 500);
//   }

//   private observeTimelineItems() {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.remove('opacity-0', 'translate-y-8');
//             entry.target.classList.add('opacity-100', 'translate-y-0');
//           }
//         });
//       },
//       { threshold: 0.3 }
//     );

//     this.timelineItems.forEach(item => observer.observe(item.nativeElement));
//   }

//   private observeFeatureItems() {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add('visible');

//             // Update current section for progress indicator
//             const index = Array.from(this.featureItems).findIndex(item =>
//               item.nativeElement === entry.target
//             );
//             if (index !== -1) {
//               this.currentSection = index;
//               this.updateProgressIndicator();
//             }
//           }
//         });
//       },
//       { threshold: 0.2, rootMargin: '-100px 0px' }
//     );

//     if (this.featureItems) {
//       this.featureItems.forEach(item => observer.observe(item.nativeElement));
//     }
//   }

//   private observeAnimatedElements() {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add('visible');
//           }
//         });
//       },
//       { threshold: 0.1, rootMargin: '-50px 0px' }
//     );

//     if (this.animatedElements) {
//       this.animatedElements.forEach(element => observer.observe(element.nativeElement));
//     }
//   }

//   private updateProgressIndicator() {
//     const dots = document.querySelectorAll('.progress-dot');
//     dots.forEach((dot, index) => {
//       if (index === this.currentSection) {
//         dot.classList.add('active');
//       } else {
//         dot.classList.remove('active');
//       }
//     });
//   }



//   selectFeature(index: number) {
//     this.selectedFeature = index;
//     this.showDetailView = true;
//     // Prevent body scrolling when modal is open
//     document.body.style.overflow = 'hidden';
//   }

//   scrollToFeature(index: number) {
//     this.currentSection = index;
//     this.updateProgressIndicator();

//     const featureElement = this.featureItems.toArray()[index]?.nativeElement;
//     if (featureElement) {
//       featureElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }

//   closeDetailView() {
//     this.showDetailView = false;
//     // Re-enable body scrolling
//     document.body.style.overflow = '';
//   }

//   @HostListener('window:resize')
//   onResize(): void {
//     // Update any responsive elements if needed
//     if (this.isBrowser) {
//       // Refresh the progress indicator
//       this.updateProgressIndicator();
//     }
//   }

//   toggleMobileMenu() {
//     this.isMobileMenuOpen = !this.isMobileMenuOpen;
//   }

//   scrollToFeatures() {
//     const featuresSection = document.getElementById('features');
//     featuresSection?.scrollIntoView({ behavior: 'smooth' });
//     this.isMobileMenuOpen = false;
//   }

//   ngOnDestroy() {
//     // Clean up intervals
//     if (this.taglineInterval) {
//       clearInterval(this.taglineInterval);
//     }
//   }
// }

import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, HttpClientModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;
  @ViewChildren('featureItem') featureItems!: QueryList<ElementRef>;
  @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;
  private isBrowser: boolean;
  private taglineInterval: any;
  private exitingTaglineIndex: number | null = null;
  selectedFeature: number | null = null;
  showDetailView: boolean = false;
  currentSection: number = 0;
  isStaticPage: boolean = false;
  safeContent: SafeHtml | null = null;

  loadingTaglines: string[] = [
    "Empowering Your Support Team",
    "AI That Learns Your Business",
    "24/7 Customer Happiness",
    "Built for Scale"
  ];

  detailedFeatures = [
    {
      title: "Simple Setup",
      description: "Get started in minutes, not weeks",
      imageSrc: "assets/landing/train.png",
      points: [
        "Upload your PDFs - Instantly extract knowledge from your existing documents, manuals, and guides",
        "Connect your website - Automatically pull information from your website content and FAQs"
      ],
      iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    },
    {
      title: "24/7 Customer Support",
      description: "Never miss a customer query again",
      imageSrc: "assets/landing/analytics.png",
      points: [
        "Always available - Provide instant responses while your team rests, no staffing required",
        "Consistent quality - Deliver the same high-quality support experience at 3 PM or 3 AM"
      ],
      iconPath: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
    },
    {
      title: "Easy Updates",
      description: "Keep your AI current with zero technical skills",
      imageSrc: "assets/landing/editing.png",
      points: [
        "One-click updates - Make changes to your AI's knowledge that take effect immediately",
        "Simple interface - No coding required to maintain and improve your chatbot"
      ],
      iconPath: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    },
    {
      title: "Turn Support into Sales",
      description: "Generate revenue from customer conversations",
      imageSrc: "assets/landing/ticket.png",
      points: [
        "Automated lead capture - Identify sales opportunities during support conversations",
        "Customer journey tracking - Follow the path from support inquiry to paying customer",
        "Smart ticket management - Organize and prioritize support issues based on business impact",
        "ROI measurement - See exactly how your chatbot contributes to your bottom line"
      ],
      iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14h6M9 10h6"
    }
  ];

  currentTaglineIndex = 0;
  currentTagline: string = this.loadingTaglines[0];
  isLoading = true;
  isMobileMenuOpen = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
      this.startTaglineRotation();
    }
    this.currentTagline = this.loadingTaglines[this.currentTaglineIndex];

    // Check if this is a static page route
    const page = this.route.snapshot.data['page'];
    if (page) {
      this.isStaticPage = true;
      this.http.get(`/assets/${page}.html`, { responseType: 'text' })
        .subscribe({
          next: (content) => {
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(content);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading static page:', err);
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(
              '<p>Error loading content. Please try again later.</p>'
            );
            this.cdr.detectChanges();
          }
        });
    } else {
      this.isStaticPage = false;
    }

    this.cdr.detectChanges();
  }

  private startTaglineRotation() {
    if (this.isBrowser) {
      this.currentTaglineIndex = 0;
      this.exitingTaglineIndex = null;
      this.cdr.detectChanges();

      this.taglineInterval = setInterval(() => {
        this.exitingTaglineIndex = this.currentTaglineIndex;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.loadingTaglines.length;
          this.exitingTaglineIndex = null;
          this.cdr.detectChanges();
        }, 500);
      }, 5000);
    }
  }

  isTaglineActive(index: number): boolean {
    return index === this.currentTaglineIndex;
  }

  isTaglineExiting(index: number): boolean {
    return index === this.exitingTaglineIndex;
  }

  isTaglineVisible(index: number): boolean {
    return this.isTaglineActive(index) || this.isTaglineExiting(index);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.observeTimelineItems();
      this.observeFeatureItems();
      this.observeAnimatedElements();
      this.cdr.detectChanges();

      const text = "Artificial Intelligence";
      let i = 0;
      const h1 = document.querySelector('h1 span')!;
      h1.textContent = "";
      const type = () => {
        if (i < text.length) {
          h1.textContent += text.charAt(i);
          i++;
          setTimeout(type, 250);
        }
      };
      setTimeout(type, 500);
    }
  }

  private observeTimelineItems() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.3 }
    );

    this.timelineItems.forEach(item => observer.observe(item.nativeElement));
  }

  private observeFeatureItems() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const index = Array.from(this.featureItems).findIndex(item =>
              item.nativeElement === entry.target
            );
            if (index !== -1) {
              this.currentSection = index;
              this.updateProgressIndicator();
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '-100px 0px' }
    );

    if (this.featureItems) {
      this.featureItems.forEach(item => observer.observe(item.nativeElement));
    }
  }

  private observeAnimatedElements() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px 0px' }
    );

    if (this.animatedElements) {
      this.animatedElements.forEach(element => observer.observe(element.nativeElement));
    }
  }

  private updateProgressIndicator() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
      if (index === this.currentSection) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  selectFeature(index: number) {
    this.selectedFeature = index;
    this.showDetailView = true;
    document.body.style.overflow = 'hidden';
  }

  scrollToFeature(index: number) {
    this.currentSection = index;
    this.updateProgressIndicator();
    const featureElement = this.featureItems.toArray()[index]?.nativeElement;
    if (featureElement) {
      featureElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  closeDetailView() {
    this.showDetailView = false;
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) {
      this.updateProgressIndicator();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen = false;
  }

  ngOnDestroy() {
    if (this.taglineInterval) {
      clearInterval(this.taglineInterval);
    }
  }
}

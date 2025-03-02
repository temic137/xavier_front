// import { CommonModule } from '@angular/common';
// import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener, PLATFORM_ID, Inject } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { RotatingFeaturesComponent } from '../rotating-features/rotating-features.component';
// import { DomSanitizer, SafeResourceUrl , SafeHtml } from '@angular/platform-browser';

// interface Feature {
//   icon: string;
//   title: string;
//   description: string;
// }

// interface DetailedFeature extends Feature {
//   imageSrc: string;
// }

// interface Testimonial {
//   quote: string;
//   author: string;
//   role: string;
//   company: string;
// }

// interface FooterLink {
//   text: string;
//   route: string;
// }

// interface FooterColumn {
//   title: string;
//   links: FooterLink[];
// }

// @Component({
//   selector: 'app-landing',
//   standalone: true,
//   imports: [RouterLink, CommonModule],
//   templateUrl: './landing.component.html',
//   styleUrls: ['./landing.component.css']
// })
// export class LandingComponent implements OnInit, AfterViewInit {
//   @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;
//   private isBrowser: boolean;
//   loadingTaglines: string[] = [
//     "Empowering Your Support Team",
//     "AI That Learns Your Business",
//     "24/7 Customer Happiness",
//     "Built for Scale"
//   ];

//   // Define detailed features for the timeline
//   detailedFeatures = [
//     {
//       title: "Knowledge Training",
//       description: "Train your AI with multiple data sources",
//       imageSrc: "assets/landing/train.png",
//       points: ["PDF Document Processing", "Web Knowledge Integration"],
//       icon: '<path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>'
//     },
//     {
//       title: "Analytics Dashboard",
//       description: "Track and optimize performance",
//       imageSrc: "assets/landing/analytics.png",
//       points: ["Real-time Metrics", "User Satisfaction Tracking"],
//       icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>'
//     },
//     {
//       title: "Knowledge Management",
//       description: "Easy updates and maintenance",
//       imageSrc: "assets/landing/editing.png",
//       points: ["Real-time Updates", "Version Control"],
//       icon: '<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>'
//     },
//     {
//       title: "Smart Escalation",
//       description: "Seamless handoff to human agents",
//       imageSrc: "assets/landing/real.png",
//       points: ["Intelligent Triggers", "Context Preservation"],
//       icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
//     },
//     {
//       title: "Ticket Management",
//       description: "Organized support ticket handling",
//       imageSrc: "assets/landing/ticket.png",
//       points: ["Automated Ticket Creation", "Priority Management"],
//       icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path><path d="M9 14h6"></path><path d="M9 10h6"></path>'
//     }
//   ];

//   currentTaglineIndex = 0;
//   currentTagline: string = this.loadingTaglines[0]; // Initialize with first tagline
//   isLoading = true;
//   isMobileMenuOpen = false;

//   constructor(@Inject(PLATFORM_ID) platformId: Object, private sanitizer: DomSanitizer) {
//     this.isBrowser = isPlatformBrowser(platformId);
//   }

//   ngOnInit() {
//     if (this.isBrowser) {
//       setTimeout(() => {
//         this.isLoading = false;
//       }, 2000);


//       this.startTaglineRotation();
//     }

//   }

//   private startTaglineRotation() {
//     if (this.isBrowser) {
//       setInterval(() => {
//         this.currentTagline = ''; // Brief empty state to force fade-out
//         setTimeout(() => {
//           this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.loadingTaglines.length;
//           this.currentTagline = this.loadingTaglines[this.currentTaglineIndex];
//         }, 500); // 0.5s delay before new tagline
//       }, 5000);
//     }
//   }

//   ngAfterViewInit() {
//     if (this.isBrowser) {
//       this.observeTimelineItems(); // Updated to observe timeline items
//       this.initParticles();
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

//   private observeTimelineItems() { // Renamed from observeFeatureCards
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.remove('opacity-0', 'translate-y-8');
//             entry.target.classList.add('opacity-100', 'translate-y-0');
//           }
//         });
//       },
//       { threshold: 0.3 } // Adjusted threshold for better visibility
//     );

//     this.timelineItems.forEach(item => observer.observe(item.nativeElement));
//   }

// // Add the particle animation logic
// initParticles() {
//   const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
//   const ctx = canvas.getContext('2d')!;
  
//   // Set canvas size to match the hero section
//   const heroSection = document.querySelector('.pt-32') as HTMLElement;
//   canvas.width = heroSection.offsetWidth;
//   canvas.height = heroSection.offsetHeight;

//   const particles = Array(50).fill(0).map(() => ({
//     x: Math.random() * canvas.width,
//     y: Math.random() * canvas.height,
//     size: Math.random() * 5 + 1,
//     speedX: Math.random() * 0.5 - 0.25,
//     speedY: Math.random() * 0.5 - 0.25
//   }));

//   function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     particles.forEach(p => {
//       ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
//       ctx.beginPath();
//       ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
//       ctx.fill();
//       p.x += p.speedX;
//       p.y += p.speedY;
//       if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
//       if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
//     });
//     requestAnimationFrame(animate);
//   }
//   animate();
// }


// toggleMobileMenu() {
//   this.isMobileMenuOpen = !this.isMobileMenuOpen;
// }

// scrollToFeatures() {
//   const featuresSection = document.getElementById('features');
//   featuresSection?.scrollIntoView({ behavior: 'smooth' });
//   this.isMobileMenuOpen = false;
// }

// getSafeHtml(svg: string): SafeHtml {
//   return this.sanitizer.bypassSecurityTrustHtml(svg);
// }

// }


import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;
  private isBrowser: boolean;
  private taglineInterval: any;
  private exitingTaglineIndex: number | null = null;

  loadingTaglines: string[] = [
    "Empowering Your Support Team",
    "AI That Learns Your Business",
    "24/7 Customer Happiness",
    "Built for Scale"
  ];

  detailedFeatures = [
    {
      title: "Knowledge Training",
      description: "Train your AI with multiple data sources",
      imageSrc: "assets/landing/train.png",
      points: ["PDF Document Processing", "Web Knowledge Integration"],
      iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    },
    {
      title: "Analytics Dashboard",
      description: "Track and optimize performance",
      imageSrc: "assets/landing/analytics.png",
      points: ["Real-time Metrics", "User Satisfaction Tracking"],
      iconPath: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
    },
    {
      title: "Knowledge Management",
      description: "Easy updates and maintenance",
      imageSrc: "assets/landing/editing.png",
      points: ["Real-time Updates", "Version Control"],
      iconPath: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    },
    {
      title: "Smart Escalation",
      description: "Seamless handoff to human agents",
      imageSrc: "assets/landing/real.png",
      points: ["Intelligent Triggers", "Context Preservation"],
      iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    },
    {
      title: "Ticket Management",
      description: "Organized support ticket handling",
      imageSrc: "assets/landing/ticket.png",
      points: ["Automated Ticket Creation", "Priority Management"],
      iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14h6M9 10h6"
    }
  ];

  currentTaglineIndex = 0;
  currentTagline: string = this.loadingTaglines[0];
  isLoading = true;
  isMobileMenuOpen = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef
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
  }

  private startTaglineRotation() {
    if (this.isBrowser) {
      this.taglineInterval = setInterval(() => {
        // Mark current tagline as exiting
        this.exitingTaglineIndex = this.currentTaglineIndex;
        
        // Schedule the switch to next tagline after exit animation completes
        setTimeout(() => {
          this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.loadingTaglines.length;
          this.exitingTaglineIndex = null;
          this.cdr.detectChanges();
        }, 500); // This should match the fadeOut animation duration
        
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  // Helper methods for tagline animation
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
      this.initParticles();
      this.cdr.detectChanges(); // Force change detection after view init
    }

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

  initParticles() {
    const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const heroSection = document.querySelector('.pt-32') as HTMLElement;
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;

    const particles = Array(50).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 5 + 1,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25
    }));

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen = false;
  }
}
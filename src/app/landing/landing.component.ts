


// import { CommonModule } from '@angular/common';
// import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
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
//   private isBrowser: boolean;
//   private taglineInterval: any;
//   private exitingTaglineIndex: number | null = null;

//   loadingTaglines: string[] = [
//     "Empowering Your Support Team",
//     "AI That Learns Your Business",
//     "24/7 Customer Happiness",
//     "Built for Scale"
//   ];

//   detailedFeatures = [
//     {
//       title: "Knowledge Training",
//       description: "Train your AI with multiple data sources",
//       imageSrc: "assets/landing/train.png",
//       points: ["PDF Document Processing", "Web Knowledge Integration"],
//       iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
//     },
//     {
//       title: "Analytics Dashboard",
//       description: "Track and optimize performance",
//       imageSrc: "assets/landing/analytics.png",
//       points: ["Real-time Metrics", "User Satisfaction Tracking"],
//       iconPath: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
//     },
//     {
//       title: "Knowledge Management",
//       description: "Easy updates and maintenance",
//       imageSrc: "assets/landing/editing.png",
//       points: ["Real-time Updates", "Version Control"],
//       iconPath: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
//     },
//     {
//       title: "Smart Escalation",
//       description: "Seamless handoff to human agents",
//       imageSrc: "assets/landing/real.png",
//       points: ["Intelligent Triggers", "Context Preservation"],
//       iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//     },
//     {
//       title: "Ticket Management",
//       description: "Organized support ticket handling",
//       imageSrc: "assets/landing/ticket.png",
//       points: ["Automated Ticket Creation", "Priority Management"],
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
//   }

//   private startTaglineRotation() {
//     if (this.isBrowser) {
//       this.taglineInterval = setInterval(() => {
//         // Mark current tagline as exiting
//         this.exitingTaglineIndex = this.currentTaglineIndex;
        
//         // Schedule the switch to next tagline after exit animation completes
//         setTimeout(() => {
//           this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.loadingTaglines.length;
//           this.exitingTaglineIndex = null;
//           this.cdr.detectChanges();
//         }, 500); // This should match the fadeOut animation duration
        
//         this.cdr.detectChanges();
//       }, 5000);
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
//       this.initParticles();
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

//   initParticles() {
//     const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
//     const ctx = canvas.getContext('2d')!;
//     const heroSection = document.querySelector('.pt-32') as HTMLElement;
//     canvas.width = heroSection.offsetWidth;
//     canvas.height = heroSection.offsetHeight;

//     const particles = Array(50).fill(0).map(() => ({
//       x: Math.random() * canvas.width,
//       y: Math.random() * canvas.height,
//       size: Math.random() * 5 + 1,
//       speedX: Math.random() * 0.5 - 0.25,
//       speedY: Math.random() * 0.5 - 0.25
//     }));

//     function animate() {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.forEach(p => {
//         ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
//         ctx.fill();
//         p.x += p.speedX;
//         p.y += p.speedY;
//         if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
//       });
//       requestAnimationFrame(animate);
//     }
//     animate();
//   }

//   toggleMobileMenu() {
//     this.isMobileMenuOpen = !this.isMobileMenuOpen;
//   }

//   scrollToFeatures() {
//     const featuresSection = document.getElementById('features');
//     featuresSection?.scrollIntoView({ behavior: 'smooth' });
//     this.isMobileMenuOpen = false;
//   }
// }



import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, PLATFORM_ID, Inject, HostListener } from '@angular/core';
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
  private particleCanvas: HTMLCanvasElement | null = null;
  private particleCtx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private mouse = { x: null as number | null, y: null as number | null, radius: 150 };

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
    this.currentTagline = this.loadingTaglines[this.currentTaglineIndex];
    this.cdr.detectChanges(); // Force initial change detection
  }

  private startTaglineRotation() {
    if (this.isBrowser) {
      // Set initial tagline visibility
      this.currentTaglineIndex = 0;
      this.exitingTaglineIndex = null;
      this.cdr.detectChanges();
      
      this.taglineInterval = setInterval(() => {
        // Mark current tagline as exiting
        this.exitingTaglineIndex = this.currentTaglineIndex;
        this.cdr.detectChanges();
        
        // Schedule the switch to next tagline after exit animation completes
        setTimeout(() => {
          this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.loadingTaglines.length;
          this.exitingTaglineIndex = null;
          this.cdr.detectChanges();
        }, 500); // Match the fadeOut animation duration
      }, 5000); // Total time each tagline is displayed
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
      this.initFullPageParticles();
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

  // Handle window resize to adjust particle canvas dimensions
  @HostListener('window:resize')
  onResize(): void {
    if (this.particleCanvas && this.isBrowser) {
      this.resizeParticleCanvas();
      this.initParticles();
    }
  }

  // Track mouse position for interactive particles
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouse.x = event.x;
    this.mouse.y = event.y;
  }

  // Initialize full-page particle animation
  private initFullPageParticles(): void {
    if (!this.isBrowser) return;
    
    // Create the canvas element
    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.classList.add('particle-canvas');
    
    // Apply styles to position the canvas as a fixed background
    this.particleCanvas.style.position = 'fixed';
    this.particleCanvas.style.top = '0';
    this.particleCanvas.style.left = '0';
    this.particleCanvas.style.width = '100%';
    this.particleCanvas.style.height = '100%';
    this.particleCanvas.style.pointerEvents = 'none';
    this.particleCanvas.style.zIndex = '-1';
    
    // Add the canvas to the document body
    document.body.appendChild(this.particleCanvas);
    
    // Get the 2D context and initialize the canvas size
    this.particleCtx = this.particleCanvas.getContext('2d');
    this.resizeParticleCanvas();
    
    // Create particles and start the animation
    this.initParticles();
    this.animateParticles();
  }

  // Set canvas size to match window dimensions
  private resizeParticleCanvas(): void {
    if (!this.particleCanvas) return;
    
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
  }

  // Initialize particles
  private initParticles(): void {
    if (!this.particleCanvas) return;
    
    this.particles = [];
    // Adjust number of particles based on screen size
    const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 10000), 100);
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 2 + 1;
      const x = Math.random() * (this.particleCanvas.width - size * 2) + size;
      const y = Math.random() * (this.particleCanvas.height - size * 2) + size;
      const directionX = Math.random() * 1 - 0.5;
      const directionY = Math.random() * 1 - 0.5;
      const opacity = Math.random() * 0.5 + 0.3;
      
      this.particles.push(new Particle(x, y, directionX, directionY, size, opacity));
    }
  }

  // Animate the particles
  private animateParticles(): void {
    if (!this.particleCtx || !this.particleCanvas) return;
    
    // Clear the canvas
    this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
    
    // Update and draw each particle
    for (const particle of this.particles) {
      particle.update(this.particles, this.mouse, this.particleCanvas, this.particleCtx);
    }
    
    // Connect particles with lines to create web effect
    this.connectParticles();
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  // Draw lines between particles that are close to each other
  private connectParticles(): void {
    if (!this.particleCtx) return;
    
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only connect particles within a certain distance
        if (distance < 150) {
          // Make lines more transparent the further apart particles are
          this.particleCtx.beginPath();
          this.particleCtx.strokeStyle = `rgba(0, 0, 0, ${0.2 * (1 - distance / 150)})`;
          this.particleCtx.lineWidth = 0.5;
          this.particleCtx.moveTo(this.particles[a].x, this.particles[a].y);
          this.particleCtx.lineTo(this.particles[b].x, this.particles[b].y);
          this.particleCtx.stroke();
        }
      }
    }
  }

  // // Keep original method for backward compatibility
  // initParticles() {
  //   // This is the original method, but we're now using initFullPageParticles instead
  //   // Keeping this for backward compatibility
  //   const canvas = document.getElementById('heroCanvas') as HTMLCanvasElement;
  //   if (!canvas) return; // Skip if canvas doesn't exist in the DOM
    
  //   const ctx = canvas.getContext('2d')!;
  //   const heroSection = document.querySelector('.pt-32') as HTMLElement;
  //   if (!heroSection) return;
    
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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen = false;
  }

  ngOnDestroy() {
    // Clean up intervals and animation frames
    if (this.taglineInterval) {
      clearInterval(this.taglineInterval);
    }
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove the particle canvas if it exists
    if (this.particleCanvas && this.particleCanvas.parentNode) {
      this.particleCanvas.parentNode.removeChild(this.particleCanvas);
    }
  }
}

// Particle class to manage individual particles
class Particle {
  constructor(
    public x: number,
    public y: number,
    private directionX: number,
    private directionY: number,
    private size: number,
    private opacity: number
  ) {}

  // Draw the particle
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.fill();
  }

  // Update particle position and handle interactions
  update(
    particles: Particle[],
    mouse: { x: number | null, y: number | null, radius: number },
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): void {
    // Bounce off canvas edges
    if (this.x > canvas.width || this.x < 0) {
      this.directionX = -this.directionX;
    }
    
    if (this.y > canvas.height || this.y < 0) {
      this.directionY = -this.directionY;
    }
    
    // Mouse repulsion effect
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius) {
        // Calculate force direction and magnitude
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouse.radius - distance) / mouse.radius;
        
        // Apply force to particle position
        const directionX = forceDirectionX * force * 2;
        const directionY = forceDirectionY * force * 2;
        
        this.x += directionX;
        this.y += directionY;
      }
    }
    
    // Move particle
    this.x += this.directionX;
    this.y += this.directionY;
    
    // Draw the particle
    this.draw(ctx);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RotatingFeaturesComponent } from '../rotating-features/rotating-features.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface DetailedFeature extends Feature {
  imageSrc: string;
}


interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface FooterLink {
  text: string;
  route: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChildren('featureCard') featureCards!: QueryList<ElementRef>;
  private isBrowser: boolean;

  companyCount = 1000;
  currentYear = new Date().getFullYear();
  isMobileMenuOpen = false;

  isVideoModalOpen = false;
  
  isVideoLoading = true;
  hasVideoError = false;


  currentSlide = 0;
  private intervalId: any;
  
  // Replace YOUR_VIDEO_ID with your actual YouTube video ID
  private readonly videoId = 'YOUR_VIDEO_ID';


  // Update these paths to match your actual video and thumbnail locations in assets folder
  videoSrc = 'assets/videos/demo.mp4';
  thumbnailSrc = 'assets/images/video-thumbnail.jpg';

  isLoading = true;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  

  features: Feature[] = [
    {
      icon: 'fas fa-clock text-blue-500 w-8 h-8',
      title: '24/7 Availability',
      description: 'Never miss a customer query with round-the-clock AI support'
    },
    {
      icon: 'fas fa-bolt text-purple-500 w-8 h-8',
      title: 'Smart Responses',
      description: 'AI-powered responses that understand context and provide accurate solutions'
    },
    {
      icon: 'fas fa-chart-bar text-green-500 w-8 h-8',
      title: 'Analytics & Insights',
      description: 'Detailed analytics to help you understand customer needs better'
    }
  ];


  detailedFeatures: DetailedFeature[] = [
    {
      icon: 'fas fa-book text-blue-500 w-8 h-8',
      title: 'Comprehensive Knowledge Training',
      description: 'Train your chatbots using multiple data sources including PDF documents, web knowledge bases, and APIs',
      imageSrc: '/assets/images/knowledge-training.jpg'
    },
    {
      icon: 'fas fa-cog text-purple-500 w-8 h-8',
      title: 'Easy Knowledge Base Management',
      description: 'Edit and update your chatbot\'s knowledge base in real-time with our intuitive interface',
      imageSrc: '/assets/images/knowledge-management.jpg'
    }
  ];

  statistics = [
    { value: '99%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Availability' },
    { value: '1000+', label: 'Active Users' },
    { value: '5x', label: 'Faster Response Time' }
  ];

  testimonials = [
    {
      quote: 'Xavier AI has transformed our customer service. Response times are down 80% and satisfaction is up.',
      author: 'Sarah Johnson',
      role: 'CTO at TechCorp'
    },
    {
      quote: 'Implementation was seamless and the results were immediate. Our team loves it.',
      author: 'Michael Chen',
      role: 'Head of Support at StartupX'
    },
    {
      quote: 'The AI responses are incredibly accurate and natural. Our customers love it.',
      author: 'Emily Rodriguez',
      role: 'Customer Success at CloudTech'
    }
  ];

  footerColumns: FooterColumn[] = [
    {
      title: 'Product',
      links: [
        { text: 'Features', route: '/features' },
        { text: 'Pricing', route: '/pricing' },
        { text: 'Integration', route: '/integration' },
        
      ]
    },
    {
      title: 'Company',
      links: [
        { text: 'About', route: '/abouts' },
        { text: 'Careers', route: '/careerss' },
        { text: 'Contact', route: '/contacts' }
      ]
    },
  ];


  openVideoModal() {
    this.isVideoModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeVideoModal() {
    this.isVideoModalOpen = false;
    document.body.style.overflow = 'auto';
    const video = document.querySelector('video');
    if (video) {
      video.pause();
    }
  }

  onVideoLoad() {
    this.isVideoLoading = false;
  }

  onVideoError() {
    this.isVideoLoading = false;
    this.hasVideoError = true;
  }

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 2500);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isBrowser) {
      this.checkFeatureCardsVisibility();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Initial check for visible cards
      setTimeout(() => {
        this.checkFeatureCardsVisibility();
      }, 100);
    }
  }

  private checkFeatureCardsVisibility() {
    if (!this.isBrowser) return;
    
    const windowHeight = window.innerHeight;
    
    this.featureCards.forEach((cardRef: ElementRef) => {
      const element = cardRef.nativeElement;
      const rect = element.getBoundingClientRect();
      
      // Check if element is in viewport
      if (rect.top <= windowHeight * 0.85) { // Show when element is 85% from the top of viewport
        element.classList.add('opacity-100', 'translate-y-0');
      }
    });
  }
}

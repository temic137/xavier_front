import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RotatingFeaturesComponent } from '../rotating-features/rotating-features.component';


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
export class LandingComponent {

  companyCount = 1000;
  currentYear = new Date().getFullYear();

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

  testimonials: Testimonial[] = [
    {
      quote: 'The AI chatbot has transformed our customer service operations. Response times are down 80% and satisfaction is up.',
      author: 'Sarah Johnson',
      role: 'CTO at TechCorp'
    },
    {
      quote: 'Implementation was seamless and the results were immediate. Our team can now focus on strategic initiatives.',
      author: 'Michael Chen',
      role: 'Head of Support at StartupX'
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

  onGetStarted(): void {
    console.log('Get Started clicked');
    // Implement navigation or action
  }

  startTrial(): void {
    console.log('Start Trial clicked');
    // Implement trial start logic
  }

  watchDemo(): void {
    console.log('Watch Demo clicked');
    // Implement demo video logic
  }

  getStarted(): void {
    console.log('Get Started Now clicked');
    // Implement get started logic
  }
}
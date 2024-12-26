import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Feature } from '../feature.interface';
@Component({
  selector: 'app-rotating-features',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './rotating-features.component.html',
  styleUrl: './rotating-features.component.css'
})
export class RotatingFeaturesComponent implements OnInit, OnDestroy {

  features: Feature[] = [
    {
      title: 'Create Multiple Chatbots',
      description: 'Build and manage multiple AI chatbots for different purposes. Create specialized bots for customer service, sales, technical support, or any other use case. Each bot can be individually customized and trained for optimal performance.',
      image: './assets/multiple.png'
    },
    {
      title: 'Comprehensive Knowledge Training',
      description: 'Train your chatbots using multiple data sources including PDF documents, web knowledge bases, text documents, API URLs, and local knowledge bases. Our flexible training system ensures your chatbots have access to all the information they need.',
      image: './assets/train.png'
    },
    {
      title: 'Easy Knowledge Base Management',
      description: 'Edit and update your chatbot\'s knowledge base in real-time. Our intuitive interface allows you to add, modify, or remove information instantly, ensuring your chatbots always have the most up-to-date information.',
      image: './assets/edit.png'
    },
    {
      title: 'Seamless Website Integration',
      description: 'Integrate your chatbots into any website with our simple embed code. Our chatbots appear as a professional live chat widget, providing instant support to your visitors while maintaining your website\'s look and feel.',
      image: './assets/integration.png'
    },
    {
      title: 'Real-time Analytics & Testing',
      description: 'Monitor your chatbots\' performance with comprehensive analytics. Test conversations, track user satisfaction, and gather insights about user interactions. Make data-driven decisions to improve your chatbots\' effectiveness.',
      image: './assets/analytics.png'
    }
  ];

  currentIndex = 0;
  isAnimating = false;
  private autoRotateInterval: any;

  ngOnInit() {
    this.startAutoRotate();
  }

  ngOnDestroy() {
    this.stopAutoRotate();
  }

  startAutoRotate() {
    this.autoRotateInterval = setInterval(() => {
      this.nextFeature();
    }, 5000);
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
    }
  }

  nextFeature() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.currentIndex = (this.currentIndex + 1) % this.features.length;
      setTimeout(() => this.isAnimating = false, 500);
    }
  }

  prevFeature() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.currentIndex = (this.currentIndex - 1 + this.features.length) % this.features.length;
      setTimeout(() => this.isAnimating = false, 500);
    }
  }

  goToFeature(index: number) {
    if (!this.isAnimating && index !== this.currentIndex) {
      this.isAnimating = true;
      this.currentIndex = index;
      setTimeout(() => this.isAnimating = false, 500);
    }
  }

  onMouseEnter() {
    this.stopAutoRotate();
  }

  onMouseLeave() {
    this.startAutoRotate();
  }
}

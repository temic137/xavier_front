// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ApiService } from '../api.service';
// import { RouterLink, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { routes } from '../app.routes';


// interface Chatbot {
//   id: string;
//   name: string;
//   trainedFile?: string;
// }

// @Component({
//   selector: 'app-chatbot-list',
//   standalone: true,
//   imports: [CommonModule,FormsModule,RouterLink,RouterModule],
//   templateUrl:'./chatbot-list.component.html',
//   styleUrl:'./chatbot-list.component.css',
  
// })
// export class ChatbotListComponent implements OnInit {
//   chatbots: Chatbot[] = [];
//   message: string = '';
//   isSuccess: boolean = true;
//   showForm: boolean = false;
//   selectedChatbot!: Chatbot;
//   selectedChatbotForList: string | null = null;
//   isModalOpen = false;
//   newChatbotName = '';

//   constructor(private apiService: ApiService, private router:Router) {}

//   ngOnInit() {
//     this.fetchChatbots();
//   }

//   fetchChatbots() {
//     this.apiService.getChatbots().subscribe({
//       next: (response) => {
//         this.chatbots = response;
//       },
//       error: (error) => {
//         this.showErrorMessage('Failed to fetch chatbots');
//         console.error('Failed to fetch chatbots', error);
//       }
//     });
//   }


//   createChatbot() {
//     const name = prompt('Enter chatbot name:');
//     if (name) {
//       this.apiService.createChatbot(name).subscribe({
//         next: () => {
//           this.showSuccessMessage('Chatbot created successfully');
//           this.fetchChatbots();
//         },
//         error: (error) => {
//           this.showErrorMessage('Failed to create chatbot');
//           console.error('Failed to create chatbot', error);
//         }
//       });
//     }
//   }

//   logout1(){
//     this.apiService.logout().subscribe(
//       (response) => {
//         console.log('Logged Out successfully');
       
//       },
//     )
    
//   }

//   openModal() {
//     this.isModalOpen = true;
//   }

//   closeModal() {
//     this.isModalOpen = false;
//   }

 

//   deleteChatbot(chatbotId: string) {
//     if (confirm('Are you sure you want to delete this chatbot?')) {
//       this.apiService.deleteChatbot(chatbotId).subscribe({
//         next: () => {
//           this.showSuccessMessage('Chatbot deleted successfully');
//           this.fetchChatbots();
//         },
//         error: (error) => {
//           this.showErrorMessage('Failed to delete chatbot');
//           console.error('Failed to delete chatbot', error);
//         }
//       });
//     }
//   }

//   private showSuccessMessage(message: string) {
//     this.message = message;
//     this.isSuccess = true;
//     this.clearMessageAfterDelay();
//   }

//   private showErrorMessage(message: string) {
//     this.message = message;
//     this.isSuccess = false;
//     this.clearMessageAfterDelay();
//   }

//   private clearMessageAfterDelay() {
//     setTimeout(() => {
//       this.message = '';
//     }, 3000);
//   }
// }







import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Chatbot {
  id: string;
  name: string;
}

@Component({
  selector: 'app-chatbot-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,RouterModule],
  templateUrl: './chatbot-list.component.html',
  styleUrls: ['./chatbot-list.component.css'],
})
export class ChatbotListComponent implements OnInit {
  chatbots: Chatbot[] = [];
  message: string = '';
  isSuccess: boolean = true;
  showModal: boolean = false;
  newChatbotName: string = '';
  showDeleteModal: boolean = false;
  chatbotToDeleteId: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.fetchChatbots();
  }

  fetchChatbots() {
    this.apiService.getChatbots().subscribe({
      next: (response) => {
        this.chatbots = response;
      },
      error: () => {
        this.showErrorMessage('Failed to fetch chatbots');
      },
    });
  }

  toggleModal() {
    this.showModal = !this.showModal;
    this.newChatbotName = '';
  }

  createChatbot() {
    if (this.newChatbotName.trim()) {
      this.apiService.createChatbot(this.newChatbotName).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot created successfully');
          this.fetchChatbots();
          this.toggleModal();
        },
        error: () => {
          this.showErrorMessage('Failed to create chatbot');
        },
      });
    } else {
      this.showErrorMessage('Chatbot name cannot be empty');
    }
  }




  deleteChatbot(chatbotId: string) {
    // Set the chatbot to delete and show the delete modal
    this.chatbotToDeleteId = chatbotId;
    this.showDeleteModal = true;
  }

  toggleDeleteModal(show: boolean) {
    // Toggles the modal visibility
    this.showDeleteModal = show;
    this.chatbotToDeleteId = null; // Clear chatbot ID after closing
  }

  confirmDelete() {
    // Proceed with deletion if modal is confirmed
    if (this.chatbotToDeleteId) {
      this.apiService.deleteChatbot(this.chatbotToDeleteId).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot deleted successfully');
          this.fetchChatbots();
        },
        error: () => {
          this.showErrorMessage('Failed to delete chatbot');
        }
      });
    }
    // Close modal after confirming
    this.showDeleteModal = false;
    this.chatbotToDeleteId = null;
  }

  logout1() {
    this.apiService.logout().subscribe(() => {
      console.log('Logged out successfully');
      this.router.navigate(['/login']);
    });
  }

  private showSuccessMessage(message: string) {
    this.message = message;
    this.isSuccess = true;
    this.clearMessageAfterDelay();
  }

  private showErrorMessage(message: string) {
    this.message = message;
    this.isSuccess = false;
    this.clearMessageAfterDelay();
  }

  private clearMessageAfterDelay() {
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}

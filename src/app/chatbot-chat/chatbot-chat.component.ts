import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { ChatbotListComponent } from '../chatbot-list/chatbot-list.component';
import { ConversationContextService, Message, Conversation } from './conversation-context.service';

@Component({
  selector: 'app-chatbot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-chat.component.html',
  styleUrl: './chatbot-chat.component.css',
})
export class ChatbotChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  private shouldScrollToBottom = true;

  chatbotId: string = '';
  chatbotName: string = '';
  messages: any[] = [];
  currentMessage: string = '';
  isRecording: boolean = false;
  audioUrl: string | null = null;
  oncli: boolean = false;
  showFeedback: boolean = false;
  feedbackText: string = '';
  isLoading: boolean = false;
  conversationId: string | undefined = undefined;


  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private conversationService: ConversationContextService
  ) {}

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    this.chatbotName = 'Test it';

    // Load the most recent conversation for this chatbot, if any
    const conversations = this.conversationService.getChatbotConversations(this.chatbotId);
    if (conversations.length > 0) {
      // Get the most recent conversation
      const recentConversation = conversations[0];
      this.conversationId = recentConversation.id;

      // Load messages from this conversation
      this.loadConversationMessages(recentConversation);
    }
  }

  /**
   * Load messages from a conversation into the UI
   */
  private loadConversationMessages(conversation: Conversation) {
    // Clear existing messages
    this.messages = [];

    // Add messages to the UI
    conversation.messages.forEach(msg => {
      this.messages.push({
        sender: msg.role === 'user' ? 'user' : 'bot',
        text: msg.content
      });
    });
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      const userMessage = this.currentMessage;

      // Add user message to UI
      this.messages.push({sender: 'user', text: userMessage});
      this.isLoading = true;

      // Add a temporary loading message
      const loadingMsgIndex = this.messages.length;
      this.messages.push({sender: 'bot', text: 'Thinking...', isLoading: true});

      // Store user message in conversation context
      if (this.conversationId) {
        this.conversationService.addMessage(this.conversationId, this.chatbotId, {
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        });
      }

      // Get recent messages for context (client-side)
      const recentMessages = this.conversationId ?
        this.conversationService.getRecentMessages(this.conversationId, 5) : [];

      // Only send the most recent messages to the backend to reduce payload size
      const contextToSend = recentMessages.length > 0 ? this.conversationId : undefined;

      this.apiService.askChatbot(this.chatbotId, userMessage, 'text', contextToSend).subscribe(
        response => {
          // Replace the loading message with the actual response
          this.messages[loadingMsgIndex] = {sender: 'bot', text: response.answer};
          this.isLoading = false;

          // Store the conversation ID for future messages
          if (response.conversation_id) {
            this.conversationId = response.conversation_id;

            // Store bot response in conversation context
            this.conversationService.addMessage(this.conversationId, this.chatbotId, {
              role: 'assistant',
              content: response.answer,
              timestamp: new Date()
            });
          }
        },
        error => {
          console.error('Error asking chatbot:', error);
          // Replace loading message with error message
          this.messages[loadingMsgIndex] = {sender: 'bot', text: 'Sorry, I encountered an error. Please try again.'};
          this.isLoading = false;
        }
      );
      this.currentMessage = '';
    }
  }

  toggleRecording() {
    this.oncli=true;
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        this.mediaRecorder.onstop = () => {
          this.convertToWav(new Blob(this.audioChunks, { type: 'audio/webm' }));
          this.audioChunks = [];
        };
        this.mediaRecorder.start();
        this.isRecording = true;
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  convertToWav(audioBlob: Blob) {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result instanceof ArrayBuffer) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.decodeAudioData(event.target.result).then(buffer => {
          const wavBuffer = this.bufferToWav(buffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(wavBlob);
        });
      }
    };
    reader.readAsArrayBuffer(audioBlob);
  }

  bufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const channels = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    this.setUint32(view, 0, 0x46464952);
    this.setUint32(view, 4, length - 8);
    this.setUint32(view, 8, 0x45564157);
    this.setUint32(view, 12, 0x20746d66);
    this.setUint32(view, 16, 16);
    this.setUint16(view, 20, 1);
    this.setUint16(view, 22, numOfChan);
    this.setUint32(view, 24, buffer.sampleRate);
    this.setUint32(view, 28, buffer.sampleRate * 2 * numOfChan);
    this.setUint16(view, 32, numOfChan * 2);
    this.setUint16(view, 34, 16);
    this.setUint32(view, 36, 0x61746164);
    this.setUint32(view, 40, length - 44);

    // write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return out;
  }

  setUint16(view: DataView, offset: number, value: number) {
    view.setUint16(offset, value, true);
  }

  setUint32(view: DataView, offset: number, value: number) {
    view.setUint32(offset, value, true);
  }

  sendAudioMessage() {
    if (this.audioUrl) {
      this.messages.push({sender: 'user', text: 'Audio message sent'});
      this.isLoading = true;

      // Add a temporary loading message
      const loadingMsgIndex = this.messages.length;
      this.messages.push({sender: 'bot', text: 'Processing audio...', isLoading: true});

      // Store user message in conversation context
      if (this.conversationId) {
        this.conversationService.addMessage(this.conversationId, this.chatbotId, {
          role: 'user',
          content: 'Audio message sent',
          timestamp: new Date()
        });
      }

      // Get recent messages for context (client-side)
      const recentMessages = this.conversationId ?
        this.conversationService.getRecentMessages(this.conversationId, 5) : [];

      // Only send the most recent messages to the backend to reduce payload size
      const contextToSend = recentMessages.length > 0 ? this.conversationId : undefined;

      fetch(this.audioUrl)
        .then(res => res.blob())
        .then(blob => {
          const audioFile = new File([blob], 'audio_message.wav', { type: 'audio/wav' });
          this.apiService.askChatbot(this.chatbotId, audioFile, 'audio', contextToSend).subscribe(
            response => {
              // Replace the loading message with the actual response
              this.messages[loadingMsgIndex] = {sender: 'bot', text: response.answer};
              this.isLoading = false;

              // Store the conversation ID for future messages
              if (response.conversation_id) {
                this.conversationId = response.conversation_id;

                // Store bot response in conversation context
                this.conversationService.addMessage(this.conversationId, this.chatbotId, {
                  role: 'assistant',
                  content: response.answer,
                  timestamp: new Date()
                });
              }
            },
            error => {
              console.error('Error uploading audio:', error);
              // Replace loading message with error message
              this.messages[loadingMsgIndex] = {sender: 'bot', text: 'Sorry, I encountered an error processing your audio. Please try again.'};
              this.isLoading = false;
            }
          );
        })
        .catch(error => {
          console.error('Error processing audio:', error);
          // Replace loading message with error message
          this.messages[loadingMsgIndex] = {sender: 'bot', text: 'Sorry, I encountered an error processing your audio. Please try again.'};
          this.isLoading = false;
        });
      this.audioUrl = null; // Reset the audio URL after sending
    }
  }


  toggleFeedback() {
    this.showFeedback = !this.showFeedback;
  }

  /**
   * Start a new conversation
   */
  startNewConversation() {
    // Generate a new conversation ID
    this.conversationId = crypto.randomUUID();

    // Clear the messages in the UI
    this.messages = [];

    // Add a welcome message
    this.messages.push({
      sender: 'bot',
      text: 'Hello! How can I help you today?'
    });

    // Store the welcome message in conversation context
    if (this.conversationId) {
      this.conversationService.addMessage(this.conversationId, this.chatbotId, {
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date()
      });
    }
  }

  submitFeedback() {
    if (this.feedbackText.trim()) {
      this.apiService.submitFeedback(this.chatbotId, this.feedbackText).subscribe(
        response => {
          console.log('Feedback submitted successfully:', response);
          this.feedbackText = '';
          this.showFeedback = false;
        },
        error => {
          console.error('Error submitting feedback:', error);
        }
      );
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && this.chatContainer) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

}

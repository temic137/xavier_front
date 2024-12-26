import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { ChatbotListComponent } from '../chatbot-list/chatbot-list.component';

@Component({
  selector: 'app-chatbot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-chat.component.html',
  styleUrl: './chatbot-chat.component.css',
})
export class ChatbotChatComponent implements OnInit {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  chatbotId: string = '';
  chatbotName: string = '';
  messages: any[] = [];
  currentMessage: string = '';
  isRecording: boolean = false;
  audioUrl: string | null = null;
  oncli: boolean =false;

  // New feedback-related properties
  showFeedback: boolean = false;
  feedbackText: string = '';


  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit() {
    this.chatbotId = this.route.snapshot.paramMap.get('id') || '';
    // Fetch chatbot name from API
    this.chatbotName = 'Chatbot';
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      this.messages.push({sender: 'user', text: this.currentMessage});
      this.apiService.askChatbot(this.chatbotId, this.currentMessage, 'text').subscribe(
        response => {
          this.messages.push({sender: 'bot', text: response.answer});
        },
        error => {
          console.error('Error asking chatbot:', error);
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
      fetch(this.audioUrl)
        .then(res => res.blob())
        .then(blob => {
          const audioFile = new File([blob], 'audio_message.wav', { type: 'audio/wav' });
          this.apiService.askChatbot(this.chatbotId, audioFile, 'audio').subscribe(
            response => {
              this.messages.push({sender: 'user', text: 'Audio message sent'});
              this.messages.push({sender: 'bot', text: response.answer});
            },
            error => {
              console.error('Error uploading audio:', error);
            }
          );
        });
      this.audioUrl = null; // Reset the audio URL after sending
    }
  }

  // New method to toggle feedback form visibility
  toggleFeedback() {
    this.showFeedback = !this.showFeedback;
  }

    // New method to submit feedback
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
  

}
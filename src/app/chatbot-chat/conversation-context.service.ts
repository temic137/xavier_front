import { Injectable } from '@angular/core';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  chatbotId: string;
  messages: Message[];
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationContextService {
  private readonly STORAGE_KEY = 'xavier_conversations';
  private readonly MAX_CONVERSATIONS = 10;
  private readonly MAX_MESSAGES_PER_CONVERSATION = 20;

  constructor() { }

  /**
   * Get a specific conversation by ID
   */
  getConversation(conversationId: string | undefined): Conversation | null {
    if (!conversationId) {
      return null;
    }

    const conversations = this.getAllConversations();
    return conversations.find(conv => conv.id === conversationId) || null;
  }

  /**
   * Get all conversations for a specific chatbot
   */
  getChatbotConversations(chatbotId: string): Conversation[] {
    const conversations = this.getAllConversations();
    return conversations.filter(conv => conv.chatbotId === chatbotId);
  }

  /**
   * Get all stored conversations
   */
  getAllConversations(): Conversation[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error retrieving conversations from storage:', error);
      return [];
    }
  }

  /**
   * Add a new message to a conversation
   * @returns The conversation object or null if conversationId is undefined
   */
  addMessage(conversationId: string | undefined, chatbotId: string, message: Message): Conversation | null {
    // If conversationId is undefined, we can't add the message
    if (!conversationId) {
      return null;
    }

    const conversations = this.getAllConversations();
    let conversation = conversations.find(conv => conv.id === conversationId);

    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = {
        id: conversationId,
        chatbotId,
        messages: [],
        lastUpdated: new Date()
      };
      conversations.push(conversation);
    }

    // Add the message
    conversation.messages.push(message);

    // Limit the number of messages per conversation
    if (conversation.messages.length > this.MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_PER_CONVERSATION);
    }

    conversation.lastUpdated = new Date();

    // Sort conversations by last updated (most recent first)
    conversations.sort((a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

    // Limit the total number of stored conversations
    const limitedConversations = conversations.slice(0, this.MAX_CONVERSATIONS);

    // Save to localStorage
    this.saveConversations(limitedConversations);

    return conversation;
  }

  /**
   * Get the most recent messages for a conversation (for context)
   */
  getRecentMessages(conversationId: string | undefined, limit: number = 5): Message[] {
    // If conversationId is undefined, we can't get messages
    if (!conversationId) {
      return [];
    }

    const conversation = this.getConversation(conversationId);
    if (!conversation) return [];

    return conversation.messages.slice(-limit);
  }

  /**
   * Clear a specific conversation
   */
  clearConversation(conversationId: string | undefined): void {
    if (!conversationId) {
      return;
    }

    const conversations = this.getAllConversations();
    const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
    this.saveConversations(filteredConversations);
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    this.saveConversations([]);
  }

  /**
   * Save conversations to localStorage
   */
  private saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to storage:', error);
    }
  }
}

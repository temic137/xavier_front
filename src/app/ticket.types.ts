// export interface Ticket {
//     id: number;
//     subject: string;
//     description?: string;
//     status: string;
//     priority: string;
//     account_details?: string;
//     created_at: string;
//   }
  

export interface Ticket {
    id: number;
    subject: string;
    description?: string;
    status: string;
    priority: string;
    account_details?: {
        [key: string]: any;  // Or define specific properties if known
    };
    created_at: string;
}

  export interface TicketResponse {
    id: number;
    message: string;
    user_id: number;
    created_at: string;
  }
  
  export interface TicketDetail {
    ticket: Ticket;
    responses: TicketResponse[];
  }
  
  export interface TicketsResponse {
    tickets: Ticket[];
  }
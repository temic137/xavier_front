// time-utils.ts

export class TimeUtils {
    static formatTimeSince(date: string | Date): string {
      const now = new Date();
      const then = new Date(date);
      const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
  
      if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
      } else if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      } else if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      } else if (days < 7) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
      } else if (weeks < 4) {
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
      } else if (months < 12) {
        return `${months} month${months === 1 ? '' : 's'} ago`;
      } else {
        return `${years} year${years === 1 ? '' : 's'} ago`;
      }
    }
  
    static getHoursSince(date: string | Date): number {
      const now = new Date();
      const then = new Date(date);
      return (now.getTime() - then.getTime()) / (1000 * 60 * 60);
    }
  
    static formatDateTime(date: string | Date): string {
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  
    static formatLastActivity(date: string | Date): string {
      const hours = this.getHoursSince(date);
      if (hours < 0.016) { // Less than 1 minute
        return 'Just now';
      } else if (hours < 1) {
        const minutes = Math.floor(hours * 60);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      } else if (hours < 24) {
        const h = Math.floor(hours);
        return `${h} hour${h === 1 ? '' : 's'} ago`;
      } else {
        return this.formatDateTime(date);
      }
    }
  }
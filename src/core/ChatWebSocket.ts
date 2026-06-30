import { WS_BASE } from '../api/constants';
import type { MessageResponse } from '../types/api';

type Handlers = {
  onOpen?: () => void;
  onMessage: (msg: MessageResponse) => void;
  onMessages: (msgs: MessageResponse[]) => void;
};

export class ChatWebSocket {
  private socket: WebSocket | null = null;

  private pingTimer: ReturnType<typeof setInterval> | null = null;

  private pendingGetOld: ((msgs: MessageResponse[]) => void) | null = null;

  connect(chatId: number, userId: number, token: string, handlers: Handlers) {
    this.close();
    this.socket = new WebSocket(`${WS_BASE}/chats/${userId}/${chatId}/${token}`);

    this.socket.addEventListener('open', () => {
      this.pingTimer = setInterval(() => {
        this.send({ type: 'ping' });
      }, 30000);
      handlers.onOpen?.();
    });

    this.socket.addEventListener('message', (e) => {
      try {
        const data: unknown = JSON.parse(e.data as string);

        if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
          const type = (data as { type?: string }).type;

          if (type === 'pong' || type === 'user connected') return;

          if (type === 'message' || type === 'file' || type === 'sticker') {
            handlers.onMessage(data as MessageResponse);
          }
          return;
        }

        if (Array.isArray(data)) {
          const messages = data as MessageResponse[];
          this.pendingGetOld?.(messages);
          this.pendingGetOld = null;
          handlers.onMessages(messages);
        }
      } catch {
        // ignore malformed payloads
      }
    });

    this.socket.addEventListener('error', () => {
      console.error('WebSocket: ошибка соединения');
    });

    this.socket.addEventListener('close', () => {
      console.warn('WebSocket: соединение закрыто');
    });
  }

  getOld(offset: string): Promise<MessageResponse[]> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pendingGetOld = null;
        resolve([]);
      }, 10000);

      this.pendingGetOld = (msgs) => {
        clearTimeout(timer);
        resolve(msgs);
      };

      this.send({ type: 'get old', content: offset });
    });
  }

  sendMessage(content: string) {
    this.send({ type: 'message', content });
  }

  private send(payload: object) {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(payload));
  }

  close() {
    clearInterval(this.pingTimer ?? undefined);
    this.pingTimer = null;
    this.pendingGetOld = null;
    this.socket?.close();
    this.socket = null;
  }
}

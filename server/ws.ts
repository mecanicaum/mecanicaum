import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db';

export interface WsEventMessage {
  type: string;
  payload: any;
  senderUserId?: string;
  timestamp: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  userName?: string;
  userRole?: string;
  connectedAt: string;
}

class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<ConnectedClient> = new Set();

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const client: ConnectedClient = {
        ws,
        connectedAt: new Date().toISOString(),
      };
      this.clients.add(client);

      // Send initial welcome & connection confirmation
      const welcomeMsg: WsEventMessage = {
        type: 'connection:established',
        payload: {
          message: 'Conexión WebSocket en tiempo real con servidor SIG-Currículo activa.',
          activeConnections: this.clients.size,
        },
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(welcomeMsg));

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString()) as WsEventMessage;
          if (msg.type === 'presence:identify') {
            const { userId } = msg.payload || {};
            if (userId) {
              const user = db.getUserById(userId);
              if (user) {
                client.userId = user.id;
                client.userName = user.name;
                client.userRole = user.role;
                this.broadcastPresence();
              }
            }
          }
        } catch (err) {
          console.error('[WS] Error processing incoming WS packet:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(client);
        this.broadcastPresence();
      });

      ws.on('error', (err) => {
        console.error('[WS] Client connection error:', err);
        this.clients.delete(client);
      });
    });

    console.log('[WS] WebSocket Server attached to HTTP server on path /ws');
  }

  public broadcast(type: string, payload: any, senderUserId?: string) {
    if (!this.wss) return;

    const message: WsEventMessage = {
      type,
      payload,
      senderUserId,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(payloadString);
        } catch (err) {
          console.error('[WS] Error sending message to client:', err);
        }
      }
    }
  }

  public broadcastPresence() {
    const activeUsers = Array.from(this.clients)
      .filter((c) => !!c.userId)
      .map((c) => ({
        userId: c.userId,
        userName: c.userName,
        userRole: c.userRole,
      }));

    this.broadcast('presence:active_users', { activeUsers, totalCount: activeUsers.length });
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const wsHub = new WebSocketHub();

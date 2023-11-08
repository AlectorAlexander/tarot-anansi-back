import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// notifications.gateway.ts
import { Server } from 'socket.io';

const { FRONT_URL } = process.env;

@WebSocketGateway({
  cors: {
    origin: FRONT_URL, // Defina como necessário para o seu ambiente de produção
  },
})
export class NotificationsGateway {
  @WebSocketServer()
    server: Server;

  sendNotification(notification: any) {
    this.server.emit('notification', notification); // Envia a notificação para todos os clientes conectados
  }

  // Aqui você pode adicionar métodos para lidar com conexão/desconexão de usuários, se necessário
}

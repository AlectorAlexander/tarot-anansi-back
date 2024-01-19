// websocket.gateway.ts
import * as websocket from 'websocket'; // Importa tudo do módulo 'websocket' como o objeto 'websocket'
import * as http from 'http'; // Importa o módulo 'http' para criar um servidor HTTP
import { Injectable, OnModuleInit } from '@nestjs/common'; // Importa decorators do NestJS
import UsersService from 'src/modules/users/service/users.service';
import { INotifications } from '../dtos/notifications.dtos';

@Injectable()
export class WebSocketGateway implements OnModuleInit {
  private wsServer;
  private clientMap = new Map<string, websocket.connection>();
  private clients = []; // Armazena uma lista dos clientes conectados
  userService: UsersService;

  constructor() {
    this.userService = new UsersService();
  }

  onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const server = http.createServer((request, response) => {});
    server.listen(8080, () => {
      console.log(new Date() + ' Server is listening on port 8080');
    });

    this.wsServer = new websocket.server({
      httpServer: server,
    });

    this.wsServer.on('request', (request) => {
      // Evento para lidar com uma nova requisição de conexão WebSocket
      const connection = request.accept(null, request.origin);
      console.log(new Date() + ' Connection accepted from: ' + request.origin);
      this.clients.push(connection);
      console.log('Cliente adicionado: ', this.clients.length);

      connection.on('message', async (message) => {
        // Evento para lidar com mensagens recebidas dos clientes
        if (message.type === 'utf8') {
          const token = JSON.parse(message.utf8Data);

          try {
            const { isValid, user } = await this.userService.validate(token);
            if (isValid) {
              const userId = user.id.toString(); // Converte ObjectId para string, se necessário
              this.clientMap.set(userId, connection);
            } else {
              connection.close();
            }
          } catch (error) {
            console.log(error);
            throw error; // Lança uma exceção caso ocorra algum erro durante a execução do código.
          }
        }
      });

      connection.on('close', (reasonCode, description) => {
        this.clients = this.clients.filter((client) => client !== connection);
        console.log(
          new Date() + ' Conexão fechada por: ' + connection.remoteAddress,
        );
      });
    });
  }

  sendNotificationToUser(data: INotifications) {
    const connection = this.clientMap.get(data.user_id);
    if (connection) {
      if (connection.readyState === connection.OPEN) {
        connection.sendUTF(JSON.stringify(data));
        console.log('Notificação enviada para o usuário:', data.user_id);
      } else {
        console.log('Conexão não está aberta para o usuário:', data.user_id);
      }
    } else {
      console.log('Nenhuma conexão encontrada para o usuário:', data.user_id);
    }
  }
}

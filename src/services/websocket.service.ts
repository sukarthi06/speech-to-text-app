// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class WebsocketService {
//   private socket!: WebSocket;

//   connect() {

//     console.log(`Connecting to WebSocket at ${environment.websocketUrl} in ${environment.environmentName} environment...`);
//     this.socket = new WebSocket(environment.websocketUrl);

//     this.socket.onopen = () => {
//       console.log('Connected to server');

//       // Send first message
//       //this.send('Hello from Angular');
//     };

//     this.socket.onmessage = (event) => {
//       console.log('Server says:', event.data);
//     };

//     this.socket.onclose = () => {
//       console.log('Connection closed');
//     };

//     this.socket.onerror = (error) => {
//       console.error('WebSocket error', error);
//     };
//   }

//   send(audioChunk: Float32Array) {
//     if (this.socket.readyState === WebSocket.OPEN) {
//       this.socket.send(JSON.stringify({ type: 'audio-chunk', data: audioChunk }));
//     }
//   }

//   close() {
//     this.socket.close();
//   }
// }

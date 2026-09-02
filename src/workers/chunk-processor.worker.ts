/// <reference lib="webworker" />
import { SocketClient } from '../types/SocketClient';

let socketClient: SocketClient | null = null;
let websocketUrl = '';

addEventListener('message', ({ data }) => {

  if (!socketClient) {
    socketClient = new SocketClient();
  }
  switch (data.type) {

    case 'init':
      websocketUrl = data.websocketUrl;
      socketClient ??= new SocketClient();
      socketClient.connect(websocketUrl);

      break;
    case 'metaData':
      socketClient.sendMetaData(data.RecordingMetadata);
      break;
    case 'send':
      socketClient.send(data.chunk);
      break;
    case 'ping':
      socketClient.ping();
      break;
    case 'start':
      socketClient.start();
      break;
    case 'stop':
      socketClient.stop();
      break;      
    case 'close':
      //socketClient?.close();
      //socketClient = null;
      break;
  }

});

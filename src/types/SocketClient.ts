import { RecordingMetadata } from "./audio-type";

export class SocketClient {

    private socket!: WebSocket;

    connect(url: string) {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('Connected to server');
        };

        this.socket.onmessage = (event) => {
            //console.log('Server says:', event.data);            
            postMessage(event.data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from server');
        };
    }

    send(data: Float32Array) {
        const buffer = data.buffer as ArrayBuffer;
        this.socket.send(buffer);
    }

    sendMetaData(metaData: RecordingMetadata){
        console.log(JSON.stringify(metaData));
        this.socket.send(JSON.stringify(metaData));
    }

    ping() {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
        }
    }

    stop() {
        this.socket.send(JSON.stringify({ type: 'stop' }));
    }

    start(){
        this.socket.send(JSON.stringify({ type: 'start' }));
    }

    close() {
        this.socket.close();
    }    
}
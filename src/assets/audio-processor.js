class AudioProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this.buffer = [];
        this.counter = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        //console.log('Processing audio chunk...');

        if (!input || !input.length || !output || !output.length) return true;

        for (let channel = 0; channel < input.length; channel++) {
            output[channel].set(input[channel]);
        }

        const audioChunk = input.map(channelData => new Float32Array(channelData));

        // Convert to mono by averaging channels
        const mono = new Float32Array(audioChunk[0].length);
        for (let i = 0; i < audioChunk[0].length; i++) {
            let sum = 0;
            for (let ch = 0; ch < audioChunk.length; ch++) {
                sum += audioChunk[ch][i];
            }
            mono[i] = sum / audioChunk.length;
        }

        // Accumulate samples in buffer
        this.buffer.push(...mono);
        this.counter++;

        if (this.counter === 16) { // Send every 16 chunks
            //console.log('Sending 2048-sample chunk to main thread');
            this.port.postMessage({
                data: new Float32Array(this.buffer) // Send as Float32Array
            });
            this.buffer = []; // Clear buffer
            this.counter = 0; // Reset counter
        }

        return true; // keep alive
    }
}

registerProcessor('audio-processor', AudioProcessor);
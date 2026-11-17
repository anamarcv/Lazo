/**
 * Servicio de Audio Bidireccional en Tiempo Real para Lazo y Gemini Multimodal Live API.
 * Gestiona captura de micrófono (PCM 16kHz) y reproducción sin latencia (PCM 24kHz).
 */

export class LiveAudioStreamer {
  constructor({ onStatusChange, onTranscript, onError, onVolume, onConsentChange, onCallSaved, onWarning }) {
    this.onStatusChange = onStatusChange || (() => {});
    this.onTranscript = onTranscript || (() => {});
    this.onError = onError || (() => {});
    this.onVolume = onVolume || (() => {});
    this.onConsentChange = onConsentChange || (() => {});
    this.onCallSaved = onCallSaved || (() => {});
    this.onWarning = onWarning || (() => {});

    this.callId = null;
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.scriptProcessor = null;
    this.sourceNode = null;
    this.analyser = null;

    // Control de cola de reproducción sin silencios
    this.nextPlayTime = 0;
    this.activeAudioSources = [];
    this.isConnected = false;
  }

  /**
   * Inicia la sesión de llamada en vivo conectando el micrófono y el WebSocket
   */
  /**
   * Inicia la sesión de llamada en vivo conectando el micrófono y el WebSocket en paralelo
   */
  async start({ patientId = 'LZ-0482' } = {}) {
    try {
      this.onStatusChange('requesting_mic');
      this._resamplePhase = 0;
      this.isWsOpen = false;
      this.isMicReady = false;

      // 1. Iniciar conexión WebSocket al Gateway en paralelo con la solicitud de micrófono
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live-call?patientId=${patientId}`;
      
      console.log(`[AudioStreamer] 🔌 Conectando WebSocket a ${wsUrl} en paralelo con micrófono...`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[AudioStreamer] ✅ Conectado al Gateway de Lazo.');
        this.isConnected = true;
        this.isWsOpen = true;
        if (this.isMicReady) {
          this.onStatusChange('connected');
          this.setupMicrophoneRecording();
        }
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('[AudioStreamer] ❌ Error en WebSocket:', error);
        this.onError('Error de conexión con el servidor de Lazo');
        this.stop();
      };

      this.ws.onclose = (event) => {
        console.log('[AudioStreamer] 🔌 WebSocket cerrado (código:', event.code, 'razón:', event.reason || 'N/A', ')');
        this.stop();
        this.onStatusChange('disconnected');
      };

      // 2. Solicitar acceso al micrófono (noiseSuppression: false evita recortar monosílabos breves)
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true
        }
      });

      // 3. Inicializar AudioContext unificado en el gesto de usuario (intentar 16kHz nativo si disponible)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      try {
        this.audioContext = new AudioCtx({ sampleRate: 16000 });
      } catch (e) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      console.log(`[AudioStreamer] 🎙️ AudioContext inicializado (estado: ${this.audioContext.state}, frecuencia nativa: ${this.audioContext.sampleRate} Hz)`);

      this.isMicReady = true;
      if (this.isWsOpen) {
        this.onStatusChange('connected');
        this.setupMicrophoneRecording();
      } else {
        this.onStatusChange('connecting');
      }

    } catch (err) {
      console.error('[AudioStreamer] ❌ Error al iniciar llamada:', err);
      if (err.name === 'NotAllowedError') {
        this.onError('Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador.');
      } else {
        this.onError('No fue posible iniciar la llamada: ' + err.message);
      }
      this.stop();
    }
  }

  /**
   * Captura y codifica PCM 16kHz desde el micrófono hacia el servidor usando el AudioContext activo
   */
  async setupMicrophoneRecording() {
    if (!this.audioContext || !this.mediaStream) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    // Analizador para medir volumen del usuario (visualizador de ondas)
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.sourceNode.connect(this.analyser);
    this.startVolumeMeter();

    // ScriptProcessor para obtener muestras crudas Float32 y convertir a PCM 16-bit
    // Buffer size 2048 (aprox 42ms a 48kHz o 46ms a 44.1kHz)
    const bufferSize = 2048;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    this.sentPackets = 0;

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      // Silenciar salida para impedir que el micrófono suene en los altavoces (elimina acople acústico)
      const outputData = e.outputBuffer.getChannelData(0);
      outputData.fill(0);

      const inputData = e.inputBuffer.getChannelData(0);
      const inputSampleRate = this.audioContext.sampleRate;
      
      // Resamplear a 16000 Hz con interpolación lineal
      const pcm16Data = this.resampleAndConvertTo16BitPCM(inputData, inputSampleRate, 16000);
      
      // Convertir a base64
      const base64Audio = this.arrayBufferToBase64(pcm16Data.buffer);

      this.sentPackets++;
      this.lastMicSendTime = Date.now();
      if (this.sentPackets === 1 || this.sentPackets % 50 === 0) {
        console.log(`[AudioStreamer] 📤 Transmitiendo bloques de voz al servidor (#${this.sentPackets}, PCM 16kHz)...`);
      }

      this.ws.send(JSON.stringify({
        type: 'audio',
        data: base64Audio
      }));
    };

    this.sourceNode.connect(this.scriptProcessor);
    // Enrutar mediante nodo mudo para que el procesamiento ocurra sin realimentación a altavoces
    const muteGain = this.audioContext.createGain();
    muteGain.gain.value = 0;
    this.scriptProcessor.connect(muteGain);
    muteGain.connect(this.audioContext.destination);
    console.log('[AudioStreamer] 🎙️ Micrófono enlazado y transmitiendo sin acople acústico.');
  }

  /**
   * Resamplea y convierte audio Float32 [-1.0, 1.0] a Int16 Little-Endian con acumulador
   * de fase continuo entre bloques, eliminando micro-desfases periódicos de borde.
   */
  resampleAndConvertTo16BitPCM(inputData, fromRate, toRate) {
    if (fromRate === toRate) {
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return pcm16;
    }

    const ratio = fromRate / toRate;
    if (this._resamplePhase === undefined || isNaN(this._resamplePhase)) {
      this._resamplePhase = 0;
    }

    const outputSamples = [];
    let pos = this._resamplePhase;
    const len = inputData.length;

    while (pos < len) {
      const index = Math.floor(pos);
      const frac = pos - index;
      const nextIndex = Math.min(index + 1, len - 1);
      const sample = inputData[index] * (1 - frac) + inputData[nextIndex] * frac;
      const s = Math.max(-1, Math.min(1, sample));
      outputSamples.push(s < 0 ? s * 0x8000 : s * 0x7FFF);
      pos += ratio;
    }

    // Preservar residuo fraccionario para el siguiente bloque de audio
    this._resamplePhase = pos - len;
    return new Int16Array(outputSamples);
  }

  /**
   * Procesa mensajes entrantes del Gateway de Lazo
   */
  handleServerMessage(data) {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'ready':
          console.log('[AudioStreamer] Gemini Live listo. Puedes comenzar a hablar.', msg.callId || '');
          this.callId = msg.callId || null;
          this.onStatusChange('active');
          break;

        case 'audio':
          // Audio recibido de Gemini (PCM 24kHz base64)
          if (!this.firstChunkInTurn) {
            this.firstChunkInTurn = true;
            if (this.lastMicSendTime) {
              const latencyMs = Date.now() - this.lastMicSendTime;
              console.log(`[AudioStreamer] ⏱️ Latencia percibida de voz Lazo: ${latencyMs} ms`);
            }
          }
          this.queueAudioChunk(msg.data);
          break;

        case 'turn_complete':
          this.firstChunkInTurn = false;
          break;

        case 'interrupted':
          // El usuario interrumpió al modelo: cortar reproducción en curso
          console.log('[AudioStreamer] Interrupción: cancelando audio en cola.');
          this.clearAudioQueue();
          this.firstChunkInTurn = false;
          this.onStatusChange('interrupted');
          setTimeout(() => {
            if (this.isConnected) this.onStatusChange('active');
          }, 300);
          break;

        case 'transcript':
        case 'transcript_update':
        case 'transcript_final':
          if (msg.text) {
            this.onTranscript(msg);
          }
          break;

        case 'consent_status':
          console.log('[AudioStreamer] Estado de consentimiento:', msg.consent);
          this.onConsentChange(msg);
          break;

        case 'call_saved':
          console.log('[AudioStreamer] 💾 Llamada guardada en backend:', msg.call?.id);
          this.onCallSaved(msg.call);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lazo_call_saved', { detail: msg.call }));
          }
          break;

        case 'call_warning':
          console.log('[AudioStreamer] ⏱️ Advertencia de tiempo recibida del servidor:', msg.message);
          this.onWarning(msg);
          break;

        case 'error':
          console.error('[AudioStreamer] Error reportado por servidor:', msg.message);
          this.onError(msg.message);
          if (msg.code === 'MISSING_API_KEY') {
            this.onStatusChange('missing_key');
          }
          break;

        case 'session_closed':
          console.log('[AudioStreamer] 🏁 Llamada cerrada limpiamente por el servidor:', msg.callId);
          this.onStatusChange('ended');
          if (msg.call) {
            this.onCallSaved(msg.call);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('lazo_call_saved', { detail: msg.call }));
            }
          }
          this.stop();
          break;

        default:
          break;
      }
    } catch (e) {
      console.error('[AudioStreamer] Error al parsear mensaje de servidor:', e);
    }
  }

  /**
   * Programa la reproducción continua de chunks de audio PCM 24kHz
   */
  queueAudioChunk(base64Pcm24k) {
    if (!this.audioContext || this.audioContext.state === 'closed') return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    try {
      const binaryString = atob(base64Pcm24k);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convertir bytes Int16 little-endian a Float32 con protección de alineación de longitud par
      const sampleCount = Math.floor(bytes.byteLength / 2);
      if (sampleCount === 0) return;

      const int16Array = new Int16Array(bytes.buffer, 0, sampleCount);
      const float32Array = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Crear buffer de audio a 24000 Hz (Web Audio lo remuestrea automáticamente a la salida nativa del hardware)
      const audioBuffer = this.audioContext.createBuffer(1, sampleCount, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      // Calcular tiempo de inicio secuencial sin gaps para flujo de voz continuo
      const now = this.audioContext.currentTime;
      const startTime = Math.max(now, this.nextPlayTime);
      source.start(startTime);

      this.nextPlayTime = startTime + audioBuffer.duration;
      this.activeAudioSources.push(source);

      this.receivedAudioChunks = (this.receivedAudioChunks || 0) + 1;
      if (this.receivedAudioChunks === 1 || this.receivedAudioChunks % 30 === 0) {
        console.log(`[AudioStreamer] 🔊 Reproduciendo respuesta de voz de Gemini en altavoces (bloque #${this.receivedAudioChunks}, ${sampleCount} muestras 24kHz)...`);
      }

      source.onended = () => {
        const idx = this.activeAudioSources.indexOf(source);
        if (idx > -1) this.activeAudioSources.splice(idx, 1);
      };

    } catch (err) {
      console.error('[AudioStreamer] ❌ Error en decodificación/reproducción de audio:', err);
    }
  }

  /**
   * Cancela de inmediato los audios pendientes de reproducir cuando el usuario interrumpe
   */
  clearAudioQueue() {
    for (const src of this.activeAudioSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    }
    this.activeAudioSources = [];
    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
  }

  startVolumeMeter() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateVolume = () => {
      if (!this.isConnected) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      this.onVolume(Math.min(100, Math.round((avg / 128) * 100)));
      requestAnimationFrame(updateVolume);
    };
    updateVolume();
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Finaliza la llamada y libera recursos de hardware
   */
  stop() {
    this.isConnected = false;
    this.sentPackets = 0;
    this.receivedAudioChunks = 0;
    this.clearAudioQueue();

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {}
      this.sourceNode = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      try {
        this.ws.send(JSON.stringify({ type: 'end_call' }));
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.onStatusChange('idle');
  }
}

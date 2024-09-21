'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoConsultationProps {
  appointmentId: string;
  patientName: string;
}

export default function VideoConsultation({ appointmentId, patientName }: VideoConsultationProps) {
  // ... (previous code remains the same)

  useEffect(() => {
    const init = async () => {
      try {
        // ... (previous code remains the same)

        // Try to connect to the signaling server on different ports
        let ws: WebSocket | null = null;
        for (let port = 3001; port <= 3010; port++) {
          try {
            ws = new WebSocket(`ws://localhost:${port}?room=${appointmentId}`);
            await new Promise((resolve, reject) => {
              ws!.onopen = resolve;
              ws!.onerror = reject;
            });
            console.log(`Connected to signaling server on port ${port}`);
            break;
          } catch (err) {
            console.log(`Failed to connect on port ${port}, trying next...`);
          }
        }

        if (!ws) {
          throw new Error('Failed to connect to signaling server');
        }

        ws.onmessage = async (event) => {
          // ... (rest of the WebSocket message handling code)
        };

        const sendSignalingMessage = (message: any) => {
          ws!.send(JSON.stringify(message));
        };

        // ... (rest of the code remains the same)
      } catch (err) {
        console.error('Error setting up WebRTC:', err);
        setError('Failed to set up video call. Please check your camera and microphone permissions.');
      }
    };

    init();

    // ... (cleanup code remains the same)
  }, [appointmentId]);

  // ... (rest of the component remains the same)
}

function setError(arg0: string) {
  throw new Error('Function not implemented.');
}

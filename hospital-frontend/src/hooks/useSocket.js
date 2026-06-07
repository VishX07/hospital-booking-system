import { useEffect } from 'react';
import { socket } from '../socket.js';

export const useSocket = ({
  onAppointmentNew,
  onAppointmentUpdated,
  onNotification,
} = {}) => {
  useEffect(() => {
    console.log('🎧 useSocket mounted, socket connected:', socket.connected);

    socket.onAny((event, ...args) => {
      console.log('📨 Socket event received:', event, args);
    });

    if (onAppointmentNew) socket.on('appointment:new', onAppointmentNew);
    if (onAppointmentUpdated)
      socket.on('appointment:updated', onAppointmentUpdated);
    if (onNotification) socket.on('notification:new', onNotification);

    return () => {
      socket.offAny();
      socket.off('appointment:new', onAppointmentNew);
      socket.off('appointment:updated', onAppointmentUpdated);
      socket.off('notification:new', onNotification);
    };
  }, []);
};

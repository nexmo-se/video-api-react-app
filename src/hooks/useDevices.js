import { useState, useEffect, useCallback } from 'react';
import OT from '@opentok/client';

export default function useDevices() {
  const [deviceInfo, setDeviceInfo] = useState({
    audioInputDevices: [],
    videoInputDevices: [],
    audioOutputDevices: []
  });

  const getDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn('enumerateDevices() not supported.');
      return;
    }
    return new Promise((resolve, reject) => {
      OT.getDevices(async (err, devices) => {
        if (err) {
          reject(err);
        }
        let audioOutputDevices = await OT.getAudioOutputDevices();
        audioOutputDevices = audioOutputDevices.map((audiooutput) =>
          audiooutput.deviceId === 'default'
            ? { ...audiooutput, label: 'System Default' }
            : audiooutput
        );
        const audioInputDevices = devices.filter(
          (d) => d.kind.toLowerCase() === 'audioinput'
        );
        const videoInputDevices = devices.filter(
          (d) => d.kind.toLowerCase() === 'videoinput'
        );
        setDeviceInfo({
          audioInputDevices,
          videoInputDevices,
          audioOutputDevices
        });
      });
    });
  }, []);

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    getDevices();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [getDevices]);

  return { deviceInfo, getDevices };
}

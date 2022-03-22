import React, { useState } from 'react';
import OT, { getDevices } from '@opentok/client';
import useStyles from './styles';
import useDevices from '../../hooks/useDevices';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  InputLabel
} from '@material-ui/core';

import { getAudioSourceDeviceId } from '../../utils';

export function SettingsModal({ open, onCloseClick, currentPublisher }) {
  let [audioDevice, setAudioDevice] = useState('');
  let [videoDevice, setVideoDevice] = useState('');
  let [audioOutputDevice, setAudioOutputDevice] = useState('');
  const [localVideoSource, setLocalVideoSource] = useState(undefined);
  const [localAudioSource, setLocalAudioSource] = useState(undefined);
  const [localAudioOutput, setLocalAudioOutput] = useState(undefined);
  const { deviceInfo } = useDevices();

  const classes = useStyles();

  /* async function handleAudioInputChange(e) {
    const audioInputs = await fetchAudioInput();
    const [selectedAudioInput] = audioInputs.filter(
      (audioInput) => audioInput.label === e.target.value
    );

    if (selectedAudioInput && currentPublisher) {
      currentPublisher.setAudioSource(selectedAudioInput.deviceId);
      setSelectedAudioInput(selectedAudioInput);
    }
  } */

  const handleVideoSource = React.useCallback(
    (e) => {
      const videoDeviceId = e.target.value;
      setVideoDevice(e.target.value);
      currentPublisher.setVideoSource(videoDeviceId);
      setLocalVideoSource(videoDeviceId);
    },
    [currentPublisher, setVideoDevice, setLocalVideoSource]
  );

  const handleAudioSource = React.useCallback(
    (e) => {
      const audioDeviceId = e.target.value;
      setAudioDevice(audioDeviceId);
      currentPublisher.setAudioSource(audioDeviceId);
      setLocalAudioSource(audioDeviceId);
    },
    [currentPublisher, setAudioDevice, setLocalAudioSource]
  );

  const handleAudioOutput = React.useCallback(
    (e) => {
      const audioOutputId = e.target.value;
      setAudioOutputDevice(audioOutputId);
      OT.setAudioOutputDevice(audioOutputId);
      setLocalAudioOutput(audioOutputId);
    },
    [setLocalAudioOutput, setAudioOutputDevice]
  );

  React.useEffect(() => {
    if (currentPublisher && deviceInfo) {
      const currentAudioDevice = currentPublisher.getAudioSource();
      setAudioDevice(
        getAudioSourceDeviceId(deviceInfo.audioInputDevices, currentAudioDevice)
      );
      const currentVideoDevice = currentPublisher.getVideoSource();
      setVideoDevice(currentVideoDevice.deviceId);

      OT.getActiveAudioOutputDevice().then((currentAudioOutputDevice) => {
        setAudioOutputDevice(currentAudioOutputDevice.deviceId);
      });
    }
  }, [
    deviceInfo,
    currentPublisher,
    setAudioDevice,
    setVideoDevice,
    setAudioOutputDevice
  ]);

  React.useEffect(() => {
    getDevices();
  }, []);

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent className={classes.flex}>
        <DialogContentText>
          You can change your microphone and camera input here.
        </DialogContentText>
        <Typography color="primary">Microphone</Typography>
        <FormControl>
          <InputLabel id="demo-simple-select-label">
            Select Audio Source
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={audioDevice}
            onChange={handleAudioSource}
            className={classes.selectWidth}
          >
            {deviceInfo.audioInputDevices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="video">Select Audio Output</InputLabel>
          {deviceInfo.audioOutputDevices && (
            <Select
              labelId="video"
              id="demo-simple-select"
              value={audioOutputDevice}
              onChange={handleAudioOutput}
              autoWidth={true}
            >
              {deviceInfo.audioOutputDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
        <FormControl>
          <InputLabel id="video">Select Video Source</InputLabel>
          {deviceInfo.videoInputDevices && (
            <Select
              labelId="video"
              id="demo-simple-select"
              value={videoDevice}
              onChange={handleVideoSource}
            >
              {deviceInfo.videoInputDevices.map((device) => (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCloseClick}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

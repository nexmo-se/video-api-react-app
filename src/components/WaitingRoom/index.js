import React, { useContext, useEffect, useRef, useState } from 'react';
import OT from '@opentok/client';
import { useHistory } from 'react-router-dom';
import { useQuery } from './../../hooks/useQuery';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckBox from '@material-ui/icons/CheckBox';
import Error from '@material-ui/icons/Error';
import QualityTestDialog from '../QualityTestDialog';
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core';
import { usePublisher } from '../../hooks/usePublisher';
import { AudioSettings } from '../AudioSetting';
import { VideoSettings } from '../VideoSetting';
import { useNetworkTest } from '../../hooks/useNetworkTest';
import { UserContext } from '../../context/UserContext';
import useStyles from './styles';
import { getAudioSourceDeviceId } from '../../utils';

export function WaitingRoom() {
  let query = useQuery();
  const classes = useStyles();
  const { user, setUser } = useContext(UserContext);
  const { push } = useHistory();
  const defaultLocalAudio = true;
  const defaultLocalVideo = true;
  const userName = query.get('user-name')
    ? query.get('user-name')
    : user.userName;
  const [localAudio, setLocalAudio] = useState(defaultLocalAudio);
  const [localVideo, setLocalVideo] = useState(defaultLocalVideo);
  const [localVideoSource, setLocalVideoSource] = useState(undefined);
  const [localAudioSource, setLocalAudioSource] = useState(undefined);
  const [localAudioOutput, setLocalAudioOutput] = useState(undefined);
  let [audioDevice, setAudioDevice] = useState('');
  let [videoDevice, setVideoDevice] = useState('');
  let [audioOutputDevice, setAudioOutputDevice] = useState('');
  const [networkTest, setNetworkTest] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const waitingRoomVideoContainer = useRef();

  const {
    publisher,
    initPublisher,
    destroyPublisher,
    deviceInfo,
    pubInitialised
  } = usePublisher();

  const { connectivityTest, qualityTest, runNetworkTest, stopNetworkTest } =
    useNetworkTest({
      apikey: process.env.REACT_APP_VIDEO_NETWORKTEST_API_KEY,
      sessionId: process.env.REACT_APP_VIDEO_NETWORKTEST_SESSION,
      token: process.env.REACT_APP_VIDEO_NETWORKTEST_TOKEN
    });

  const handleAudioChange = React.useCallback((e) => {
    setLocalAudio(e.target.checked);
  }, []);

  const handleVideoChange = React.useCallback((e) => {
    setLocalVideo(e.target.checked);
  }, []);

  const handleVideoSource = React.useCallback(
    (e) => {
      const videoDeviceId = e.target.value;
      setVideoDevice(e.target.value);
      publisher.setVideoSource(videoDeviceId);
      setLocalVideoSource(videoDeviceId);
    },
    [publisher, setVideoDevice, setLocalVideoSource]
  );

  const handleAudioSource = React.useCallback(
    (e) => {
      const audioDeviceId = e.target.value;
      setAudioDevice(audioDeviceId);
      publisher.setAudioSource(audioDeviceId);
      setLocalAudioSource(audioDeviceId);
    },
    [publisher, setAudioDevice, setLocalAudioSource]
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

  const handleQualityTestDialogClose = () => {
    console.log('handleQualityTestDialogClose', networkTest);
    setShowQualityDialog(false);
    setNetworkTest(false);
  };

  const handleJoinClick = () => {
    stopNetworkTest(); // Stop network test
    push('/video-room');
  };

  const toggleNetworkTest = () => {
    if (networkTest) {
      stopNetworkTest();
      setNetworkTest(false);
    } else {
      runNetworkTest();
      setNetworkTest(true);
    }
  };

  useEffect(() => {
    const publisherOptions = {
      publishAudio: defaultLocalAudio,
      publishVideo: defaultLocalVideo
    };
    if (waitingRoomVideoContainer.current) {
      initPublisher(waitingRoomVideoContainer.current.id, publisherOptions);
    }
  }, [initPublisher, defaultLocalAudio, defaultLocalVideo]);

  useEffect(() => {
    if (publisher) {
      publisher.publishAudio(localAudio);
    }
  }, [localAudio, publisher]);

  useEffect(() => {
    if (publisher) {
      publisher.publishVideo(localVideo);
    }
  }, [localVideo, publisher]);

  useEffect(() => {
    if (!qualityTest.loading) {
      setShowQualityDialog(true);
    }
  }, [qualityTest]);

  useEffect(() => {
    if (publisher && pubInitialised && deviceInfo) {
      const currentAudioDevice = publisher.getAudioSource();
      setAudioDevice(
        getAudioSourceDeviceId(deviceInfo.audioInputDevices, currentAudioDevice)
      );
      const currentVideoDevice = publisher.getVideoSource();
      setVideoDevice(currentVideoDevice.deviceId);

      OT.getActiveAudioOutputDevice().then((currentAudioOutputDevice) => {
        setAudioOutputDevice(currentAudioOutputDevice.deviceId);
      });
    }
  }, [
    deviceInfo,
    publisher,
    setAudioDevice,
    setVideoDevice,
    setAudioOutputDevice,
    pubInitialised
  ]);

  useEffect(() => {
    return () => {
      destroyPublisher();
    };
  }, [destroyPublisher]);

  useEffect(() => {
    setUser({
      defaultSettings: {
        publishAudio: localAudio,
        publishVideo: localVideo,
        audioSource: localAudioSource,
        videoSource: localVideoSource,
        audioOutput: localAudioOutput
      },
      userName
    });
  }, [
    localAudio,
    localVideo,
    userName,
    setUser,
    localAudioSource,
    localVideoSource,
    localAudioOutput
  ]);

  return (
    <div className={classes.waitingRoomContainer}>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h4" component="h2">
          {userName}
        </Typography>
        <div
          id="waiting-room-video-container"
          className={classes.waitingRoomVideoPreview}
          ref={waitingRoomVideoContainer}
        ></div>
        <div className={classes.deviceContainer}>
          <>
            <FormControl>
              <InputLabel id="demo-simple-select-label">
                Select Audio Source
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={audioDevice}
                onChange={handleAudioSource}
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
          </>
        </div>
        <div className={classes.deviceContainer}>
          <AudioSettings
            className={classes.deviceSettings}
            hasAudio={localAudio}
            onAudioChange={handleAudioChange}
          />
          <VideoSettings
            className={classes.deviceSettings}
            hasVideo={localVideo}
            onVideoChange={handleVideoChange}
          />
        </div>
      </Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <div className={classes.flex} style={{ margin: 5 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={toggleNetworkTest}
          >
            {networkTest ? 'Stop Network Test' : 'Start Network Test'}
          </Button>
        </div>
        {networkTest && (
          <div className={classes.networkTestContainer}>
            <div className={classes.flex}>
              <div>Connectivity Test:</div>
              <div>
                {connectivityTest.loading ? (
                  <CircularProgress size={20} />
                ) : connectivityTest.data && connectivityTest.data.success ? (
                  <CheckBox className={classes.green}></CheckBox>
                ) : (
                  <Error className={classes.red} />
                )}
              </div>
            </div>
            <div className={classes.flex}>
              <div>Quality Test:</div>
              <div>
                {qualityTest.loading ? (
                  <CircularProgress size={20} />
                ) : qualityTest.data ? (
                  <CheckBox className={classes.green}></CheckBox>
                ) : (
                  <Error className={classes.red} />
                )}
              </div>
            </div>
            <QualityTestDialog
              selectedValue={qualityTest}
              open={showQualityDialog}
              onClose={handleQualityTestDialogClose}
            ></QualityTestDialog>
          </div>
        )}
      </Grid>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Button variant="contained" color="secondary" onClick={handleJoinClick}>
          Join Call
        </Button>
      </Grid>
    </div>
  );
}

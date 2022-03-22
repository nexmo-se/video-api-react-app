const getAudioSourceDeviceId = (audioInputDevices, currentAudioSource) => {
  let toReturn = '';
  console.log('getAudioSourceDeviceId', audioInputDevices, currentAudioSource);
  if (!audioInputDevices || !currentAudioSource) {
    return toReturn;
  }
  for (let i = 0; i < audioInputDevices.length; i += 1) {
    if (audioInputDevices[i].label === currentAudioSource.label) {
      toReturn = audioInputDevices[i].deviceId;
      break;
    }
  }
  return toReturn;
};

export { getAudioSourceDeviceId };

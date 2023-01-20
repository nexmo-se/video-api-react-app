import OT from '@opentok/client'
import _ from 'lodash'
import { useCallback, useRef, useState, useContext } from 'react'

import { OtSpeechContext } from '../context/OtSpeechContext'

const speakingThreshold = 1000
const notSpeakingThreshold = 2000
const initialNumberOfActiveSpeakers = 2
const audioStream = {
  isTalking: false,
  timestamp: 0,
}

const initLayoutContainer = require('opentok-layout-js');

export function useSession({ container }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [streams, setStreams] = useState([])
  const sessionRef = useRef(null)
  const { otSpeech } = useContext(OtSpeechContext)

  let otLayout = null
  
  const addStream = ({ stream }) => {
    setStreams((prev) => [...prev, stream])
  }

  const removeStream = ({ stream }) => {
    setStreams((prev) =>
      prev.filter((prevStream) => prevStream.id !== stream.id)
    )
  }

  const updateActiveSpeakerEl = (id, action) => {
    const el = id ? document.getElementById(id) : null
    if (el) {
      if (action === "add") {
        el.classList.add("active-speaker-border")
      } else {
        el.classList.remove("active-speaker-border")
      }
    }
  }

  const onAudioLevel = useCallback((event, elementId) => {
    const now = new Date().getTime()
    if (event && event.audioLevel > 0.2) {
      // it could be speaking
      if (!audioStream.isTalking) {
        audioStream.isTalking = true
        audioStream.timestamp = new Date().getTime()
      } else if (
        audioStream.isTalking &&
        now - audioStream.timestamp > speakingThreshold
      ) {
        audioStream.isTalking = true
        audioStream.timestamp = new Date().getTime()
        // this means that it's speaking for more than X seconds
        updateActiveSpeakerEl(elementId, "add")
      }
    } else if (
      audioStream.isTalking &&
      now - audioStream.timestamp > notSpeakingThreshold
    ) {
      // low audio detected for X seconds
      audioStream.isTalking = false
      updateActiveSpeakerEl(elementId, "remove")
    }
  }, [])

  const subscribe = useCallback(
    (stream, options = {}) => {
      if (sessionRef.current && container.current) {
        console.log("sessionRef.current", sessionRef.current)
        const finalOptions = Object.assign({}, options, {
          insertMode: "append",
          width: "100%",
          height: "100%",
          style: {
            buttonDisplayMode: "auto",
            nameDisplayMode: "auto",
            audioLevelDisplayMode: "auto",
          },
          showControls: true,
        })
        const subscriber = sessionRef.current.subscribe(
          stream,
          container.current.id,
          finalOptions
        )
        // Add Subscriber to OT Speech
        if (stream.videoType !== 'screen') {
          otSpeech.addSubscriber(subscriber);
          otSpeech.notifySpeakerChange();
        }
        subscriber.on(
          "audioLevelUpdated",
          _.throttle((event) => onAudioLevel(event, subscriber.id), 50)
        )
      }
    },
    [container, onAudioLevel, otSpeech]
  )

  const onStreamCreated = useCallback(
    (event) => {
        subscribe(event.stream)
        addStream({ stream: event.stream })
        otLayout()
    },
    [otLayout, subscribe]
  )

  const onStreamDestroyed = useCallback((event) => {
    // Remove Subscriber from OT Speech
    otSpeech.removeSubscriberByStreamId(event.stream.id);
    otSpeech.notifySpeakerChange();
    removeStream({ stream: event.stream })
    setTimeout(()=> otLayout() , 200)
  }, [otLayout, otSpeech])

  // This callback/listener will handle the change of speaker order
  // based on the speech detection via audio level
  const onSpeakerOrderChanged = (updatedSpeakers, positions, numberOfActiveSpeakers) => {
    // Use Subscriber ID for InsertDefaultUI true
    // Use Stream ID for InsertDefaultUI false
    const mappedPositions = positions.filter(subscriberId => subscriberId != null);

    console.log(mappedPositions)
    //adjust
  }

  const createSession = useCallback(
    ({ apikey, sessionId, token }) => {
      if (!apikey) {
        throw new Error("Missing apiKey")
      }

      if (!sessionId) {
        throw new Error("Missing sessionId")
      }

      if (!token) {
        throw new Error("Missing token")
      }

      const eventHandlers = {
        streamCreated: onStreamCreated,
        streamDestroyed: onStreamDestroyed,
      }

      if (!connected && !connecting){
        setConnecting(true)
        sessionRef.current = OT.initSession(apikey, sessionId)
        otSpeech.addSelf()
        otSpeech.notifySpeakerChange()
        sessionRef.current.on(eventHandlers)
      }

      otSpeech.setNumberOfActiveSpeakers(initialNumberOfActiveSpeakers);
      otSpeech.setOnActiveSpeakerChangeListener(onSpeakerOrderChanged);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      otLayout = initLayoutContainer(container.current).layout
      
      return new Promise((resolve, reject) => {
        if (!sessionRef.current) {
          // Either this session has been disconnected or OTSession
          // has been unmounted so don't invoke any callbacks
          return
        }

        if (connected){
          resolve(sessionRef.current)
          return
        }
        sessionRef.current.connect(token, (err) => {
          if (err) {
            reject(err)
          } else if (!err) {
            console.log("Session Connected!")
            setConnected(true)
            resolve(sessionRef.current)
          }
        })
      })
    },
    [connected, connecting, onStreamCreated, onStreamDestroyed]
  )

  const destroySession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.on("disconnected", () => {
        sessionRef.current = null
      })
      sessionRef.current.disconnect()
      otSpeech.removeSelf()
      otSpeech.notifySpeakerChange()
    }
  }, [otSpeech])

  const refreshLayout = useCallback(() => {
    otLayout()
  }, [otLayout])

  return {
    session: sessionRef,
    connected,
    createSession,
    destroySession,
    refreshLayout,
    streams,
  }
}
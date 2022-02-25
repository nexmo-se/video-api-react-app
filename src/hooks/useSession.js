import React, { useState, useRef, useCallback } from "react";
import OT from "@opentok/client";
import _ from "lodash";

const speakingThreshold = 1000;
const notSpeakingThreshold = 2000;
const audioStream = {
  isTalking: false,
  timestamp: 0,
};

export function useSession({ container }) {
  const [connected, setConnected] = useState(false);
  const [streams, setStreams] = useState([]);
  const sessionRef = useRef(null);

  const addStream = ({ stream }) => {
    setStreams((prev) => [...prev, stream]);
  };

  const removeStream = ({ stream }) => {
    setStreams((prev) =>
      prev.filter((prevStream) => prevStream.id !== stream.id)
    );
  };

  const updateActiveSpeakerEl = (id, action) => {
    const el = id ? document.getElementById(id) : null;
    if (el) {
      if (action === "add") {
        el.classList.add("active-speaker-border");
      } else {
        el.classList.remove("active-speaker-border");
      }
    }
  };

  const onAudioLevel = useCallback((event, elementId) => {
    const now = new Date().getTime();
    if (event && event.audioLevel > 0.2) {
      // it could be speaking
      if (!audioStream.isTalking) {
        audioStream.isTalking = true;
        audioStream.timestamp = new Date().getTime();
      } else if (
        audioStream.isTalking &&
        now - audioStream.timestamp > speakingThreshold
      ) {
        audioStream.isTalking = true;
        audioStream.timestamp = new Date().getTime();
        // this means that it's speaking for more than X seconds
        updateActiveSpeakerEl(elementId, "add");
      }
    } else if (
      audioStream.isTalking &&
      now - audioStream.timestamp > notSpeakingThreshold
    ) {
      // low audio detected for X seconds
      audioStream.isTalking = false;
      updateActiveSpeakerEl(elementId, "remove");
    }
  }, []);

  const subscribe = React.useCallback(
    (stream, options = {}) => {
      if (sessionRef.current && container.current) {
        const finalOptions = Object.assign({}, options, {
          insertMode: "append",
          width: "100%",
          height: "100%",
          style: {
            buttonDisplayMode: "off",
            nameDisplayMode: "on",
          },
          showControls: false,
        });
        const subscriber = sessionRef.current.subscribe(
          stream,
          container.current.id,
          finalOptions
        );
        subscriber.on(
          "audioLevelUpdated",
          _.throttle((event) => onAudioLevel(event, subscriber.id), 50)
        );
      }
    },
    [onAudioLevel, container]
  );

  const onStreamCreated = useCallback(
    (event) => {
      subscribe(event.stream);
      addStream({ stream: event.stream });
    },
    [subscribe]
  );

  const onStreamDestroyed = useCallback((event) => {
    removeStream({ stream: event.stream });
  }, []);

  const createSession = useCallback(
    ({ apikey, sessionId, token }) => {
      if (!apikey) {
        throw new Error("Missing apiKey");
      }

      if (!sessionId) {
        throw new Error("Missing sessionId");
      }

      if (!token) {
        throw new Error("Missing token");
      }

      sessionRef.current = OT.initSession(apikey, sessionId);
      const eventHandlers = {
        streamCreated: onStreamCreated,
        streamDestroyed: onStreamDestroyed,
      };
      sessionRef.current.on(eventHandlers);
      return new Promise((resolve, reject) => {
        sessionRef.current.connect(token, (err) => {
          if (!sessionRef.current) {
            // Either this session has been disconnected or OTSession
            // has been unmounted so don't invoke any callbacks
            return;
          }
          if (err) {
            reject(err);
          } else if (!err) {
            console.log("Session Connected!");
            setConnected(true);
            resolve(sessionRef.current);
          }
        });
      });
    },
    [onStreamCreated, onStreamDestroyed]
  );

  const destroySession = React.useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.on("disconnected", () => {
        sessionRef.current = null;
      });
      sessionRef.current.disconnect();
    }
  }, []);

  return {
    session: sessionRef,
    connected,
    createSession,
    destroySession,
    streams,
  };
}

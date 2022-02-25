import { useState, useCallback, useEffect, useContext } from "react";
import { Message } from "../entities/ChatMessage";
import { UserContext } from "../context/UserContext";
import { v4 as uuid } from "uuid";

export function useChat({ session }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);

  async function signal({ type, data }) {
    return new Promise((resolve, reject) => {
      const payload = JSON.parse(JSON.stringify({ type, data }));
      if (session) {
        session.signal(payload, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  }

  async function sendMessage({ message }) {
    const toSend = Message({
      id: uuid(),
      sender: user.userName,
      text: message,
    });
    return signal({ type: "message", data: JSON.stringify(toSend) });
  }

  const messageListener = useCallback(({ data }) => {
    setMessages((prevMessage) => {
      const jsonData = JSON.parse(data);
      const message = Message(jsonData);
      return [...prevMessage, message];
    });
  }, []);

  const toggleChat = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    if (session) {
      session.on("signal:message", messageListener);
    }
    return function cleanup() {
      if (session) session.off("signal:message", messageListener);
    };
  }, [session, messageListener]);

  return { open, toggleChat, sendMessage, messages };
}

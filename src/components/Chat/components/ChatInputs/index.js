import React, { useState } from "react";

import { IconButton, TextField } from "@material-ui/core";
import { SendOutlined } from "@material-ui/icons";

function ChatInput({ className, sendMessage }) {
  const [text, setText] = useState("");

  function handleClick(e) {
    if (e) {
      e.preventDefault();
    }
    sendMessage(text);
    /* const message = new Message(user, text, isApproved);
    mMessage.send({ message }); */

    setText("");
  }

  function handleOnChange({ target }) {
    setText(target.value);
  }

  return (
    <form className={className} onSubmit={handleClick}>
      <TextField value={text} onChange={handleOnChange} />
      <IconButton type="submit" text="Send" onClick={handleClick}>
        <SendOutlined></SendOutlined>
      </IconButton>
    </form>
  );
}
export { ChatInput };

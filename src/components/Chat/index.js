import { List, ListItem, Typography } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import useStyles from "./styles";
import { ChatInput } from "./components/ChatInputs";
import { ChatMessage } from "./components/ChatMessage";

const anchor = "right"; // https://material-ui.com/api/drawer/

export function Chat({ open, handleToggleChat, messages, sendChatMessage }) {
  const classes = useStyles();

  return (
    <Drawer anchor={anchor} open={open} onClose={handleToggleChat}>
      <div className={classes.container}>
        <Typography variant="h4" component="h2">
          Chat
        </Typography>
        <List className={classes.messageList}>
          {messages.map((msg, index) => (
            <ListItem key={msg.id}>
              <ChatMessage sender={msg.sender} text={msg.text} />
            </ListItem>
          ))}
        </List>
        <ChatInput
          className={classes.chatInput}
          sendMessage={sendChatMessage}
        ></ChatInput>
      </div>
    </Drawer>
  );
}

import { Typography } from "@material-ui/core";
import useStyles from "./styles";

export function ChatMessage({ sender, text }) {
  const classes = useStyles();

  return (
    <div className={classes.messageContainer}>
      <Typography variant="subtitle1">{sender}</Typography>
      <Typography variant="body1">{text}</Typography>
    </div>
  );
}

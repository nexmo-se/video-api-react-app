import { makeStyles } from "@material-ui/core/styles";

export default makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    padding: "5px 15px",
    overflow: "hidden",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 80%",
    overflow: "scroll",
    color: "#fff",
  },
  chatTitle: {
    position: "fixed",
    top: 0,
  },
  chatInput: {
    display: "flex",
    flexDirection: "row",
  },
}));

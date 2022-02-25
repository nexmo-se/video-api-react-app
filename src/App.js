import "./App.css";
import { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { WaitingRoom } from "./components/WaitingRoom";
import { VideoRoom } from "./components/VideoRoom";
import { UserContext } from "./context/UserContext";

function AppRouter() {
  const [user, setUser] = useState({
    userName: `User-${Math.floor(100000 + Math.random() * 900000)}`,
    defaultSettings: {
      publishAudio: true,
      publishVideo: true,
    },
  });

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);
  return (
    <Router>
      <UserContext.Provider value={value}>
        <Switch>
          <Route path="/video-room" component={VideoRoom} />
          <Route path="/waiting-room" component={WaitingRoom} />
          <Route path="/">
            <Redirect to="/waiting-room" />
          </Route>
        </Switch>
      </UserContext.Provider>
    </Router>
  );
}

export default AppRouter;

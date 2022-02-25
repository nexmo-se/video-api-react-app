export const getCredentials = async (url) => {
  if (process.env.REACT_APP_ENVIRONMENT) {
    // Mock credentials for local development
    return Promise.resolve({
      apikey: process.env.REACT_APP_VIDEO_API_KEY,
      sessionId: process.env.REACT_APP_VIDEO_SESSION,
      token: process.env.REACT_APP_VIDEO_TOKEN,
    });
  } else {
    return fetch(url)
      .then((x) => x.json())
      .then((y) => {
        return {
          apikey: y.apikey,
          sessionId: y.sessionId,
          token: y.token,
        };
      });
  }
};

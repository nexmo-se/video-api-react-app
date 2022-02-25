import { useCallback, useEffect, useRef, useState } from "react";
import OT from "@opentok/client";
import NetworkTest from "opentok-network-test-js";

const networkTestVideoTimeout = 15000; // To Edit to 30s

export const useNetworkTest = ({ apikey, sessionId, token }) => {
  /* const [otNetworkTest, setOtNetworkTest] = useState(null); */
  const otNetworkTest = useRef();
  const [runTest, setRunTest] = useState(true);
  const [connectivityTest, setConnectivityTest] = useState({
    data: null,
    loading: true,
  });
  const [qualityTest, setQualityTest] = useState({ data: null, loading: true });

  const initNetworkTest = useCallback(() => {
    otNetworkTest.current = new NetworkTest(
      OT,
      {
        apiKey: apikey,
        sessionId,
        token,
      },
      { timeout: networkTestVideoTimeout }
    );
    // setOtNetworkTest(instance);
  }, [apikey, sessionId, token]);

  const runNetworkTest = useCallback(() => {
    console.log("runNetworkTest - useCallback");
    setConnectivityTest((state) => ({ data: state.data, loading: true }));
    setQualityTest((state) => ({ data: state.data, loading: true }));
    if (otNetworkTest.current && runTest) {
      setRunTest(false);
      otNetworkTest.current
        .testConnectivity()
        .then((results) => {
          console.log("OpenTok connectivity test results", results);
          if (otNetworkTest.current) {
            setConnectivityTest({ loading: false, data: results });
          }
          if (otNetworkTest.current) {
            otNetworkTest.current
              .testQuality(function updateCallback(stats) {
                console.log("intermediate testQuality stats", stats);
              })
              .then((results) => {
                // This function is called when the quality test is completed.
                console.log("OpenTok quality results", results);
                if (otNetworkTest.current) {
                  setQualityTest((state) => ({
                    data: results,
                    loading: false,
                  }));
                }
              })
              .catch((error) => {
                console.log("OpenTok quality test error", error);
              });
          }
        })
        .catch(function (error) {
          console.log("OpenTok connectivity test error", error);
        });
    }
  }, [otNetworkTest, runTest]);

  /**
   * Stop the network testConnectivity test. Pleae check limitation
   * https://github.com/opentok/opentok-network-test-js#otnetworkteststop
   */
  const stopNetworkTest = useCallback(() => {
    console.log("stopNetworkTest - useCallback", runTest);
    if (otNetworkTest.current && !runTest) {
      otNetworkTest.current.stop();
      otNetworkTest.current = null;
      setRunTest(true);
    }
  }, [otNetworkTest, runTest]);

  useEffect(() => {
    initNetworkTest();
  }, [initNetworkTest]);

  return {
    connectivityTest,
    qualityTest,
    initNetworkTest,
    runNetworkTest,
    stopNetworkTest,
    setRunTest,
  };
};

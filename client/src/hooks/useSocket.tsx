import { useEffect, useState } from "react";
import { initializeSocket, getSocket } from "@/utils/socket";

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState(getSocket());

  useEffect(() => {
    if (token) {
      const s = initializeSocket(token);
      setSocket(s);
    } else {
      const s = getSocket();
      if (s) {
        s.disconnect();
      }
      setSocket(null);
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.disconnect();
      }
      setSocket(null);
    };
  }, [token]);

  return socket;
}

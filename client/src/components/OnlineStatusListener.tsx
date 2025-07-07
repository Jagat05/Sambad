"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  userOnline,
  userOffline,
  setOnlineUsers,
} from "@/redux/reducerSlices/onlineSlice";
import { initializeSocket } from "@/utils/socket";

export const OnlineStatusListener = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const userId = useSelector((state: any) => state.user.id);

  useEffect(() => {
    if (!token || !userId) return;

    const socket = initializeSocket(token);

    // Local user is online
    dispatch(userOnline(userId));

    // ✅ Get initial list of online users
    socket.on("online-users", (userIds: string[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    // ✅ Listen for others going online/offline
    socket.on("user-online", ({ userId }) => dispatch(userOnline(userId)));
    socket.on("user-offline", ({ userId }) => dispatch(userOffline(userId)));

    return () => {
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [token, userId, dispatch]);

  return null;
};

// components/Avatar.tsx
"use client";

import { useState } from "react";

interface AvatarProps {
  username: string;
  avatar?: string;
  isOnline?: boolean;
  size?: number;
}

export const Avatar = ({
  username,
  avatar,
  isOnline,
  size = 40,
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  const avatarUrl =
    avatar?.startsWith("http") || avatar?.startsWith("https")
      ? avatar
      : avatar
      ? `${process.env.NEXT_PUBLIC_API_URL}/${avatar}`
      : "";

  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      {!imgError && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
          draggable={false}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-blue-500 text-white rounded-full uppercase font-semibold select-none"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.5,
          }}
        >
          {username?.[0] || "?"}
        </div>
      )}

      {typeof isOnline === "boolean" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          style={{
            width: size * 0.25,
            height: size * 0.25,
          }}
        />
      )}
    </div>
  );
};

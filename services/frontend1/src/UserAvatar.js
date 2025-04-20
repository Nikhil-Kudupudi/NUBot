import React from 'react';

const UserAvatar = ({ size = 40, strokeWidth = 2 }) => {
  const radius = (size / 2) - strokeWidth;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer circle with red border */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="black"
        stroke="#FF3B30"
        strokeWidth={strokeWidth}
      />

      {/* Head */}
      <circle
        cx={center}
        cy={center - 5}
        r={6}
        fill="white"
      />

      {/* Shoulders */}
      <path
        d={`
          M${center - 10} ${size - 8}
          C${center - 10} ${(size / 1.5)}
           ${center + 10} ${(size / 1.5)}
           ${center + 10} ${size - 8}
        `}
        fill="white"
      />
    </svg>
  );
};

export default UserAvatar;

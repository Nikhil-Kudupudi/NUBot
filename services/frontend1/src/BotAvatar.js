// src/BotAvatar.js
import React from 'react';
import huskyLogo from './assets/husky-logo.svg';

const BotAvatar = ({ size = 60 }) => (
  <img
    src={huskyLogo}
    alt="Bot Avatar"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      objectFit: 'contain',
    }}
  />
);

export default BotAvatar;

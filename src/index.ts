#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import cowsay from 'cowsay';

// Simple component that wraps cowsay
const App: React.FC = () => {
  const cowOutput = cowsay.say({
    text: 'Hello, World!',
  });

  return <pre>{cowOutput}</pre>;
};

// Render the app
render(<App />);
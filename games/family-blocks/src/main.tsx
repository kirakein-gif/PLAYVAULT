import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/gowun-dodum/korean-400.css';
import '@fontsource-variable/nunito/wght.css';
import App from './App';
import { GAME_TITLE } from './brand';

document.title=GAME_TITLE;
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

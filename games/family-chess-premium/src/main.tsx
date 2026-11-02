import { createRoot } from 'react-dom/client';
import '@fontsource/noto-serif-kr/korean-700.css';
import '@fontsource/noto-serif-kr/latin-700.css';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import './styles/app.css';
import { App } from './App';
import { loadData } from './storage/store';

const SPLASH_MIN_MS = 900;

async function boot() {
  const started = performance.now();
  const { data } = await loadData();
  const wait = SPLASH_MIN_MS - (performance.now() - started);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  const splash = document.getElementById('splash');
  splash?.classList.add('out');
  setTimeout(() => splash?.remove(), 450);
  createRoot(document.getElementById('root')!).render(<App initial={data} />);
}

void boot();

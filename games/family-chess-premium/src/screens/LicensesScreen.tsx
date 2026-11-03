import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { TopBar } from '../components/ui';

const ITEMS = [
  { name: 'Stockfish 19', license: 'GPL-3.0', note: 'The Stockfish developers (see AUTHORS). https://github.com/official-stockfish/Stockfish' },
  { name: 'Stockfish.js 19.0.1 (stockfish-19-lite-single)', license: 'GPL-3.0', note: 'Nathan Rugg / Chess.com — WASM build of Stockfish. NNUE net nn-61e7af4bb97d by Chris Bao. https://github.com/nmrugg/stockfish.js' },
  { name: 'chess.js 1.4.0', license: 'BSD-2-Clause', note: 'Jeff Hlywa. https://github.com/jhlywa/chess.js' },
  { name: 'React 19', license: 'MIT', note: 'Meta Platforms, Inc.' },
  { name: 'Capacitor 8 (+ App, Preferences, Filesystem, Share, Haptics)', license: 'MIT', note: 'Ionic. https://capacitorjs.com' },
  { name: 'Gowun Dodum / Gowun Batang', license: 'SIL OFL 1.1', note: 'Yanghee Ryu — via @fontsource/gowun-dodum, @fontsource/gowun-batang' },
  { name: 'Nunito', license: 'SIL OFL 1.1', note: 'Vernon Adams et al. — via @fontsource-variable/nunito' },
  { name: 'Cinzel', license: 'SIL OFL 1.1', note: 'Natanael Gama — via @fontsource/cinzel' },
  { name: 'Pieces, board textures, icons, sounds', license: 'Original', note: 'Made for this app (procedural SVG, generated wood, synthesised audio).' },
  { name: 'Puzzles 1–121', license: 'Original', note: 'Generated from engine self-play and verified with Stockfish 19 for this app.' },
  { name: 'Puzzles from 122 (LI-…)', license: 'CC0', note: 'Lichess puzzle database, https://database.lichess.org/ — thank you, Lichess. Re-verified with Stockfish 19.' },
];

export function LicensesScreen() {
  const { t } = useApp();
  const [gpl, setGpl] = useState('');
  useEffect(() => {
    fetch('licenses/STOCKFISH-GPL-3.0.txt')
      .then((r) => r.text())
      .then(setGpl)
      .catch(() => setGpl(''));
  }, []);
  return (
    <div className="screen licenses">
      <TopBar title={t('licenses.title')} />
      <div className="licenseBody">
        {ITEMS.map((i) => (
          <div key={i.name} className="licItem">
            <b>{i.name}</b> <span className="tag">{i.license}</span>
            <div className="licNote">{i.note}</div>
          </div>
        ))}
        <p className="licNote">
          This app bundles the Stockfish engine under the GNU General Public License v3. The corresponding source code is available at the repositories above
          (Stockfish.js tag v19.0.1). See LICENSES/ in the project source.
        </p>
        {gpl && <pre className="gpl">{gpl}</pre>}
      </div>
    </div>
  );
}

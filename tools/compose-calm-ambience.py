"""Original quiet gothic ambience; no samples or third-party melodies.

Harmonically aligned sustained voices avoid detuned bass beating. There are no
percussive pulses, subsonic oscillators or real-time synthesis in normal play.
All frequencies and envelopes are periodic, with wrapped offline hall tails.
"""
from pathlib import Path
import wave
import numpy as np

RATE = 22050
OUT = Path(__file__).resolve().parents[1] / 'assets/audio'
OUT.mkdir(parents=True, exist_ok=True)

def compose(name, seconds, root, bells):
    count = RATE * seconds
    t = np.arange(count) / RATE
    result = np.zeros((count, 2))
    root = round(root * seconds) / seconds
    envelope = .82 + .08 * np.cos(2*np.pi*t/seconds)
    for side in range(2):
        for harmonic, weight in [(1,.095),(2,.022),(3,.012),(4,.003)]:
            result[:,side] += weight*np.sin(2*np.pi*root*harmonic*t+side*.12)*envelope
    for start, multiplier, amplitude in bells:
        age = np.remainder(t-start, seconds)
        frequency = root * multiplier
        envelope = np.sin(np.pi*np.minimum(age/.7,1)/2)**2 * np.exp(-age/2.8)
        envelope *= np.clip((14-age)/2,0,1)
        bell = sum(weight*np.sin(2*np.pi*frequency*harmonic*age)
                   for harmonic,weight in [(1,1),(2,.12),(3,.035)]) * envelope * amplitude
        for side in range(2):
            result[:,side] += bell
            for delay,gain in [(.23,.18),(.49,.13),(.83,.08),(1.21,.05)]:
                result[:,side] += np.roll(bell,int(RATE*(delay+side*.011)))*gain
    assert np.max(np.abs(result)) < .3, 'no clipped or over-loud output'
    pcm=np.round(result*32767).astype('<i2')
    with wave.open(str(OUT/(name+'-calm.wav')), 'wb') as target:
        target.setnchannels(2);target.setsampwidth(2);target.setframerate(RATE);target.writeframes(pcm.tobytes())
    seam=float(np.max(np.abs(result[0]-result[-1])))
    adjacent=float(np.percentile(np.abs(np.diff(result,axis=0)),99.9))
    assert seam <= adjacent, 'loop seam exceeds ordinary waveform change'
    print(name, seconds, 'seconds; peak',round(float(np.max(np.abs(result))),3),
          '; seam',round(seam,6),'; RMS',round(float(np.sqrt(np.mean(result**2))),4))

compose('title',32,110,[(4,4,.036),(20,3,.028)])
compose('explore',48,110,[(5,3,.028),(22,4,.032),(38,5,.018)])
compose('boss',40,98,[(6,3,.032),(23,4,.025)])

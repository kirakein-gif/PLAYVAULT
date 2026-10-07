"""Original sparse bell ambience. No pads, drones, bass beds or samples.

Only occasional high bells with short offline tails; true silent gaps between
events. Periodic frequencies and wrapped tails preserve seamless file looping.
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
    for start, multiplier, amplitude in bells:
        age = np.remainder(t-start, seconds)
        frequency = root * multiplier
        envelope = np.sin(np.pi*np.minimum(age/.12,1)/2)**2 * np.exp(-age/1.4)
        envelope *= np.clip((7-age),0,1)
        bell = sum(weight*np.sin(2*np.pi*frequency*harmonic*age)
                   for harmonic,weight in [(1,1),(2,.12),(3,.035)]) * envelope * amplitude
        for side in range(2):
            result[:,side] += bell
            for delay,gain in [(.23,.18),(.49,.13),(.83,.08),(1.21,.05)]:
                result[:,side] += np.roll(bell,int(RATE*(delay+side*.011)))*gain
    assert np.max(np.abs(result)) < .3, 'no clipped or over-loud output'
    pcm=np.round(result*32767).astype('<i2')
    with wave.open(str(OUT/(name+'-sparse.wav')), 'wb') as target:
        target.setnchannels(2);target.setsampwidth(2);target.setframerate(RATE);target.writeframes(pcm.tobytes())
    seam=float(np.max(np.abs(result[0]-result[-1])))
    adjacent=float(np.percentile(np.abs(np.diff(result,axis=0)),99.9))
    assert seam <= max(adjacent,1e-8), 'loop seam exceeds ordinary waveform change'
    silence=np.mean(np.max(np.abs(result),axis=1)<1e-8)
    assert silence>.35, 'must contain substantial complete silence, never a continuous bed'
    print(name, seconds, 'seconds; peak',round(float(np.max(np.abs(result))),3),
          '; seam',round(seam,6),'; silent',round(float(silence*100),1),'%')

compose('title',32,110,[(4,4,.036),(20,3,.028)])
compose('explore',48,110,[(5,3,.028),(22,4,.032),(38,5,.018)])
compose('boss',40,98,[(6,3,.032),(23,4,.025)])

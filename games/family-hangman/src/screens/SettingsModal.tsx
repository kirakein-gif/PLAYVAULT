import { useEffect, useState } from 'react';
import { useApp } from '../state';
import { Btn, Confirm, Modal, Toggle } from '../components/ui';
import { Icon } from '../components/icons';
import { backupFileName, makeBackup, parseBackup } from '../storage/backup';
import { replaceAll } from '../storage/store';
import { pickTextFile, saveTextFile, shareFile, isNative } from '../platform/native';
import { sound } from '../audio/sound';
import { PICTURES, type AppData } from '../storage/schema';
import { APP_TITLE, APP_VERSION } from '../brand';
import { WORDS } from '../game/words';
import { useFullscreen } from '../components/FullscreenButton';
import { fullscreenSupported } from '../platform/fullscreen';
import { SPEECH_RATES, openVoiceInstall, speak, speechStatus, type SpeechStatus } from '../platform/speech';

/** One line a tester can photograph: WebView engine, Android version, CSS screen size. */
export function deviceInfo(): string {
  const ua = navigator.userAgent;
  const chrome = ua.match(/Chrome\/(\d+)/)?.[1];
  const android = ua.match(/Android ([\d.]+)/)?.[1];
  return [android ? `Android ${android}` : navigator.platform, chrome ? `WebView ${chrome}` : 'WebView ?', `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`].join(' · ');
}

export function SettingsModal() {
  const app = useApp();
  const { t, settings, updateSettings, data, setData, lang, setLang, openSettings, click, toast, profile, updateProfile } = app;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pending, setPending] = useState<{ data: AppData; text: string } | null>(null);
  const [exported, setExported] = useState<{ where: string; uri?: string } | null>(null);
  const close = () => openSettings(false);
  const [voice, setVoice] = useState<SpeechStatus>('checking');
  const [fsOn, toggleFs] = useFullscreen();
  useEffect(() => {
    void speechStatus(true).then(setVoice);
  }, []);

  const row = (label: string, control: React.ReactNode, desc?: string) => (
    <div className="settingRow">
      <span>
        {label}
        {desc && <small>{desc}</small>}
      </span>
      {control}
    </div>
  );

  const doExport = async () => {
    try {
      const json = JSON.stringify(makeBackup(data, APP_VERSION), null, 1);
      const r = await saveTextFile(backupFileName(), json, 'application/json');
      setExported(r);
      toast(t('settings.exportOk', { path: r.where }));
    } catch {
      toast(t('settings.exportFail'));
    }
  };
  const doImport = async () => {
    const text = await pickTextFile('.json,application/json');
    if (!text) return;
    const r = parseBackup(text);
    if (!r.ok) {
      toast(t('settings.importFail', { reason: t(`settings.errors.${r.error}`) }));
      return;
    }
    setPending({ data: r.data, text: t('settings.importConfirm', { date: r.summary.exportedAt.slice(0, 16).replace('T', ' '), profiles: r.summary.profiles.join(', ') }) });
  };

  return (
    <Modal title={t('settings.title')} onClose={close} wide actions={<Btn kind="gold" onClick={close} testId="settings-close">{t('common.close')}</Btn>}>
      <div className="settings" data-testid="settings">
        <section>
          {row(t('settings.sound'), <Toggle testId="set-sound" on={settings.soundOn} onChange={(v) => { updateSettings({ soundOn: v }); sound.enabled = v; }} />)}
          {row(
            t('settings.volume'),
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.volume * 100)}
              data-testid="set-volume"
              onChange={(e) => updateSettings({ volume: Number(e.target.value) / 100 })}
              onPointerUp={() => { sound.unlock(); sound.play('correct'); }}
            />,
          )}
          {isNative && row(t('settings.haptics'), <Toggle on={settings.haptics} onChange={(v) => updateSettings({ haptics: v })} />)}
          {fullscreenSupported && row(t('fullscreen.title'), <Toggle testId="set-fullscreen" on={fsOn} onChange={() => toggleFs()} />, t(isNative ? 'fullscreen.descApp' : 'fullscreen.descWeb'))}
          {row(t('settings.lowPower'), <Toggle testId="set-lowpower" on={settings.lowPower} onChange={(v) => updateSettings({ lowPower: v })} />, t('settings.lowPowerDesc'))}
          {row(
            t('settings.picture'),
            <div className="segmented">
              {PICTURES.map((pic) => (
                <button
                  key={pic}
                  className={profile.picture === pic ? 'on' : ''}
                  data-testid={`picture-${pic}`}
                  onClick={() => { click(); updateProfile((p) => ({ ...p, picture: pic })); }}
                >
                  {t(`settings.pictures.${pic}`)}
                </button>
              ))}
            </div>,
            t('settings.pictureDesc'),
          )}
          {row(
            t('speech.rate'),
            <div className="segmented">
              {SPEECH_RATES.map((r) => (
                <button
                  key={r}
                  className={profile.speechRate === r ? 'on' : ''}
                  data-testid={`rate-${r}`}
                  onClick={() => {
                    click();
                    updateProfile((p) => ({ ...p, speechRate: r }));
                    void speak('apple', r);
                  }}
                >
                  {t(`speech.rates.${r}`)}
                </button>
              ))}
            </div>,
            voice === 'missing' ? t('speech.missing') : t('speech.rateDesc'),
          )}
          {voice === 'missing' && isNative && (
            <div className="rowBtns">
              <Btn size="sm" onClick={() => void openVoiceInstall()} testId="voice-install">{t('speech.install')}</Btn>
            </div>
          )}
          {row(
            t('settings.language'),
            <div className="segmented">
              <button className={lang === 'ko' ? 'on' : ''} onClick={() => { click(); setLang('ko'); }}>한국어</button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => { click(); setLang('en'); }}>English</button>
            </div>,
          )}
        </section>
        <section>
          <h3>{t('settings.profiles')}</h3>
          {data.profileOrder.map((id) => (
            <div className="settingRow" key={id}>
              {renaming === id ? (
                <input className="textInput" value={name} maxLength={16} autoFocus onChange={(e) => setName(e.target.value)} aria-label={t('settings.namePrompt')} data-testid="rename-input" />
              ) : (
                <span>
                  {Icon.user} {data.profiles[id].name} {id === data.activeProfileId && <em className="tag">{t('settings.current')}</em>}
                </span>
              )}
              <span className="rowBtns">
                {renaming === id ? (
                  <Btn
                    size="sm"
                    kind="gold"
                    testId="rename-save"
                    onClick={() => {
                      const nm = name.trim().slice(0, 16);
                      if (nm) setData({ ...data, profiles: { ...data.profiles, [id]: { ...data.profiles[id], name: nm } } });
                      setRenaming(null);
                    }}
                  >
                    {t('common.save')}
                  </Btn>
                ) : (
                  <Btn size="sm" testId={`rename-${id}`} onClick={() => { setRenaming(id); setName(data.profiles[id].name); }}>
                    {t('settings.rename')}
                  </Btn>
                )}
                {id !== data.activeProfileId && (
                  <Btn size="sm" kind="gold" testId={`use-${id}`} onClick={() => setData({ ...data, activeProfileId: id })}>
                    {t('settings.use')}
                  </Btn>
                )}
              </span>
            </div>
          ))}
        </section>
        <section>
          <h3>{t('settings.data')}</h3>
          <div className="rowBtns wrap">
            <Btn icon={Icon.save} onClick={doExport} testId="export">{t('settings.export')}</Btn>
            {exported?.uri && isNative && <Btn onClick={() => void shareFile(exported.uri!, `${APP_TITLE} backup`)}>{t('settings.exportShare')}</Btn>}
            <Btn icon={Icon.folder} onClick={doImport} testId="import">{t('settings.import')}</Btn>
          </div>
          <p className="hintText">{t('settings.uninstallWarn')}</p>
        </section>
        <section>
          <h3>{t('settings.about')}</h3>
          <p>{APP_TITLE} · {t('settings.version', { v: APP_VERSION })}</p>
          <p className="hintText">{t('settings.offline')}</p>
          <p className="hintText">{t('settings.words', { n: WORDS.length })}</p>
          <p className="hintText" data-testid="device-info">{t('settings.device', { info: deviceInfo() })} · {t('speech.status')}: <span data-testid="voice-status">{t(`speech.statuses.${voice}`)}</span></p>
          <Btn kind="ghost" onClick={() => { close(); app.go({ name: 'licenses' }); }} testId="licenses">{t('settings.licenses')}</Btn>
        </section>
      </div>
      {pending && (
        <Confirm
          text={pending.text}
          onNo={() => setPending(null)}
          onYes={async () => {
            await replaceAll(pending.data);
            setData(pending.data);
            setPending(null);
            toast(t('settings.importOk'));
          }}
        />
      )}
    </Modal>
  );
}

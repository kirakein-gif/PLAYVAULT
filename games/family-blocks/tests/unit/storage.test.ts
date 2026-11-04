import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defaultData, validateData, recordGame } from '../../src/storage/schema';
import { exportBackup, importBackup } from '../../src/storage/backup';
import { createGame } from '../../src/core/game';
import { en, ko } from '../../src/i18n';

describe('Profiles, persistence and backup',()=>{
  it('separates the two family profiles and records',()=>{
    const d=defaultData();expect(d.profiles.map(x=>x.name)).toEqual(['아빠','아이']);
    const s=createGame('challenge');s.score=999;s.lines=4;
    const changed=recordGame(d,s);
    expect(changed.profiles[1].records.challenge.bestScore).toBe(999);
    expect(changed.profiles[0].records.challenge.bestScore).toBe(0);
  });
  it('recovers broken settings and limits the recent list',()=>{
    const d=defaultData() as unknown as {version:1;activeProfileId:string;profiles:Record<string,unknown>[]};
    d.profiles[0].settings={volume:-9,previews:17,sfx:'yes'};
    d.profiles[0].recent=Array(100).fill({mode:'gentle',date:'test',score:-10,ms:0,lines:0});
    const v=validateData(d);
    expect(v.ok).toBe(true);
    if(v.ok){
      expect(v.recovered).toBe(true);
      expect(v.data.profiles[0].settings.volume).toBe(.35);
      expect(v.data.profiles[0].settings.previews).toBe(3);
      expect(v.data.profiles[0].recent).toHaveLength(20);
    }
  });
  it('rejects a completely broken schema',()=>{
    expect(validateData({version:2,profiles:[]})).toEqual({ok:false,error:'invalidSchema'});
  });
  it('exports and imports the same data',()=>{
    const src=defaultData(),raw=exportBackup(src),result=importBackup(raw);
    expect(result.ok).toBe(true);if(result.ok)expect(result.data).toEqual(src);
  });
  it('rejects foreign app backups and invalid JSON',()=>{
    expect(importBackup('{bad').ok).toBe(false);
    expect(importBackup(JSON.stringify({app:'other',data:defaultData()})).ok).toBe(false);
  });
  it('Korean and English keys match',()=>{
    expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort());
  });
});
describe('Trademarks must not appear in distributed sources',()=>{
  const root=process.cwd();
  const banned=/tetris|테트리스|tetrimino|t-spin/i;
  function walk(path:string):string[]{
    return readdirSync(path).flatMap(name=>{
      const p=join(path,name);
      return statSync(p).isDirectory()?walk(p):[p];
    });
  }
  it('excludes protected terms from code and public images',()=>{
    const paths=[...walk(join(root,'src')),...walk(join(root,'public')),join(root,'index.html')];
    for(const file of paths)
      expect(banned.test(readFileSync(file,'utf8')),file).toBe(false);
  });
});

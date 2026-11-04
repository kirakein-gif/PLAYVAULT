import { Preferences } from '@capacitor/preferences';
import { defaultData, validateData, type AppData } from './schema';
const KEY='family-blocks.data.v1', BACKUP='family-blocks.data.v1.previous';
export async function loadData():Promise<{data:AppData;recovered:boolean}> {
  let sawDamaged=false;
  for(const key of [KEY,BACKUP]) {
    const {value}=await Preferences.get({key});
    if(!value) continue;
    try{
      const v=validateData(JSON.parse(value));
      if(v.ok) return {data:v.data,recovered:sawDamaged||key===BACKUP||v.recovered};
    }catch{/* Recover from the previous saved copy. */}
    sawDamaged=true;
  }
  return {data:defaultData(),recovered:sawDamaged};
}
export async function saveData(data:AppData):Promise<void>{
  const current=await Preferences.get({key:KEY});
  if(current.value)await Preferences.set({key:BACKUP,value:current.value});
  await Preferences.set({key:KEY,value:JSON.stringify(data)});
}

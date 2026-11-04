import { APP_ID, SCHEMA_VERSION, validateData, type AppData } from './schema';
export function exportBackup(data:AppData):string {
  return JSON.stringify({app:APP_ID,schema:SCHEMA_VERSION,version:'1.0.0',exportedAt:new Date().toISOString(),data},null,2);
}
export function importBackup(raw:string):{ok:true;data:AppData}|{ok:false;error:string}{
  let obj:unknown;
  try{obj=JSON.parse(raw);}catch{return {ok:false,error:'badJson'};}
  if(!obj||typeof obj!=='object'||(obj as {app?:string}).app!==APP_ID)return {ok:false,error:'wrongApp'};
  const parsed=validateData((obj as {data?:unknown}).data);
  return parsed.ok?{ok:true,data:parsed.data}:{ok:false,error:parsed.error};
}
export function backupName(date=new Date()):string {
  return 'family-blocks-'+date.toISOString().replace(/[:.]/g,'-')+'.json';
}

// Platform adapter only. Does not alter acceptance tests/assertions/network rules.
// NODE_PATH=<Playwright packages> CHROMIUM_PATH=<Chrome> node --import ./scripts/windows-e2e-preload.mjs tests/e2e/run-e2e.mjs
import { createRequire, syncBuiltinESMExports } from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),cp=require('node:child_process');
if(process.platform==='win32'){
  const spawn=cp.spawn;
  cp.spawn=(cmd,args,opts)=>cmd==='npx'&&args?.[0]==='vite'
    ?spawn(process.execPath,[path.join(opts.cwd,'node_modules/vite/bin/vite.js'),...args.slice(1)],opts)
    :spawn(cmd,args,opts);
  syncBuiltinESMExports();
}
if(process.env.CHROMIUM_PATH){
  const {chromium}=require('playwright'),launch=chromium.launch.bind(chromium);
  chromium.launch=(opts={})=>launch({...opts,executablePath:process.env.CHROMIUM_PATH});
}

const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
function serve(root,port=0){return new Promise(resolve=>{
 const server=http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 const file=path.resolve(root,'.'+p+(p.endsWith('/')?'index.html':''));
 if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}
 const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.md':'text/plain','.png':'image/png','.webm':'video/webm'};
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
 });server.listen(port,'127.0.0.1',()=>resolve(server));
});}
module.exports={serve};
if(require.main===module)serve(path.resolve(__dirname,'../../../..'),8080).then(()=>console.log('http://127.0.0.1:8080/games/worlds-greatest-game/motion-lab/'));

const {serve}=require('./tests/serve.cjs');
serve(__dirname,8080).then(()=>console.log('Motion Lab: http://127.0.0.1:8080/ (Ctrl+C to stop)'));

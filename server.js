const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'public');
const server = http.createServer((req,res)=>{
 const pathname = new URL(req.url,'http://localhost').pathname;
 const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
 if (!file.startsWith(root + path.sep)) {res.writeHead(403); return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript','svg':'image/svg+xml'})[file.split('.').pop()]||'application/octet-stream');res.end(data);});
});
server.listen(process.env.PORT || 3000,'0.0.0.0');

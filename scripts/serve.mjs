import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const host = '127.0.0.1';
const firstPort = 4173;
let port = firstPort;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf','.mp4':'video/mp4','.webm':'video/webm','.ogg':'video/ogg'};
const server = http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  if (!fs.existsSync(file)) {res.writeHead(404,{'Content-Type':'text/html'}).end(fs.readFileSync(path.join(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  fs.createReadStream(file).pipe(res);
});
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && port < firstPort + 10) {
    console.log(`Port ${port} is in use; trying ${port + 1}.`);
    port++;
    server.listen(port, host);
    return;
  }
  console.error(`Could not start the local server on ${host}:${port}: ${error.message}`);
  process.exitCode = 1;
});
server.on('listening', () => console.log(`Local: http://${host}:${port}`));
server.listen(port, host);

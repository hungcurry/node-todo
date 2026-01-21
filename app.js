// ===================
// ~CommonJS（CJS） ...
// ===================
// PATH
const path = require('path');

// ~__dirname 目前檔案所在-資料夾路徑
console.log(``  , __dirname) 
// C:\Users\currylee\Desktop\node-test

// ~__filename 目前檔案所在-完整路徑
console.log(``  , __filename)
// C:\Users\currylee\Desktop\node-test\app.js

console.log(`---------------------`);

// !path.dirname() 取「上一層資料夾」
// // ~抓"指定檔案"-目錄路徑 
console.log(``  , path.dirname('/xx/yy/zz.js')) 
// => 回傳 /xx/yy

// // ~路徑合併-前後路徑合併
console.log(``  , path.join(__dirname,'/xx')) 
// => 回傳 C:\Users\currylee\Desktop\node-test\xx

// // ~抓"指定檔案"-檔名
console.log(``  , path.basename('/xx/yy/zz.js'))
// => 回傳 zz.js

// // ~抓"指定檔案"-副檔名
console.log(``  , path.extname('/xx/yy/zz.js'))
// => 回傳 .js

// // ~抓"指定檔案"-完整路徑解析
console.log(``  , path.parse('/xx/yy/zz.js'))
// => 回傳 { root: '/', dir: '/xx/yy', base: 'zz.js', ext: '.js', name: 'zz' }

console.log(`---------------------`);
const express = require('express');
// console.log(express);
const logger = require('morgan');
const app = express();
app.use(logger('dev'));

// / 根目錄
app.get('/', (req, res) => {
  res.json({ data: 'Hello World 這是雲端測試todos' });
  // GET / 200 2.434 ms - 46
});

// ===================
// ~Create a simple HTTP server ...
// ===================
// *啟動 本地伺服器
// http://localhost:8080/

// *雲端伺服器
// https://node-todo.zeabur.app/
// https://node-todo.zeabur.app/todos

const errHandle = require('./errorHandle');
const http = require('http');

// ~舊 UUID 方式
// const { v4: uuidv4 } = require('uuid');
// ~新方式 UUID 方式
const { randomUUID } = require('crypto')
const id = randomUUID()
// console.log(id); // '110ec58a-a0f2-4ac4-8393-c866d813b8d1

const todos = [
  {
    id: randomUUID(),
    title: "白爛貓",
  }
];

// ~node原生寫法,沒使用express
const requestListener = (req, res)=>{
  // Base test
  // console.log(req);
  // console.log(req.url);
  // res.writeHead(200, { 'Content-Type': 'text/plain' })
  // res.write('Hello')
  // res.end()

  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }
  // * 如果是框架,會自動幫你做這件事
  let body = "";
  req.on('data', chunk=>{
    // chunk 每次接收到的資料,切成位元碼傳來並封包持續接收累加起來
    // <Buffer 7b 0d 0a 20 20 22 74 69 74 6c 65 22 3a 20 22 e7 99 bd e7 88 9b e8 b2 93 22 0d 0a 7d>
    // console.log(chunk);
    body+=chunk;
  })

  // * 如果路由是以 / 開頭,就交給 express 處理
  // * 純粹測試 morgan 用 ,實際上不會這樣寫
  if (req.url.startsWith('/')) {
    app(req, res); // 交給 Express
    return;
  }

  // GET
  if(req.url=="/todos" && req.method == "GET"){
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": todos,
    }));
    res.end();
  }
  // POST
  else if(req.url=="/todos" && req.method == "POST"){
    // res.writeHead(200,headers);
    // res.write(JSON.stringify({
    //     "status": "success",
    //     "data": todos,
    // }));
    // res.end();

    req.on('end',()=>{
      // ~判斷是否為JSON格式,有錯誤就丟出近catch
      try{
        const title = JSON.parse(body).title;
        // ~判斷title是否有值,有錯誤就丟出近catch
        if (!title) throw new Error("title required");
        
        const todo = {
          "title": title,
          "id": randomUUID()
        };
        todos.push(todo);
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
      }
      catch(error){
        errHandle(error, req, res);
      }
    })
  }
  // DELETE all
  else if(req.url=="/todos" && req.method == "DELETE"){
    todos.length = 0; // 清空陣列
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": todos,
    }));
    res.end();
  }
  // DELETE /todos/123123-123123-123123
  else if(req.url.includes("/todos/") && req.method == "DELETE"){
    const id = req.url.split("/").pop(); // ['', 'todos', 'id']
    const index = todos.findIndex(item=>item.id===id);
    if(index===-1){
      const error = new Error("id not found");
      return errHandle(error, req, res);
    }
    todos.splice(index,1);
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": todos,
    }));
    res.end();
  }
  // PATCH /todos/123123-123123-123123
  else if(req.url.includes("/todos/") && req.method == "PATCH"){
    const id = req.url.split("/").pop(); // ['', 'todos', 'id']
    const index = todos.findIndex(item=>item.id===id);
    if(index===-1){
      const error = new Error("id not found");
      return errHandle(error, req, res);
    }

    req.on('end',()=>{
      try{
        const newTitle = JSON.parse(body).title;
        // ~判斷title是否有值,有錯誤就丟出近catch
        if (!newTitle) throw new Error("title required");

        todos[index].title = newTitle;
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
      }
      catch(error){
        errHandle(error, req, res);
      }
    })
  }
  // 預檢請求,使用特定的 HTTP 方法：如 PUT、PATCH、DELETE 或自定義的標頭時，
  // 瀏覽器會先發送一個 OPTIONS 請求，以確定伺服器是否允許該實際請求。
  // 不通過 就CORS錯誤
  else if(req.method == "OPTIONS"){
    res.writeHead(200,headers);
    res.end();
  }
  // 其他路由處理
  else{
    res.writeHead(404,headers);
    res.write(JSON.stringify({
        "status": "false",
        "message": "無此網站路由"
    }));
    res.end();
  }
}
const server = http.createServer(requestListener);
// server.listen(1223);
server.listen(process.env.PORT || 8080);

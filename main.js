var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib.js');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url; //url 을 불러 _url이라는 변수에 입력.
    var queryData = url.parse(_url, true).query; // 쿼리데이터를 불러오는 코드.객체 형식으로
    var pathname = url.parse(_url, true).pathname;//pathname을 불러온다.
    var title = queryData.id // queryData = {id : CSS}=> queryData.id를 입력하면 CSS라는 값이 나옴.

    if(pathname === '/'){
        if(queryData.id === undefined){ // queryData.id 가 없을 때, localhost:3000/ => 메인화면.
                fs.readdir('./data',function(err, filelist){ //filelist 를 읽어오는 코드 filelist가 리스트 형식으로 나온다.
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist); //  filelist를 읽어 온 뒤 ul리스트로 만든 것
                var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>
                <form action="delete_process" method = "post">
                <input type="hidden" name = "id" value="${title}">
                <input type="submit" value="delete">
                </form>`) //template을 실행시킨다. templateHTML은 본문을 담은 함수.
                response.writeHead(200);  //if url이 뭐가 나오면 이걸 실행시킨다 뭔지 모름
                response.end(html);
                })
                
        } else{
            fs.readdir('./data',function(err, filelist){ //filelist 를 읽어오는 코드 filelist가 리스트 형식으로 나온다.
                var filterdID = path.parse(queryData.id).base;
                fs.readFile(`data/${filterdID}`, (err, description) => {
                    if (err) throw err;
                    var title = queryData.id
                    var sanitizedTilte = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description);
                    var list = template.list(filelist); //  filelist를 읽어 온 뒤 ul리스트로 만든 것
                    var html = template.HTML(sanitizedTilte, list, `<h2>${sanitizedTilte}</h2>${sanitizedTilte}`,
                     `<a href="/create">create</a>
                      <a href = "/update?id=${sanitizedTilte}">update</a>
                      <form action="delete_process" method = "post">
                        <input type="hidden" name = "id" value="${sanitizedTilte}">
                        <input type="submit" value="delete">
                      </form>
                      `) //template을 실행시킨다.
                    response.writeHead(200);  //if url이 뭐가 나오면 이걸 실행시킨다 뭔지 모름
                    response.end(html);
                  });
            });
        }
    } else if(pathname === '/create'){
        fs.readdir('./data',function(err, filelist){ //filelist 를 읽어오는 코드 filelist가 리스트 형식으로 나온다.
            var title = 'WEB - create';
            var list = template.list(filelist); //  filelist를 읽어 온 뒤 ul리스트로 만든 것
            var html = template.HTML(title, list, `
            <form action="/create_process" method = "post"> 
            <p><input type="text" name="title" placeholder = "title"></p>
            <p>
                <textarea name="description" placeholder = "description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>`, '') //template을 실행시킨다. templateHTML은 본문을 담은 함수.
            response.writeHead(200);  //if url이 뭐가 나오면 이걸 실행시킨다 뭔지 모름
            response.end(html);
            });
    } else if(pathname === '/create_process'){
        var body = '';
        request.on('data',function(data){
            body = body + data;
        });
        request.on('end',function(){
            var post = qs.parse(body); //post가 객체형식으로 나옴 input함수에 따라서 {title : dddd, description : dddd}
            var title = post.title;    //윗줄에 따라서 title과 description의 값을 받아와줌.
            var description = post.description;  // ''
            fs.writeFile(`./data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location : `/?id=${title}`}); //  post를 한 후 ex) localhost:3000/?id=css 로 페이지 이동;
                response.end();
            });
        });

    } else if(pathname === '/update'){
        fs.readdir('./data',function(err, filelist){ //filelist 를 읽어오는 코드 filelist가 리스트 형식으로 나온다.
            var filterdID = path.parse(queryData.id).base //path 모듈 사용 뒤 .base라는 걸 사용 => queryData.id가 본연의 값만 가지게된다. 해킹방지
            fs.readFile(`data/${filterdID}`, (err, description) => {
                if (err) throw err;
                var title = queryData.id
                var list = template.list(filelist); //  filelist를 읽어 온 뒤 ul리스트로 만든 것
                var html = template.HTML(title, list,
                `
                <form action="/update_process" method = "post"> 
                <input type="hidden" name = "id" value ="${title}">
                <p><input type="text" name="title" value =${title}></p>
                <p>
                <textarea name="description">${description}</textarea>
                </p>
                <p>
                <input type="submit">
                </p>
                </form>
                `,'') //template을 실행시킨다.
                response.writeHead(200);  //if url이 뭐가 나오면 이걸 실행시킨다 뭔지 모름
                response.end(html);
              });
        });
    } else if(pathname === '/update_process'){ // /update 에서 submit을 한 후에 띄우는 창
        var body = '';
        request.on('data',function(data){
            body = body + data;
        });
        request.on('end',function(){
            var post = qs.parse(body); 
            var id = post.id; //포스트 객체 안에 id, title, description의 값을 불러온다
            var title = post.title;    
            var description = post.description;  
            fs.rename(`./data/${id}`, `./data/${title}`, function(err){ //파일 이름을 바꾸는 함수. update에서 id 값을 고정시키기 위해 hidden으로 받았고 새로 바꾼 제목 title가 id를 대체
                fs.writeFile(`./data/${title}`, description, 'utf8', function(err){
                    response.writeHead(302, {Location : `/?id=${title}`});
                    response.end();
                });
            })

        });
    } else if(pathname === '/delete_process'){ // /update 에서 submit을 한 후에 띄우는 창
        var body = '';
        request.on('data',function(data){
            body = body + data;
        });
        request.on('end',function(){
            var post = qs.parse(body); 
            var id = post.id; //포스트 객체 안에 id, title, description의 값을 불러온다
            var filterdID = path.parse(id).base
            fs.unlink(`./data/${filterdID}`, (err) => {
                if (err) throw err;
                    response.writeHead(302, {Location : `/`});
                    response.end();
              });
        });
    } else{
        response.writeHead(404);
            response.end('Not Found');
    }
});
app.listen(3000);
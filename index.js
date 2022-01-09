const http = require("http");
const url = require("url");
const fs = require("fs");
const game = require("./game.js");
const ranking = require("./ranking.js");
const register = require("./auth.js");
const responses = require("./responses.js");

// Debug
const port = 8008;

// Final 
// const port = 9030;

function processPath(path, request, response)
{
    const filePath =  "wwwroot" + (path === "/" ? "index.html" : path); //join("wwwroot", path === "/" ? "index.html" : path);
    if (fs.existsSync(filePath))
    {
        console.log(filePath);
        fs.createReadStream(filePath).pipe(response);
        return;
    }

    switch (path)
    {
        case "/join":
        game.join(request, response);
        break;
        case "/leave":
        game.leave(request, response);
        break;
        case "/notify":
        game.notify(request, response);
        break;
        case "/ranking":
        ranking.get(request, response);
        break;
        case "/register":
        register(request, response);
        break;
        case "/update":
        game.registerForUpdates(request, response);
        break;
        default:
        responses.notFoundErrorResponse(response, "unknown " + request.method + " request.");
    }
}

http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;
    
    processPath(path, request, response);

}).listen(port);

const http = require("http");
const url = require("url");
const fs = require("fs");
const crypto = require("crypto");
const GameState = require("./wwwroot/GameState.js");
const { join } = require("path");

const header = {
    'Access-Control-Allow-Origin': '*' 
    // "Access-Control-Allow-Methods": "POST" 
};

function InternalErrorResponse(response, message)
{
    response.writeHead(500, header);
    response.end(JSON.stringify({error: message}));
}

function unauthorizedErrorResponse(response, message)
{
    response.writeHead(401, header);
    response.end(JSON.stringify({error: message}));
}

function okResponse(response)
{
    response.writeHead(200, header);
    response.end();
}

function updateRankings(playerOne, playerTwo, winner)
{
    fs.readFile("rankings.json", (e, rankingsData) => {
        if (e)
        {
            InternalErrorResponse(response);
            return;
        }

        const rankings = JSON.parse(rankingsData);

        if (winner !== null)
        {
            rankings[winner]++;
        }

        if (rankings)

        fs.writeFile()
    });
}

function register(request, response)
{
    if (request.method !== "POST") return;

    let body = "";
    let user;

    request
        .on("data", (data) => body += data)
        .on("end", () => {
            try 
            {
                user = JSON.parse(body);

                if (user.name == null || user.password == null || user.name == "" || user.password == "")
                {
                    InternalErrorResponse(response);
                }

                user.password = crypto.createHash("sha256").update(user.password).digest("hex");

                fs.readFile("credentials.json", (e, data) => {
                    if (e) 
                    {
                        InternalErrorResponse(response);
                        return;
                    }

                    const users = JSON.parse(data);

                    if (users[user.name] !== undefined)
                    {
                        if (users[user.name] === user.password)
                        {
                            okResponse(response);
                        }
                        else
                        {
                            unauthorizedErrorResponse(response);
                        }
                        return;
                    }
                    else
                    {
                        users[user.name] = user.password;
                        fs.writeFile("credentials.json", JSON.stringify(users), (e) => {
                            if (e) 
                            {
                                InternalErrorResponse(response);
                                return;
                            }
            
                            okResponse(response);
                        })
                    }
                });
            }
            catch (e)
            {
                console.log(e);
                InternalErrorResponse(response);
            }
        });
}

function notify(request, response)
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            let play = JSON.parse(body);
            const [id, user, pos] = [play.id, play.user, play.pos];

            user.password = crypto.createHash("sha256").update(user.password).digest("hex");

            fs.readFile("credentials.json", (e, data) => {
                if (e) 
                {
                    InternalErrorResponse(response);
                    return;
                }

                const users = JSON.parse(data);

                if (users[user.name] !== undefined && users[user.name] === user.password)
                {     
                    fs.readFile("games.json", (e, data) => {
                        if (e) 
                        {
                            InternalErrorResponse(response);
                            return;    
                        }

                        const gamesData = JSON.parse(data);
                        const stateData = gamesData[id];

                        const gameState = new GameState(_, _, stateData.player, stateData.state);
                        
                        if ((gameState.player && (user.name === stateData.playerOne)) || (!gameState.player && (user.name === stateData.playerTwo)))
                        {
                            gameState.play(pos);
                            console.log(gameState.state);
                            [gamesData[id].state, gamesData.player] = [gameState.state, gameState.player];

                            fs.writeFile("games.json", JSON.stringify(gamesData), (e) => {
                                if(e) 
                                {
                                    InternalErrorResponse(response)
                                    return;
                                } 
                                
                                if (gameState.isFinal())
                                {
                                    const score = this.state.getScore();
                                    const [winner, loser] = score > 0 ? true : (score < 0 ? false : null)

                                    updateRankings(playerOne, playerTwo, winner);
                                }

                                okResponse(response);
                            });
                        }
                        else
                        {
                            InternalErrorResponse(response)
                        }
                    });
                }
                else
                {        
                    unauthorizedErrorResponse(response)
                }
            });
        }
        catch (e)
        {               
            console.log(e);             
            InternalErrorResponse(response);
        }
    });
}

function leave(request, response)
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            let play = JSON.parse(body);
            const [id, user, pos] = [play.id, play.user, play.pos];

            user.password = crypto.createHash("sha256").update(user.password).digest("hex");

            fs.readFile("credentials.json", (e, data) => {
                if (e) 
                {
                    InternalErrorResponse(response);
                    return;
                }

                const users = JSON.parse(data);

                if (users[user.name] !== undefined && users[user.name] === user.password)
                {
                    // user is defeated
                }
            });
        }
        catch (e)
        {
            console.log(e);
            InternalErrorResponse(response);
        }
    });
}

function processPath(path, request, response)
{
    const filePath = join("wwwroot", path === "/" ? "index.html" : path);
    if (fs.existsSync(filePath))
    {
        console.log(filePath);
        fs.createReadStream(filePath).pipe(response);
        return;
    }

    switch (path)
    {
        case "/join":
            join(request, response);
            break;
        case "/leave":
            leave(request, response);
            break;
        case "/notify":
            notify(request, response);
            break;
        case "/ranking":
            ranking(response);
            break;
        case "/register":
            register(request, response);
            break;
        default:
            response.writeHead(501, header);
            response.end();
    }
}

http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;

    processPath(path, request, response);

}).listen(8008);
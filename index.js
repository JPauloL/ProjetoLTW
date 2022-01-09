const http = require("http");
const url = require("url");
const fs = require("fs");
const FileManager = require("./FileManager.js");
const updater = require("./updater.js");
const GameState = require("./wwwroot/GameState.js");
const User = require("./wwwroot/User.js");
// const { join } = require("path");

// Debug
const port = 8008;

// Final 
// const port = 9030;

const playTime = 120000;

const postHeader = {
    'Access-Control-Allow-Origin': '*' 
    // "Access-Control-Allow-Methods": "POST" 
};

const SSEHeader = {    
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream'
};

// Outros erros
function InternalErrorResponse(response, message)
{
    response.writeHead(500, postHeader);
    response.end(JSON.stringify({error: message}));
}

// Recurso não encontrado
function notFoundErrorResponse(response, message)
{
    response.writeHead(404, postHeader);
    response.end(JSON.stringify({error: message}));
}

// Pedido não autorizado
function unauthorizedErrorResponse(response, message)
{
    response.writeHead(401, postHeader);
    response.end(JSON.stringify({error: message}));
}

// Validação de argumentos
function validateRequestErrorResponse(response, message)
{
    response.writeHead(400, postHeader);
    response.end(JSON.stringify({error: message}))
}

// Pedido bem sucedido
function okResponse(response, message)
{
    const m = message ?? {};

    response.writeHead(200, postHeader);
    response.end(JSON.stringify(m));
}

function endGame(game, winner)
{
    updater.update(game, { winner: winner });
    FileManager.deleteGame(game);
}

function leave(request, response)
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            let data = JSON.parse(body);
            
            FileManager.getUser(new User(data.nick, data.password))
            .then(() => {
                FileManager.getGame(data.game)
                .then(({ board }) => {
                    const players = Object.keys(board.sides);
                    
                    const winner = players.length == 1 ? null : (players[0] === data.nick ? players[1] : players[0]);
                    endGame(data.game, winner);

                    okResponse(response);
                })
                .catch((e) => e == undefined ? 
                unauthorizedErrorResponse(response, "User isn't authenticated.") :
                validateRequestErrorResponse(response, "Game doesn't exist"));
            });
        }
        catch (e)
        {
            console.log(e);
            InternalErrorResponse(response);
        }
    });
}

function registerForUpdates(request, response)
{
    const query = url.parse(request.url, true).query;
    const game = query.game;

    updater.remember(game, response);

    request
    .on("close", () => {
        updater.forget(response)
    });

    response.writeHead(200, SSEHeader);

    FileManager.getGame(game)
    .then(({ board }) => {
        if (Object.keys(board.sides).length === 2)
        {
            updater.update(query.game, { board: board })
        }
    })
    .catch()
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

function ranking(request, response)
{
    FileManager.getRanking()
    .then((rank) => okResponse(response, { ranking: rank }))
    .catch(InternalErrorResponse(response, "Couldn't get rankings."));
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
                const { nick, password } = JSON.parse(body);
                user = new User(nick, password);
                
                if (user.nick == null || user.password == null || user.nick == "" || user.nick.length > 20 || user.password == "")
                {
                    validateRequestErrorResponse(response, "Wrong nick/password.");
                }

                FileManager.getUser(user)
                .then(() => okResponse(response))
                .catch(console.log)
                .catch(() => unauthorizedErrorResponse(response));
            }
            catch (e)
            {
                console.log(e);
                InternalErrorResponse(response);
            }
        });
}

function join (request, response)
{
    let body = "";

    request
    .on("data", (data) => body += data)
    .on("end", () => {
        try 
        {
            const { nick, password, size, initial } = JSON.parse(body);
            const user = new User(nick, password);

            if (size < 1 || size > 9 || initial < 1 || initial > 6)
            {
                validateRequestErrorResponse(response, "Invalid arguments.")
            }

            FileManager.getUser(user)
            .then(() => {
                FileManager.registerForGame(user, size, initial)
                .then(({ game }) => {
                    okResponse(response, { game: game.id });
                })
                .catch(() => InternalErrorResponse(response));
            })
            .catch(() => unauthorizedErrorResponse(response));
            
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
            const [gameId, nick, password, pos] = [play.game, play.nick, play.password, play.move + 1];

            const user = new User(nick, password);

            FileManager.getUser(user)
            .then(() => {
                FileManager.getGame(gameId)
                .then((game) => {
                    if (user.nick !== game.board.turn)
                    {
                        validateRequestErrorResponse(response, "Not your turn to play.");
                        return;
                    }
                    const [playerOne, playerTwo] = Object.keys(game.board.sides);
                    const gameState = new GameState(null, null, game.board.turn === playerOne, GameState.buildState(game.board.sides[playerOne], game.board.sides[playerTwo]));

                    if (gameState.play(pos) < 0 )
                    {
                        validateRequestErrorResponse(response, "Invalid move.");
                        return;
                    }
                    

                    FileManager.saveGame(gameId, game, gameState, playerOne, playerTwo)
                    .then((savedGame) => {
                        
                        let res = { board: savedGame.board }

                        if (gameState.isFinal())
                        {
                            const score = gameState.getGameScore();
                            res.winner = (score > 0 ? playerOne : (score < 0 ? playerTwo : null));
                            FileManager.deleteGame(gameId);
                        }
                        
                        setTimeout(() => {
                            FileManager.getGame(gameId)
                            .then((g) => {
                                if (game.lastPlay === g.lastPlay) 
                                    endGame(gameId, playerOne === g.board.turn ? playerTwo : playerOne);
                            })
                            .catch(console.log);
                        }, playTime);

                        okResponse(response);
                        updater.update(gameId, res);
                    })
                    .catch(() => InternalErrorResponse(response));
                })
                .catch(validateRequestErrorResponse(response, "Game doesn't exist."));
            })
            .catch(() => unauthorizedErrorResponse(response, "Unauthenticated."));
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
        join(request, response);
        break;
        case "/leave":
        leave(request, response);
        break;
        case "/notify":
        notify(request, response);
        break;
        case "/ranking":
        ranking(request, response);
        break;
        case "/register":
        register(request, response);
        break;
        case "/update":
        registerForUpdates(request, response);
        break;
        default:
            response.writeHead(404, postHeader);
            response.end();
    }
}

http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const path = parsedUrl.pathname;

    processPath(path, request, response);

}).listen(port);

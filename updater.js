let clients = [];

module.exports.remember = (game, response) => {

    clients.push({
        game: game,
        response: response
    });
}

module.exports.update = (game, data) => {
    clients.filter((c) => c.game === game).forEach((c) => c.response.write("data: " + JSON.stringify(data) + "\n\n"));
}

module.exports.forget = (response) => {
    const i = clients.findIndex((c) => c.response === response)

    if (i > -1)
    {
        clients.splice(i, 1);
    }
}

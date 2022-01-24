class RequestHandler
{
    
    user;
    game;
    gameId;
    eventSource;
    isSearching;

    constructor()
    {
        this.user = null;
        this.game = null;
        this.gameId = null;
        this.eventSource = null;
        this.isSearching = false;
    }

    setUser(user)
    {
        this.user = user;
    }

    setGame(game)
    {
        this.game = game;
    }

    registerForUpdates()
    {
        this.eventSource = new EventSource(url + "update?nick=" + this.user.nick + "&game=" + this.gameId);
        this.eventSource.onmessage = (e) => this.update(e, this);
    }

    isSearchingForGame()
    {
        return this.isSearching;;
    }

    displayError(message)
    {
        if (this.game != null)
        {
            this.game.displayError(message);
        }

        console.log(message);
    }

    join(size, seeds)
    {
        const params = { nick: this.user.nick, password: this.user.password, size: size, initial: seeds };
     
        fetch(url + "join", {
                method: "POST",
                body: JSON.stringify(params)
            })
            .then((r) => r.json())
            .then(j => {
                if (j.error != undefined)
                {
                    this.displayError(j.error)
                    return;
                }

                this.isSearching = true;
                this.gameId = j.game;
                this.registerForUpdates();
            })
            .catch(console.log);
    }

    update(event, r)
    {
        const data = JSON.parse(event.data);
        this.isSearching = false;

        if (data.board !== undefined)
        {
            const gameData = data.board;
            let {sides, turn} = gameData
            let [nameOne, nameTwo] = Object.keys(sides);
            const size = sides[nameOne].pits.length;
            const seeds = sides[nameOne].pits[0];
            
            if (nameTwo === this.user.nick)
            {
                [nameTwo, nameOne] = [nameOne, nameTwo];   
            }
            
            if (this.game === null || this.game.winner !== undefined)
            {
                backDrop.classList.add("hidden");
                Array.from(backDrop.children).forEach((elem) => elem.classList.add("hidden"));
                this.setGame(new Game(nameOne, nameTwo, size, seeds, turn === nameOne, null, this));        
                return;
            }
            
            const pos = data.pit + ((!this.game.state.player * (sides[nameOne].pits.length + 1)));

            this.game.setState(GameState.buildState(sides[nameOne], sides[nameTwo]), turn === nameOne);
            this.game.play(pos, turn === nameOne);
        }

        if (data.winner !== undefined)
        {
            this.cleanGame(data.winner);
        }

        if (data.error !== undefined)
        {
            this.displayError(data.error);
        }
    }

    cleanGame(winner)
    {
        this.gameId = null;    
        this.eventSource.close();
        submitButton.innerText = "Start game";

        if (this.game != null && this.game.winner == undefined)
        {
            this.game.winner = winner === null ? null : winner === this.user.nick;
            this.game.state.finishGame();
            this.game.finish();
        }
    }

    leave()
    {
        if (this.gameId === null) return;

        const params = {game: this.gameId, nick: this.user.nick, password: this.user.password};
        fetch(url + "leave", {
                method: "POST",
                body: JSON.stringify(params)
            })
            .then((response) => response.json())
            .then(j => {
                if (j.error === undefined)
                {
                    return;
                }

                this.displayError(j.error);
            })
            .catch(() => this.displayError("Couldn't reach server."));
    }

    async notify(pos)
    {
        const params = {game: this.gameId, nick: this.user.nick, password: this.user.password, move: pos - 1};
        fetch(url + "notify", {
                method: "POST",
                body: JSON.stringify(params)
            })
            .then((r) => r.json())
            .then((j) => {
                if (j.error != undefined)
                {
                    this.displayError(j.error)
                    this.game.gameBoard.setClickableHouses(true);
                }
            })
            .catch(() => this.displayError("Couldn't reach server."));
    }

    async getRanking()
    {
        return fetch(url + "ranking", {
            method: "POST",
            body: JSON.stringify({})
        })
            .then((r) => r.json())
    }
}
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

    join(size, seeds)
    {
        const params = { nick: this.user.nick, password: this.user.password, size: size, initial: seeds };
     
        fetch(url + "join", {
                method: "POST",
                body: JSON.stringify(params)
            })
            .then((r) => r.json()
            )
            .then(j => {
                this.isSearching = true;
                this.gameId = j.game;
                this.registerForUpdates();
            })
            .catch(console.log);
    }

    getMove(oldState, newState, player)
    {
        const n = newState.length;

        for (let i = 0; i < n; i++)
        {
            if (newState[i] < oldState[i + (!player * (n + 1)) + 1])
            {
                return i + (!player * (n + 1)) + 1;
            }
        }

        return -1;
    }

    update(event, r)
    {
        const data = JSON.parse(event.data);
        this.isSearching = false;

        if (data.board !== undefined)
        {
            const gameData = data.board;
            let {sides, turn} = gameData // Mudar para const na versao final
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
            
            const old = this.game.state.state;

            const pos = (this.game.state.player ? this.getMove(old, sides[nameOne].pits, true) : this.getMove(old, sides[nameTwo].pits, false));
            // console.log(pos);

            if (pos < 0 && turn != nameOne) turn = nameOne // Retirar na versao final

            this.game.setState(GameState.buildState(sides[nameOne], sides[nameTwo]), turn === nameOne);
            this.game.play(pos, turn === nameOne);
            console.log(GameState.buildState(sides[nameOne], sides[nameTwo]));
        }

        if (data.winner !== undefined)
        {
            this.cleanGame(data.winner);
        }

        if (data.error)
        {
            console.log(error);
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

    // parece ok
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
                if (j.error !== undefined)
                {
                    console.log(j.error);
                    return;
                }
            })
            .catch(console.log);
    }

    async notify(pos)
    {
        const params = {game: this.gameId, nick: this.user.nick, password: this.user.password, move: pos - 1};
        fetch(url + "notify", {
                method: "POST",
                body: JSON.stringify(params)
            })
            .catch(console.log);
    }
}
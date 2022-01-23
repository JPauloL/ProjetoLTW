class GameBoard
{
    gameBoard;
    houses;
    canvas;
    gc;
    canvasContext;

    constructor(s, seeds, game)
    {
        this.gameBoard = document.createElement("game-board");
        this.gameBoard.id = "game-board";
        const housesDiv = this.createHouses(s, seeds, game);
                
        this.gameBoard.appendChild(this.houses[0].render());
        this.gameBoard.appendChild(housesDiv);
        this.gameBoard.appendChild(this.houses[this.houses.length / 2].render());
        
        this.canvas = document.createElement("canvas");
        this.canvas.id = "canvas";
        this.gameBoard.appendChild(this.canvas);
    }

    setClickableHouses(b)
    {
        for (let i = 1; !this.houses[i].bank; i++)
        {
            this.houses[i].setClickable(b);
        }
    }
    
    setHousesPosition()
    {
        this.houses.forEach(h => h.setPosition())
    }

    createHouses(s, seeds, game)
    {
        const size = s * 2 + 2;
        const housesDiv = document.createElement("houses-div");
        housesDiv.id = "houses-div";
        housesDiv.style.width = (s * 108).toString(10) + "px"; 
    
        this.houses = new Array(size);

        for (let i = 0; i < size / 2; i++)
        {
            this.houses[i] = new House(i % (size / 2) === 0, seeds);
            this.houses[i].element.addEventListener("click", () => {
                this.setClickableHouses(false);
                
                if (game.selfPlay(i) < 0 && game.state.player)
                {
                    this.setClickableHouses(true);
                }
            });
            
            if (this.houses[i].bank) continue;
         
            housesDiv.appendChild(this.houses[i].render());
        }

        for (let i = size - 1; i >= size / 2; i--)
        {
            this.houses[i] = new House(i % (size / 2) === 0, seeds);
            
            if (this.houses[i].bank) continue;
         
            housesDiv.appendChild(this.houses[i].render());
        }

        return housesDiv;
    }

    dimensionCanvas()
    {
        const boardStyle = getComputedStyle(this.gameBoard);
        this.canvas.width = parseInt(boardStyle.width);
        this.canvas.height = parseInt(boardStyle.height);
        this.gc = canvas.getContext("2d");
    }

    transferSeed(source, target)
    {
        if (source.seeds.length === 0) return -1;

        const seed = source.seeds.pop();
        const newPos = target.newSeedPosition();

        requestAnimationFrame((t) => this.playSeedAnimation(seed, seed.x, seed.y, newPos.x, newPos.y, t, t));
        target.seeds.push(seed);

        return 0;
    }

    playSeedAnimation(seed, x, y, targetX, targetY, start, time)
    {
        const animTime = 500;
        const delta = (time - start) / animTime;

        if (delta >= 1)
        {
            seed.update(targetX, targetY);
            this.renderSeeds();
            return;
        }

        seed.update(x + ((targetX - x) * (delta * delta)), y + ((targetY - y) * delta));
        this.renderSeeds();

        requestAnimationFrame((t) => this.playSeedAnimation(seed, x, y, targetX, targetY, start, t));
    }

    renderSeeds()
    {
        this.dimensionCanvas();
        this.houses.forEach(h => h.renderSeeds(this.gc));
    }

    displaySeeds()
    {
        this.setHousesPosition();
        this.renderSeeds();
    }

    isPlayerSide(playerBank, pos)
    {
        return playerBank !== 0 ? pos < playerBank : pos > this.houses.length / 2;
    }

    play(pos)
    {        
        const playerBank = pos < this.houses.length / 2 ? this.houses.length / 2 : 0;
        const source = this.houses[pos];
        let i = 1;
        let n = source.seeds.length;

        for (; i <= n; i++)
        {
            let target = this.houses[(pos + i) % this.houses.length];

            if (target.bank && (pos + i) % this.houses.length !== playerBank) 
            {
                i++;
                n++;
                target = this.houses[(pos + i) % this.houses.length];
            }

            this.transferSeed(source, target);
        }

        const lastHouse = (pos + i - 1) % this.houses.length;
       
        if (!this.houses[lastHouse].bank && this.isPlayerSide(playerBank, lastHouse) && this.houses[lastHouse].seeds.length === 1)
        {
            let target = this.houses[playerBank];
            this.transferSeed(this.houses[lastHouse], target);
            while (this.transferSeed(this.houses[this.houses.length - lastHouse], target) !== -1);
        }
    }

    finishGame(playerBank, oppoBank)
    {
        this.houses.forEach((h, i) => {
            if (h.bank) return;

            const target = i < playerBank ? this.houses[playerBank] : this.houses[oppoBank];

            while (this.transferSeed(h, target) !== -1);
        });
    }

    render(element)
    {
        return this.gameBoard;
    }
}
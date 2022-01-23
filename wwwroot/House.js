const colors = ["green", "yellow", "red", "blue"];

class House
{
    element;
    seeds;
    bank;
    x;
    y;

    constructor(bank, seeds)
    {
        this.bank = bank;
        this.element = document.createElement("span");
        this.element.classList.add(bank ? "bank" : "house");
        this.seeds = new Array(bank ? 0 : seeds);
    }

    setClickable(b)
    {
        if (b)
        {
            this.element.classList.add("clickable"); 
        }
        else
        {
           this.element.classList.remove("clickable");
        }
    }

    render()
    {
        return this.element;
    }

    setPosition()
    {
        this.x = this.element.offsetLeft + (this.element.clientWidth / 2) -7;
        this.y = this.element.offsetTop + (this.element.clientHeight / 2) - 7;
        const r = Math.floor(Math.random() * 4);

        for (let i = 0; i < this.seeds.length; i++)
        {
            const pos = this.newSeedPosition();
            this.seeds[i] = new Seed(pos.x, pos.y, colors[(i + r) % colors.length]);
        }
    }

    newSeedPosition()
    {
        const getOffset = () => (Math.random() * 50) - 25;

        return {
            x: this.x + getOffset(),
            y: this.y + getOffset()
        };
    }

    renderSeeds(gc)
    {
        this.seeds.forEach(s =>
                                s.render(gc)
            );
    }
}
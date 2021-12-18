const colors = ["green", "yellow", "red", "blue"];
// const colors = ["rgba(,0.3)","rgba(,0.3)","rgba(,0.3)","rgba(,0.3)"]
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

    update()
    {
        // this.
    }

    render()
    {
        return this.element;
    }

    setPosition()
    {
        this.x = this.element.offsetLeft + (this.element.clientWidth / 2) -7;
        this.y = this.element.offsetTop + (this.element.clientHeight / 2) - 7;

        for (let i = 0; i < this.seeds.length; i++)
        {
            const pos = this.newSeedPosition();
            this.seeds[i] = new Seed(pos.x, pos.y, colors[i % colors.length]);
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
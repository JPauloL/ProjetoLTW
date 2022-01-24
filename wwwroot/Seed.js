class Seed
{
    x;
    y;
    color;

    constructor(x, y, color)
    {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    update(x, y)
    {
        this.x = x;
        this.y = y;
    }

    render(gc)
    {
        gc.globalAlpha = 0.9;

        gc.beginPath();
        gc.fillStyle = this.color;
        gc.arc(this.x, this.y, 12, 0, 2 * Math.PI, false);
        gc.fill();
    }
}
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


    playMoveAnimation(x, y)
    {
        // this.show(gc);
        // this.alpha -= WindMill.radialVelocity;
    
        // requestAnimationFrame(this.play.bind(this));

        // while (seed.x != target.x && seed.y != target.y)
        // {
            
        // }

        // this.update(x, y);
    }

    update(x, y)
    {
        // this.playMoveAnimation(canvas, x, y);

        this.x = x;
        this.y = y;
    }

    render(gc)
    {
        // const gc = canvas.getContext("2d");
        gc.globalAlpha = 0.9;
        // gc.shadowColor = this.color;
        // gc.shadowOffsetX = 5;
        // gc.shadowOffsetY = 5;
        // gc.shadowBlur = 32;

        gc.beginPath();
        gc.fillStyle = this.color;
        gc.arc(this.x, this.y, 12, 0, 2 * Math.PI, false);
        gc.fill();
    }
}
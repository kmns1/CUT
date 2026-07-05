import {
    Cut
} from './cut.js';

class App {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)

        window.addEventListener('resize', this.resize.bind(this))
        this.resize()

        this.cut = new Cut(300, 300)
        this.cut.polygone(this.stageWidth, this.stageHeight)

        requestAnimationFrame(this.animate.bind(this));
    }

    resize() {
        this.stageWidth = document.body.clientWidth
        this.stageHeight = document.body.clientHeight
        this.canvas.width = this.stageWidth * 2;
        this.canvas.height = this.stageHeight * 2;

        if (this.cut) {
            this.cut.polygone(this.stageWidth, this.stageHeight);
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(2, 2);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight)
        this.cut.draw(this.ctx)
        requestAnimationFrame(this.animate.bind(this));
    }
}

window.onload = () => {
    new App()
}
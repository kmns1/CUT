export class Cut {
    constructor(objWidth, objHeight) {
        this.objWidth = objWidth
        this.objHeight = objHeight
        this.move()
        this.cutLine()
    }

    polygone(stageWidth, stageHeight) {
        this.widthCenter = stageWidth / 2
        this.heightCenter = stageHeight / 2

        this.polygons = [{
            points: [
                { x: this.widthCenter - this.objWidth / 2, y: this.heightCenter - this.objHeight / 2 },
                { x: this.widthCenter + this.objWidth / 2, y: this.heightCenter - this.objHeight / 2 },
                { x: this.widthCenter + this.objWidth / 2, y: this.heightCenter + this.objHeight / 2 },
                { x: this.widthCenter - this.objWidth / 2, y: this.heightCenter + this.objHeight / 2 }
            ]
        }]
    }

    rayCasting(x, y) {
        this.count = 0
        for (let i = 0; i < this.polygons.length; i++) {
            let count = 0;
            const polygon = this.polygons[i];
            const points = polygon.points
            for (let i = 0; i < points.length; i++) {

                const current = points[i];
                const next = points[(i + 1) % points.length];

                if ((current.y > y) !== (next.y > y)) {

                    const dy = next.y - current.y;
                    const dx = next.x - current.x;

                    const t =
                        (y - current.y) / dy;
                    const intersectX =
                        current.x + dx * t;

                    if (intersectX > x) {
                        this.count++;
                    }
                }
            }
            if (this.count % 2 === 1) {
                return i
            }
        }
        return -1
    }

    move() {
        let moveEnabled = false
        let moveObj
        let startX = 0
        let startY = 0
        window.addEventListener('pointerdown', e => {
            const index = this.rayCasting(e.offsetX, e.offsetY);
            if (index != -1) {
                console.log("AA")
                moveEnabled = true
                moveObj = index
                startX = e.offsetX
                startY = e.offsetY
            } else if (index == -1) {
                this.drawLine = true
                this.line.start.x = e.offsetX
                this.line.start.y = e.offsetY
                this.line.end.x = e.offsetX
                this.line.end.y = e.offsetY

            }
        })

        window.addEventListener('pointerup', () => {
            moveEnabled = false
            moveObj = null


            for (let i = 0; i < this.polygons.length; i++) {
                const poly1 = [];
                const poly2 = [];

                const intersections = [];
                const polygon = this.polygons[i];
                const points = polygon.points

                for (let i = 0; i < points.length; i++) {
                    const current = points[i];
                    const next = points[(i + 1) % points.length];

                    const hit = this.intersection(
                        this.line.start,
                        this.line.end,
                        current,
                        next
                    );

                    if (hit) {
                        intersections.push({
                            point: {
                                x: hit.x,
                                y: hit.y
                            },
                            edgeIndex: i,
                            t: hit.t
                        });
                    }
                }
                if (intersections.length !== 2) {
                    continue;
                }

                for (let i = intersections.length - 1; i >= 0; i--) {
                    const hit = intersections[i]

                    points.splice(hit.edgeIndex + 1, 0, hit.point)
                }

                let firstIndex = -1;
                let secondIndex = -1;

                for (let i = 0; i < points.length; i++) {
                    if (
                        points[i].x == intersections[0].point.x &&
                        points[i].y == intersections[0].point.y
                    ) {
                        firstIndex = i;
                    }

                    if (
                        points[i].x == intersections[1].point.x &&
                        points[i].y == intersections[1].point.y
                    ) {
                        secondIndex = i;
                    }
                }

                let c = firstIndex;

                while (true) {

                    poly1.push({
                        x: points[c].x,
                        y: points[c].y
                    });
                    
                    if (c === secondIndex) break;

                    c = (c + 1) % points.length;
                }

                let j = secondIndex;

                while (true) {

                    poly2.push({
                        x: points[j].x,
                        y: points[j].y
                    });

                    if (j === firstIndex) break;

                    j = (j + 1) % points.length;
                }
                this.polygons.splice(i, 1);

                this.polygons.push({
                    points: poly1
                });

                this.polygons.push({
                    points: poly2
                });
                break;
            }
        })

        window.addEventListener('pointermove', e => {
            if (moveEnabled === false) return
            const polygon = this.polygons[moveObj].points
            const dx = e.offsetX - startX;
            const dy = e.offsetY - startY;
            for (let i = 0; i < polygon.length; i++) {
                polygon[i].x += dx
                polygon[i].y += dy
            }
            startX = e.offsetX
            startY = e.offsetY
        })
    }

    cutLine() {
        this.line = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        }
        this.drawLine = false

        window.addEventListener('pointermove', e => {
            if (this.drawLine === false) return
            this.line.end.x = e.offsetX
            this.line.end.y = e.offsetY
        })
        window.addEventListener('pointerup', () => {
            this.drawLine = false
            this.line = {
                start: { x: 0, y: 0 },
                end: { x: 0, y: 0 }
            }
        })
    }

    intersection(line1Start, line1End, line2Start, line2End) {

        const dx1 = line1End.x - line1Start.x;
        const dy1 = line1End.y - line1Start.y;

        const dx2 = line2End.x - line2Start.x;
        const dy2 = line2End.y - line2Start.y;

        const denominator = dx1 * dy2 - dy1 * dx2;

        if (denominator === 0) {
            return null;
        }

        const ex = line2Start.x - line1Start.x;
        const ey = line2Start.y - line1Start.y;

        const t =
            (ex * dy2 - ey * dx2) /
            denominator;

        const u =
            (ex * dy1 - ey * dx1) /
            denominator;

        if (t < 0 || t > 1 || u < 0 || u > 1) {
            return null;
        }

        return {
            x: line1Start.x + dx1 * t,
            y: line1Start.y + dy1 * t,
            t,
            u
        };
    }

    draw(ctx) {
        this.ctx = ctx
        for (const polygon of this.polygons) {
            const points = polygon.points

            this.ctx.beginPath();
            this.ctx.fillStyle = "#0e0f37";
            this.ctx.moveTo(points[0].x, points[0].y)

            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y)
            }

            this.ctx.closePath()
            this.ctx.fill()
        }

        this.ctx.beginPath()
        this.ctx.strokeStyle = "red";
        this.ctx.moveTo(this.line.start.x, this.line.start.y)
        this.ctx.lineTo(this.line.end.x, this.line.end.y)
        this.ctx.stroke()
    }
}
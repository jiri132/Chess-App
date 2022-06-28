//#region Classes
class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static One(): Vec2 {
        return new Vec2(1, 1);
    }
    static mOne(): Vec2 {
        return new Vec2(-1, -1);
    }
    static Left(): Vec2 {
        return new Vec2(-1, 0);
    }
    static Right(): Vec2 {
        return new Vec2(1, 0);
    }
    static Up(): Vec2 {
        return new Vec2(0, -1);
    }
    static Down(): Vec2 {
        return new Vec2(0, 1);
    }
    static multiplie(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    static divide(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    }
    static add(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static subtract(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    static compare(v1: Vec2, v2: Vec2): boolean {
        if (v1.x == v2.x && v1.y == v2.y) {
            return true;
        } else {
            return false;
        }
    }
}

enum pieceType {
    Pawn,
    Bisshop,
    Knight,
    Tower,
    Queen,
    King
}
enum movementType {
    Forward,
    Around,
    Cross,
    Plus,
    CrossPlus,
    Lshape

}

class Drawer {
    canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;


    Scale: number;
    XY;
    constructor(Scale: number, XY_: Vec2) {
        this.Scale = Scale;
        //this.XY = <Vec2>{ ...XY } ;
        this.XY = XY_;
        let canvas = document.getElementById('canvas') as
            HTMLCanvasElement;
        let context = canvas.getContext("2d");

        this.canvas = canvas;
        this.context = context!;

        ctx = context!;

        this.createUserEvents();
        this.redraw();
    }



    private createUserEvents() {
        let canvas = this.canvas;

        canvas.addEventListener("mousedown", this.pressEventHandler);
        canvas.addEventListener("mousemove", this.dragEventHandler);
        canvas.addEventListener("mouseup", this.releaseEventHandler);
        canvas.addEventListener("mouseout", this.cancelEventHandler);

        canvas.addEventListener("touchstart", this.pressEventHandler);
        canvas.addEventListener("touchmove", this.dragEventHandler);
        canvas.addEventListener("touchend", this.releaseEventHandler);
        canvas.addEventListener("touchcancel", this.cancelEventHandler);

        document.getElementById('clear')!
            .addEventListener("click", this.clearEventHandler);
        document.getElementById('draw')!
            .addEventListener("click", () => this.redraw());
    }

    drawImage(context: CanvasRenderingContext2D, drawing: HTMLImageElement) {
        context.drawImage(drawing, 0, 0);
    };

    getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent) {
        let rect = canvas.getBoundingClientRect();

        let y: number, x: number;

        if (event instanceof MouseEvent) {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        }

        x = Math.round(x);
        y = Math.round(y);

        x /= this.Scale;
        y /= this.Scale;

        x = Math.floor(x);
        y = Math.floor(y);

        console.log("Coordinate x: " + x,
            "Coordinate y: " + y);
        console.log(_board[y][x]);

        if (_board[y][x] == null && !hasLM) { hasLM = false; return; }


        if (hasLM) {
            for (let i = 0; i < LM.length; i++) {
                const e = LM[i];
                if (Vec2.compare(new Vec2(x, y), e)) {
                    _board[PS.position.y][PS.position.x] = null!;
                    //move
                    PS.movePiece(new Vec2(x, y));
                    if (PS.type == pieceType.Pawn) { PS.firstmove = false; }
                    _board[y][x] = PS;
                    LM = [];
                    switch (turnW) {
                        case true:
                            turnW = false;
                            break;
                        case false:
                            turnW = true;
                        default:
                            break;
                    }
                    this.redraw();
                    return;
                }
            }
        }

        //catch guard if not their turn
        if (_board[y][x].black && turnW) { return; }
        else if (!_board[y][x].black && !turnW) { return; }
        
        
        LM = board.legalMoves(_board[y][x]);
        PS = _board[y][x];
        hasLM = true;
        //PS = _board[y][x];

        this.redraw();
    }

    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        this.getMousePosition(this.canvas, e);
        if (turnW) {
            document.getElementById("turn")!.textContent = "Turn: White";
        }else {
            document.getElementById("turn")!.textContent = "Turn: Black";
        }
    }

    private dragEventHandler = (e: MouseEvent | TouchEvent) => {

    }

    private clearCanvas() {
        this.context
            .clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private clearEventHandler = () => {
        this.clearCanvas();
    }

    private releaseEventHandler = () => {

    }

    private cancelEventHandler = () => {

    }


    redraw() {
        //checkerboard
        const s = this.Scale;
        this.context.fillStyle = "#000000";

        for (let y = 0; y < this.XY.y; y++) {
            for (let x = 0; x < this.XY.x; x++) {
                if (x % 2 == 0 && y % 2 == 0) {
                    this.context.clearRect(x * s, y * s, s, s);
                } else if (x % 2 == 1 && y % 2 == 1) {
                    this.context.clearRect(x * s, y * s, s, s);
                } else { this.context.fillRect(x * s, y * s, s, s) }
            }
        }
        //draw pieces
        for (let y = 0; y < _board.length; y++) {
            for (let x = 0; x < _board.length; x++) {
                const e = _board[y][x];
                if (e == null) {
                    continue;
                }

                let drawing = new Image();

                if (e.black) {
                    switch (e.type) {
                        case pieceType.Pawn:
                            drawing.src = "src/pawn1.png";
                            break;
                        case pieceType.Bisshop:
                            drawing.src = "src/bishop1.png";
                            break;
                        case pieceType.Tower:
                            drawing.src = "src/rook1.png";
                            break;
                        case pieceType.Knight:
                            drawing.src = "src/knight1.png";
                            break;
                        case pieceType.King:
                            drawing.src = "src/king1.png";
                            break;
                        case pieceType.Queen:
                            drawing.src = "src/queen1.png";
                            break;
                    }
                } else if (!e.black) {
                    switch (e.type) {
                        case pieceType.Pawn:
                            drawing.src = "src/pawn.png";
                            break;
                        case pieceType.Bisshop:
                            drawing.src = "src/bishop.png";
                            break;
                        case pieceType.Tower:
                            drawing.src = "src/rook.png";
                            break;
                        case pieceType.Knight:
                            drawing.src = "src/knight.png";
                            break;
                        case pieceType.King:
                            drawing.src = "src/king.png";
                            break;
                        case pieceType.Queen:
                            drawing.src = "src/queen.png";
                            break;
                    }
                }
                drawing.onload = function () {
                    ctx.drawImage(drawing, e.position.x * s + s / 5, e.position.y * s + s / 5);
                }
            }
        }
        //draw the LegalMoves
        if (LM == null) { return; }
        for (let lm = 0; lm < LM.length; lm++) {
            const e = LM[lm];
            this.context.fillStyle = "#FF9999AA";
            this.context.beginPath();
            this.context.arc(e.x * s + s / 2, e.y * s + s / 2, s / 3, 0, 2 * Math.PI);
            this.context.fill();
        }
    }

}

class Board {

    assignPos(P: Piece[]) {
        let bottom = false;
        //white
        if (P[0].type == pieceType.Pawn) {
            bottom = true;
        }//black
        else {
            bottom = false;
        }

        for (let p = 0; p < P.length; p++) {
            const element = P[p];
            if (bottom) {
                if (p < 8) {
                    element.position = new Vec2(p, 6);
                } else {
                    element.position = new Vec2(p - 8, 7);
                }
            } else {
                if (p < 8) {
                    element.position = new Vec2(p, 0);
                } else {
                    element.position = new Vec2(p - 8, 1);
                }
            }
        }
    }

    allV: Vec2[] = [];


    legalMoves(P: Piece): Vec2[] {
        this.allV = [];

        switch (P.type) {
            case pieceType.Pawn:
                if (P.black) {
                    if (P.firstmove) {
                        this.allV.push(new Vec2(P.position.x, P.position.y + 1));
                        this.allV.push(new Vec2(P.position.x, P.position.y + 2));
                    }
                    if (_board[P.position.y +1 ][P.position.x] == null) {
                        this.allV.push(new Vec2(P.position.x, P.position.y + 1));
                    }
                    
                    if (_board[P.position.y +1][P.position.x -1] != null && P.black != _board[P.position.y +1][P.position.x -1].black) {
                        this.allV.push(new Vec2(P.position.x -1, P.position.y + 1));
                    }
                    if (_board[P.position.y +1][P.position.x +1] != null  && P.black != _board[P.position.y +1][P.position.x +1].black) {
                        this.allV.push(new Vec2(P.position.x +1, P.position.y + 1));
                    }
                } else {
                    if (P.firstmove) {
                        this.allV.push(new Vec2(P.position.x, P.position.y - 1));
                        this.allV.push(new Vec2(P.position.x, P.position.y - 2));
                    }
                    if (_board[P.position.y -1 ][P.position.x] == null) {
                        this.allV.push(new Vec2(P.position.x, P.position.y - 1));
                    } 

                    if (_board[P.position.y -1][P.position.x -1] != null && P.black != _board[P.position.y -1][P.position.x -1].black) {
                        this.allV.push(new Vec2(P.position.x -1, P.position.y - 1));
                    }
                    if (_board[P.position.y -1][P.position.x +1] != null && P.black != _board[P.position.y -1][P.position.x +1].black) {
                        this.allV.push(new Vec2(P.position.x +1, P.position.y - 1));
                    }
                    
                }
                break;      
            case pieceType.Bisshop:
                this.BishopLM(P);
                break;
            case pieceType.Knight:

                this.KnightLM(P);
                break;
            case pieceType.Tower:
                this.RookLM(P);
                break;
            case pieceType.Queen:
                this.RookLM(P);
                this.BishopLM(P);
                break;
            case pieceType.King:
                this.KingLM(P);
                break;

            default:
                console.log(`PiecetType not found! \n Err404 ~P : pieceType in ${P}`);
                return [];
        }
        

        return this.allV;
    }

    private KingLM(P:Piece) {
        let a : Vec2[] = []
        a.push(new Vec2(P.position.x-1, P.position.y - 1)); a.push(new Vec2(P.position.x, P.position.y - 1)); a.push(new Vec2(P.position.x + 1, P.position.y - 1));
        a.push(new Vec2(P.position.x-1, P.position.y));                                                       a.push(new Vec2(P.position.x + 1, P.position.y));
        a.push(new Vec2(P.position.x-1, P.position.y + 1)); a.push(new Vec2(P.position.x, P.position.y - 1)); a.push(new Vec2(P.position.x + 1, P.position.y + 1));
    

    for (let i = 0; i < a.length; i++) {
        const e = a[i];

        if (e.x >= _board.length || e.y >= _board.length || e.x < 0 || e.y < 0) { continue; }

        if (_board[e.y][e.x] != null && _board[e.y][e.x].black != P.black) {
            this.allV.push(e);
            //break;
        } else if (_board[e.y][e.x] != null && _board[e.y][e.x].black == P.black) { continue; }
        else {
            this.allV.push(e);
        }
    }
    }
    private BishopLM(P:Piece) {
//righttop ray
for (let i = 1; i < _board.length; i++) {

    if (P.position.x + i >= _board.length || P.position.y - i < 0) {
        break;
    }
    if (_board[P.position.y - i][P.position.x + i] != null && _board[P.position.y - i][P.position.x + i].black != P.black) {
        this.allV.push(new Vec2(P.position.x + i, P.position.y - i));
        break;
    } else if (_board[P.position.y - i][P.position.x + i] != null && _board[P.position.y - i][P.position.x + i].black == P.black) { break; }
    else {
        this.allV.push(new Vec2(P.position.x + i, P.position.y - i));
    }
}
//lefttop ray
for (let i = 1; i < _board.length; i++) {

    if (P.position.x - i < 0 || P.position.y - i < 0) {
        break;
    }
    if (_board[P.position.y - i][P.position.x - i] != null && _board[P.position.y - i][P.position.x - i].black != P.black) {
        this.allV.push(Vec2.subtract(P.position, new Vec2(i, i)));
        break;
    } else if (_board[P.position.y - i][P.position.x - i] != null && _board[P.position.y - i][P.position.x - i].black == P.black) { break; }
    else {
        this.allV.push(Vec2.subtract(P.position, new Vec2(i, i)));
    }
}
//leftbottom ray
for (let i = 1; i < _board.length; i++) {
    if (P.position.x - i < 0 || P.position.y + i >= _board.length) {
        break;
    }
    console.log(new Vec2(P.position.x - i, P.position.y + i));

    if (_board[P.position.y + i][P.position.x - i] != null && _board[P.position.y + i][P.position.x - i].black != P.black) {
        this.allV.push(new Vec2(P.position.x - i, P.position.y + i));
        break;
    } else if (_board[P.position.y + i][P.position.x - i] != null && _board[P.position.y + i][P.position.x - i].black == P.black) { break; }
    else {
        this.allV.push(new Vec2(P.position.x - i, P.position.y + i));
    }
}
//rightbottom ray
for (let i = 1; i < _board.length; i++) {
    if (P.position.x + i >= _board.length || P.position.y + i >= _board.length) {
        break;
    }
    if (_board[P.position.y + i][P.position.x + i] != null && _board[P.position.y + i][P.position.x + i].black != P.black) {
        this.allV.push(new Vec2(P.position.x + i, P.position.y + i));
        break;
    } else if (_board[P.position.y + i][P.position.x + i] != null && _board[P.position.y + i][P.position.x + i].black == P.black) { break; }
    else {
        this.allV.push(Vec2.add(P.position, new Vec2(i, i)));
    }
}
    }
    private KnightLM(P:Piece) {
        let V: Vec2[] = [];
        //right side
        V.push(Vec2.add(P.position, new Vec2(2, 1)));
        V.push(Vec2.add(P.position, new Vec2(2, -1)));
        //left side
        V.push(Vec2.add(P.position, new Vec2(-2, 1)));
        V.push(Vec2.add(P.position, new Vec2(-2, -1)));
        //top side
        V.push(Vec2.add(P.position, new Vec2(1, -2)));
        V.push(Vec2.add(P.position, new Vec2(-1, -2)));
        //bottom side
        V.push(Vec2.add(P.position, new Vec2(1, 2)));
        V.push(Vec2.add(P.position, new Vec2(-1, 2)));

        for (let y = 0; y < V.length; y++) {
            const e = V[y];
            console.log(e);
            if (e.x >= _board.length || e.y >= _board.length || e.x < 0 || e.y < 0) { continue; }

            if (_board[e.y][e.x] == null || _board[e.y][e.x].black != P.black) {
                this.allV.push(e);
            }
        }
    }
    private RookLM(P: Piece) {
//topline
for (let y = 1; y < _board.length; y++) {
    if (P.position.y - y < 0) {
        break;
    }
    if (_board[P.position.y - y][P.position.x] != null && _board[P.position.y - y][P.position.x].black != P.black) {
        this.allV.push(new Vec2(P.position.x, P.position.y - y));
        break;
    } else if (_board[P.position.y - y][P.position.x] != null && _board[P.position.y - y][P.position.x].black == P.black) { break; }
    else {
        this.allV.push(new Vec2(P.position.x, P.position.y - y));
    }
}
//bottomline
for (let y = 1; y < _board.length; y++) {
    if (P.position.y + y >= _board.length) {
        break;
    }
    if (_board[P.position.y + y][P.position.x] != null && _board[P.position.y + y][P.position.x].black != P.black) {
        this.allV.push(new Vec2(P.position.x, P.position.y + y));
        break;
    } else if (_board[P.position.y + y][P.position.x] != null && _board[P.position.y + y][P.position.x].black == P.black) { break; }
    else {
        this.allV.push(new Vec2(P.position.x, P.position.y + y));
    }
}
//leftline
for (let x = 1; x < _board.length; x++) {
    if (P.position.x - x < 0) {
        break;
    }
    if (_board[P.position.y][P.position.x - x] != null && _board[P.position.y][P.position.x - x].black != P.black) {
        this.allV.push(new Vec2(P.position.x - x, P.position.y));
        break;
    } else if (_board[P.position.y][P.position.x - x] != null && _board[P.position.y][P.position.x - x].black == P.black) { break; }
    else {
        this.allV.push(new Vec2(P.position.x - x, P.position.y));
    }
}
//rightline
for (let x = 1; x < _board.length; x++) {
    if (P.position.x + x >= _board.length) {
        break;
    }
    if (_board[P.position.y][P.position.x + x] != null && _board[P.position.y][P.position.x + x].black != P.black) {
        this.allV.push(new Vec2(P.position.x + x, P.position.y));
        break;
    } else if (_board[P.position.y][P.position.x + x] != null && _board[P.position.y][P.position.x + x].black == P.black) { break; }
    else {
        this.allV.push(new Vec2(P.position.x + x, P.position.y));
    }
}
    }
}

class Piece {

    type: pieceType;
    movement: movementType = movementType.Around;
    position: Vec2;
    black: boolean = false;
    firstmove: boolean = true;
    constructor(position: Vec2, type: pieceType, black: boolean = false) {
        this.position = position;
        this.type = type;
        this.black = black;

        switch (this.type) {
            case pieceType.Pawn:
                this.movement = movementType.Forward;
                break;
            case pieceType.Bisshop:
                this.movement = movementType.Cross;
                break;
            case pieceType.Knight:
                this.movement = movementType.Lshape;
                break;
            case pieceType.Tower:
                this.movement = movementType.Plus;
                break;
            case pieceType.Queen:
                this.movement = movementType.CrossPlus;
                break;
            case pieceType.King:
                this.movement = movementType.Around;
                break;

            default:
                break;
        }
    }

    movePiece(newPosition: Vec2) {
        this.position = newPosition;
    }
}
//#endregion


// const pieces = [
//     new Piece(new Vec2(0,0),pieceType.Pawn), 
//     new Piece(new Vec2(0,0),pieceType.Bisshop),
//     new Piece(new Vec2(0,0),pieceType.Knight), 
//     new Piece(new Vec2(0,0),pieceType.Tower),
//     new Piece(new Vec2(0,0),pieceType.Queen),
//     new Piece(new Vec2(0,0),pieceType.King)
// ]

let b_pieces = [
    new Piece(new Vec2(0, 0), pieceType.Tower, true), new Piece(new Vec2(0, 0), pieceType.Knight, true), new Piece(new Vec2(0, 0), pieceType.Bisshop, true), new Piece(new Vec2(0, 0), pieceType.Queen, true), new Piece(new Vec2(0, 0), pieceType.King, true), new Piece(new Vec2(0, 0), pieceType.Bisshop, true), new Piece(new Vec2(0, 0), pieceType.Knight, true), new Piece(new Vec2(0, 0), pieceType.Tower, true),
    new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true), new Piece(new Vec2(0, 0), pieceType.Pawn, true)
]
let w_pieces = [
    new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false), new Piece(new Vec2(0, 0), pieceType.Pawn, false),
    new Piece(new Vec2(0, 0), pieceType.Tower, false), new Piece(new Vec2(0, 0), pieceType.Knight, false), new Piece(new Vec2(0, 0), pieceType.Bisshop, false), new Piece(new Vec2(0, 0), pieceType.Queen, false), new Piece(new Vec2(0, 0), pieceType.King, false), new Piece(new Vec2(0, 0), pieceType.Bisshop, false), new Piece(new Vec2(0, 0), pieceType.Knight, false), new Piece(new Vec2(0, 0), pieceType.Tower, false)
]



let scale = 75;
let _XY = new Vec2(8, 8);

const board = new Board();

let _board: Piece[][] =
    [
        [b_pieces[0], b_pieces[1], b_pieces[2], b_pieces[3], b_pieces[4], b_pieces[5], b_pieces[6], b_pieces[7]],
        [b_pieces[8], b_pieces[9], b_pieces[10], b_pieces[11], b_pieces[12], b_pieces[13], b_pieces[14], b_pieces[15]],
        [null!, null!, null!, null!, null!, null!, null!, null!],
        [null!, null!, null!, null!, null!, null!, null!, null!],
        [null!, null!, null!, null!, null!, null!, null!, null!],
        [null!, null!, null!, null!, null!, null!, null!, null!],
        [w_pieces[0], w_pieces[1], w_pieces[2], w_pieces[3], w_pieces[4], w_pieces[5], w_pieces[6], w_pieces[7]],
        [w_pieces[8], w_pieces[9], w_pieces[10], w_pieces[11], w_pieces[12], w_pieces[13], w_pieces[14], w_pieces[15]]
    ]

let LM: Vec2[];
let hasLM: boolean = false;
let PS: Piece;

let ctx: CanvasRenderingContext2D;

board.assignPos(w_pieces);
board.assignPos(b_pieces);

let turnW : boolean = true;

const _drawer = new Drawer(scale, _XY); 
// ALL PIECES ARE ON THE LEFT TOP SIDE OF THE 4x4 GRID (if they're 3x3)
import { HEIGHT, WIDTH } from "./constants"

enum Piece {
    None = 0,
    OPiece,
    SPiece,
    ZPiece,
    TPiece,
    LPiece,
    JPiece,
    IPiece,
    Outline,
}

const IPIECE = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
]

const JPIECE = [
    [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
    ],
]

const LPIECE = [
    [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
]

const OPIECE = [
    [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
]

const SPIECE = [
    [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
    ],
]

const ZPIECE = [
    [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
    ],
]

const TPIECE = [
    [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
    ],
]

const inOrder = [OPIECE, SPIECE, ZPIECE, TPIECE, LPIECE, JPIECE, IPIECE]

function getPiece(piece: Piece, rotation: 0 | 1 | 2 | 3 = 0) {
    if (piece === Piece.OPiece) rotation = 0;
    return inOrder[piece - 1][rotation].map(e => e.map(Boolean));
}

class TetrisPiece {
    piece: Piece;
    id: number;
    y = 0;
    x = 5;
    rotation: 0 | 1 | 2 | 3 = 0;
    lastFramePos: number[] = [];  // to know what was "colored" last frame
    lastOutlinePos: number[] = [];

    constructor(piece: Piece, id: number) {
        this.piece = piece;
        this.id = id;
    }
    canMove(inPlace: boolean[], dir = "", customY: number | null = null): boolean {
        // puts all the block positions into an array so we can
        // easily check if any of the blocks can't move
        let blocks: number[] = [];
        if (customY === null) customY = this.y;

        const grid = getPiece(this.piece, this.rotation);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j]) blocks.push((customY + i) * WIDTH + this.x + j);
            }
        }

        let canMoveDown = true;
        let canMoveRight = true;
        let canMoveLeft = true;
        for (let i = 0; i < blocks.length; i++) {
            let pos = blocks[i];
            if (inPlace[pos + WIDTH] || Math.floor(pos / WIDTH) === HEIGHT - 1) canMoveDown = false;
            if (inPlace[pos + 1] || pos % WIDTH === (WIDTH - 1)) canMoveRight = false;
            if (inPlace[pos - 1] || pos % WIDTH === 0) canMoveLeft = false;
        }
        if (dir === "l") return canMoveLeft;
        if (dir === "r") return canMoveRight;
        return canMoveDown;
    }
    render(board: number[], pieceId: number[], inPlace: boolean[], setPiece = false): { board: number[], pieceId: number[], inPlace: boolean[] } {
        const addId = setPiece && pieceId.length > 0;
        const addInPlace = setPiece && inPlace.length > 0;
        const grid = getPiece(this.piece, this.rotation);
        // clean up the board from the previous frame
        for (let e of this.lastFramePos) {
            board[e] = 0;
        }
        this.lastFramePos = [];

        board = this.getOutline(board, inPlace);

        console.log(this.y);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (!grid[i][j]) continue;
                let pos = (this.y + i) * WIDTH + j + this.x;
                board[pos] = this.piece;
                if (addId) pieceId[pos] = this.id;
                if (addInPlace) inPlace[pos] = true;
                this.lastFramePos.push(pos);
            }
        }

        return { board, pieceId, inPlace };
    }
    moveDown(board: number[], pieceId: number[], inPlace: boolean[],) {
        this.y++;
        return this.render(board, pieceId, inPlace);
    }
    moveRight(board: number[], pieceId: number[], inPlace: boolean[]) {
        this.x++;
        return this.render(board, pieceId, inPlace);
    }
    moveLeft(board: number[], pieceId: number[], inPlace: boolean[]) {
        this.x--;
        return this.render(board, pieceId, inPlace);
    }
    rotateRight(board: number[], pieceId: number[], inPlace: boolean[]) {
        this.rotation++;
        if (this.rotation > 3) this.rotation = 0;
        return this.render(board, pieceId, inPlace);
    }
    rotateLeft(board: number[], pieceId: number[], inPlace: boolean[]) {
        this.rotation--;
        if (this.rotation < 0) this.rotation = 3;
        return this.render(board, pieceId, inPlace);
    }
    hardDrop(board: number[], pieceId: number[], inPlace: boolean[]) {
        this.y = this._getLowestY(inPlace);
        return this.render(board, pieceId, inPlace, true);
    }
    _getLowestY(inPlace: boolean[]) {
        let lowestY = this.y;
        for (; lowestY < HEIGHT; lowestY++) {
            let res = this.canMove(inPlace, "", lowestY);
            if (!res) {
                break;
            }
        }
        return lowestY;
    }
    getOutline(board: number[], inPlace: boolean[]) {
        // find the lowest y that we can still place the block
        let lowestY = this._getLowestY(inPlace);

        const grid = getPiece(this.piece, this.rotation);
        // clean up the board from the previous frame
        for (let e of this.lastOutlinePos) {
            board[e] = 0;
        }
        this.lastOutlinePos = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (!grid[i][j]) continue;
                let pos = (lowestY + i) * WIDTH + j + this.x;
                board[pos] = Piece.Outline;
                this.lastOutlinePos.push(pos);
            }
        }
        return board;

    }
}

export { getPiece, Piece, TetrisPiece };
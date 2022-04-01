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

function getPiece(piece: Piece, rotation: number = 0) {
    if (piece === Piece.None) {
        return [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    }
    if (piece === Piece.OPiece) rotation = 0;
    return inOrder[piece - 1][rotation].map(e => e.map(Boolean));
}

class TetrisPiece {
    piece: Piece;
    id: number;
    y = 0;
    x = 5;
    rotation: number = 0;
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
    render(board: number[], inPlace: boolean[], setPiece = false): { board: number[], inPlace: boolean[] } {
        const addInPlace = setPiece && inPlace.length > 0;
        const grid = getPiece(this.piece, this.rotation);
        // clean up the board from the previous frame
        for (let e of this.lastFramePos) {
            board[e] = 0;
        }
        this.lastFramePos = [];

        board = this.getOutline(board, inPlace);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (!grid[i][j]) continue;
                let pos = (this.y + i) * WIDTH + j + this.x;
                board[pos] = this.piece;
                if (addInPlace) inPlace[pos] = true;
                this.lastFramePos.push(pos);
            }
        }

        return { board, inPlace };
    }
    moveDown(board: number[], inPlace: boolean[],) {
        this.y++;
        return this.render(board, inPlace);
    }
    moveRight(board: number[], inPlace: boolean[]) {
        this.x++;
        return this.render(board, inPlace);
    }
    moveLeft(board: number[], inPlace: boolean[]) {
        this.x--;
        return this.render(board, inPlace);
    }
    rotateRight(board: number[], inPlace: boolean[]) {
        let newRotation = (this.rotation + 1) % 4;
        const rotated_grid = getPiece(this.piece, newRotation);
        let pieceIsLeft = this.x < WIDTH / 2;
        for (let i = 0; i < rotated_grid.length; i++) {
            for (let j = 0; j < rotated_grid[0].length; j++) {
                if (!rotated_grid[i][j]) continue;
                let pos = (this.y + i) * WIDTH + this.x + j;
                let local_x = pos % WIDTH;
                // if its not possible to rotate because of another piece
                if (inPlace[pos]) return { board: board, inPlace: inPlace };
                // can't rotate piece out of bounds on the floor
                if (pos >= (HEIGHT * WIDTH)) return { board: board, inPlace: inPlace };
                // can't rotate the piece if it splits the piece
                if (pieceIsLeft && local_x === WIDTH - 1) return { board: board, inPlace: inPlace };
                if (!pieceIsLeft && local_x === 0) return { board: board, inPlace: inPlace };
            }
        }

        this.rotation = newRotation;
        return this.render(board, inPlace);
    }
    rotateLeft(board: number[], inPlace: boolean[]) {
        this.rotation--;
        if (this.rotation < 0) this.rotation = 3;
        return this.render(board, inPlace);
    }
    hardDrop(board: number[], inPlace: boolean[]) {
        this.y = this._getLowestY(inPlace);
        return this.render(board, inPlace, true);
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
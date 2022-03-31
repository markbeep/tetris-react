import { useEffect } from "react";
import { useState } from "react";
import "./tetris.css";

enum Piece {
    None = 0,
    OPiece,
    SPiece,
    ZPiece,
    TPiece,
    LPiece,
    JPiece,
    IPiece
}

const HEIGHT = 20;
const WIDTH = 10;
const SLOW_TICK = 5;
const FAST_TICK = 10;
const QUEUE_BAGS = 1;
let currentPiece: TetrisPiece;
let keyWasPressed = false;  // to allow us to slowly move tiles

class TetrisPiece {
    piece: Piece;
    id: number;
    y = 0;
    x = 5;
    grid = new Array(4).fill([]).map(e => new Array(4).fill(false));
    constructor(piece: Piece, id: number) {
        this.piece = piece;
        this.id = id;
    }
    canMove(board: number[], dir = ""): boolean {
        // puts all the block positions into an array so we can
        // easily check if any of the blocks can't move
        let blocks: number[] = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j]) blocks.push((this.y + i) * WIDTH + this.x + j);
            }
        }

        let canMoveDown = true;
        let canMoveRight = true;
        let canMoveLeft = true;
        for (let i = 0; i < blocks.length; i++) {
            let pos = blocks[i];
            if (board[pos + WIDTH] !== 0) canMoveDown = false;
            if (board[pos + 1] !== 0 || pos % WIDTH === (WIDTH - 1)) canMoveRight = false;
            if (board[pos - 1] !== 0 || pos % WIDTH === 0) canMoveLeft = false;
        }
        if (dir === "l") return canMoveLeft;
        if (dir === "r") return canMoveRight;
        return canMoveDown;
    }
}

export default function Tetris() {
    const [board, setBoard] = useState<number[]>(new Array(WIDTH * HEIGHT).fill(0));
    const [inPlace, setInPlace] = useState(new Array(WIDTH * HEIGHT).fill(false));
    const [tick, setTick] = useState(1);
    const [pieceId, setPieceId] = useState(new Array(WIDTH * HEIGHT).fill(0));
    const [pieceQueue, setPieceQueue] = useState<Piece[]>(shuffle([1, 2, 3, 4, 5, 6, 7]));
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const keyPressHandler = (event: KeyboardEvent) => {
            let code = event.key;
            if (keyWasPressed) return;
            if (code == "ArrowUp") {
                // up
                console.log("up");
            }
            if (code == "ArrowRight") {
                // right
                console.log("right");
                keyWasPressed = true;
                setTimeout(() => keyWasPressed = false, 100);
                moveRight();
            }
            if (code == "ArrowLeft") {
                // right
                console.log("left");
                keyWasPressed = true;
                setTimeout(() => keyWasPressed = false, 100);
                moveLeft();
            }
        };
        document.addEventListener("keydown", keyPressHandler);

        return () => {
            document.removeEventListener("keydown", keyPressHandler);
        };

    }, [pieceId, board]);

    useEffect(() => {
        if (gameOver) return;
        setTimeout(() => setTick(e => e + 1), 50);
        if (tick % SLOW_TICK === 0) {
            let res = moveDown();
            // nothing moved, so send new piece
            if (!res.moved) {  // sets the new inPlaces
                for (let i = 0; i < res.board.length; i++) {
                    if (res.board[i] > 0) res.inPlace[i] = true;
                }
                setInPlace(res.inPlace);

                // check if game is done (simply checks the top line)
                for (let i = 0; i < 10; i++) {
                    if (res.inPlace[i]) {
                        setGameOver(true);
                        return;
                    }
                }

                // send new piece
                const tmpPiece = pieceQueue;
                const piece = tmpPiece.shift();
                if (piece === undefined) return;
                setPieceQueue([...tmpPiece]);
                addPiece(piece);
            }
        }
    }, [tick, gameOver])

    // updates the piece queue to always have at least 7 pieces in it
    useEffect(() => {
        if (pieceQueue.length < 7) {
            let tmp: Piece[] = new Array(QUEUE_BAGS * 7);
            shuffle(tmp);
            let c = 0;
            for (let p = 1; p <= 7; p++) {
                for (let i = 0; i < QUEUE_BAGS; i++) {
                    tmp[c] = p;
                    c++;
                }
            }
            setPieceQueue([...pieceQueue, ...tmp]);
        }
    }, [pieceQueue]);

    // useEffect(() => {
    //     let tmp = new Array(WIDTH * HEIGHT).fill(0);
    //     let tmpId = new Array(WIDTH * HEIGHT).fill(0);
    //     let tmpbool = new Array(WIDTH * HEIGHT).fill(false);
    //     tmp[114] = tmp[115] = tmp[124] = tmp[125] = Piece.OPiece;
    //     tmpId[114] = tmpId[115] = tmpId[124] = tmpId[125] = 2;
    //     tmpbool[114] = tmpbool[115] = tmpbool[124] = tmpbool[125] = true;

    //     tmp[104] = tmp[105] = tmp[106] = tmp[95] = Piece.TPiece;
    //     tmpId[104] = tmpId[105] = tmpId[106] = tmpId[95] = 3;
    //     tmpbool[104] = tmpbool[105] = tmpbool[106] = tmpbool[95] = false;

    //     console.log(canMove(tmpId, 106, 3));
    //     setBoard(tmp);
    //     setPieceId(tmpId);
    //     setInPlace(tmpbool);
    // }, [])

    // goes through the board and moves down all fields that can be moved down
    const moveDown = (moveInPlace: boolean = false) => {
        let tmpBoard = board;
        let tmpPlace = inPlace;
        let tmpId = pieceId;
        let somethingMoved = false;
        for (let i = tmpBoard.length - 1; i >= WIDTH; i--) {
            if (tmpBoard[i] !== Piece.None) continue;  // this field isn't free, above can't be pushed down
            let above = i - WIDTH;
            if (tmpBoard[above] === Piece.None) continue; // the block we want to move is empty


            if (!moveInPlace && tmpPlace[above]) continue;  // can't move inPlace blocks

            if (!canMove(tmpId, above, tmpId[above])) continue;  // can't move this piece

            // pull the above item down
            tmpBoard[i] = tmpBoard[above];
            tmpBoard[above] = 0;
            tmpPlace[i] = tmpPlace[above];
            tmpPlace[above] = false;
            tmpId[i] = tmpId[above];
            tmpId[above] = 0;
            somethingMoved = true;
        }
        setBoard(tmpBoard);
        // setInPlace(tmpPlace);
        return { moved: somethingMoved, board: tmpBoard, inPlace: tmpPlace, id: tmpId };
    };

    const moveRight = () => {
        let canRight = true;
        let tested = false;
        for (let i = board.length - 1; i >= 0; i--) {
            if (pieceId[i] === currentPieceId) {
                if (!tested) {
                    canRight = canMove(pieceId, i, currentPieceId, [], "r");
                    tested = true;
                }
                if (!canRight) break;
                pieceId[i + 1] = pieceId[i];
                pieceId[i] = 0;
                board[i + 1] = board[i];
                board[i] = 0;
            }
        }
        setPieceId([...pieceId]);
        setBoard([...board]);
    };

    const moveLeft = () => {
        let canLeft = true;
        let tested = false;
        for (let i = 0; i < board.length; i++) {
            if (pieceId[i] === currentPieceId) {
                if (!tested) {
                    canLeft = canMove(pieceId, i, currentPieceId, [], "l");
                    tested = true;
                }
                if (!canLeft) break;
                pieceId[i - 1] = pieceId[i];
                pieceId[i] = 0;
                board[i - 1] = board[i];
                board[i] = 0;
            }
        }
        setPieceId([...pieceId]);
        setBoard([...board]);
    };

    const setPiece = (board: number[], placed: boolean[], id: number[], positions: number[], piece: Piece) => {
        const tid = tick;
        for (let i = 0; i < positions.length; i++) {
            let elem = positions[i];
            board[elem] = piece;
            placed[elem] = false;
            id[elem] = tid;
        }
        return tid;
    };

    const addPiece = (id: Piece) => {
        let tmp = board;
        let placed = inPlace;
        let tmpId = pieceId;
        let positions = [0, 0, 0, 0];
        if (id === Piece.OPiece) positions = [4, 5, 4 + WIDTH, 5 + WIDTH];
        if (id === Piece.SPiece) positions = [5, 6, 4 + WIDTH, 5 + WIDTH];
        if (id === Piece.ZPiece) positions = [3, 4, 4 + WIDTH, 5 + WIDTH];
        if (id === Piece.TPiece) positions = [4, 3 + WIDTH, 4 + WIDTH, 5 + WIDTH];
        if (id === Piece.LPiece) positions = [5, 3 + WIDTH, 4 + WIDTH, 5 + WIDTH];
        if (id === Piece.JPiece) positions = [3, 3 + WIDTH, 4 + WIDTH, 5 + WIDTH];
        if (id === Piece.IPiece) positions = [3, 4, 5, 6];


        const tid = setPiece(tmp, placed, tmpId, positions, id);
        setPieceId(tmpId);
        setBoard(tmp);
        setInPlace(placed);
        currentPieceId = tid;
    };

    return (
        <div className="window">
            <div className="gameBoard">
                {board.filter((_, i) => i < 200).map((e, i) => <div className={`piece piece-${e} ${inPlace[i] ? "inPlace" : ""}`}></div>)}
            </div>
        </div>
    );
};

// determines if a piece can be moved down
function canMove(boardId: number[], pos: number, id: number, vis: number[] = [], dir = ""): boolean {
    if (vis.includes(pos)) return true;

    let tmpVis = [...vis, pos];

    // check left
    let leftCanMove = (dir === "l")
        ? (boardId[pos - 1] === id) ? canMove(boardId, pos - 1, id, tmpVis, dir) : (pos - 1) % WIDTH !== (WIDTH - 1) && boardId[pos - 1] === 0
        : (boardId[pos - 1] !== id) ? true : canMove(boardId, pos - 1, id, tmpVis, dir);

    // check right
    let rightCanMove = (dir === "r")
        ? (boardId[pos + 1] === id) ? canMove(boardId, pos + 1, id, tmpVis, dir) : (pos + 1) % WIDTH !== 0 && boardId[pos + 1] === 0
        : (boardId[pos + 1] !== id) ? true : canMove(boardId, pos + 1, id, tmpVis, dir);

    let topCanMove = (boardId[pos - WIDTH] !== id) ? true : canMove(boardId, pos - WIDTH, id, tmpVis, dir);
    let botCanMove = [0, undefined].includes(boardId[pos + WIDTH]) || (boardId[pos + WIDTH] === id && canMove(boardId, pos + WIDTH, id, tmpVis, dir));

    return leftCanMove && rightCanMove && topCanMove && botCanMove;
}

// shuffles an array
function shuffle(array: number[]) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

        // swap elements
        let tmp = array[counter];
        array[counter] = array[index];
        array[index] = tmp;
    }
    return array;
}
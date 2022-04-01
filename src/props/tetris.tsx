import { useEffect } from "react";
import { useState } from "react";
import "./tetris.css";
import { Piece, TetrisPiece } from "./pieces";
import { HEIGHT, WIDTH, SLOW_TICK, FAST_TICK, QUEUE_BAGS, WAIT_BEFORE_SET } from "./constants";


let currentPiece: TetrisPiece | null = null;
let leftWasPressed = false;
let rightWasPressed = false;
let upWasPressed = false;
let spaceWasPressed = false;
let fastMode = false;
let hardDropHappened = false;

let currentBoard: number[] = new Array(WIDTH * HEIGHT).fill(0);
let currentInPlace: boolean[] = new Array(WIDTH * HEIGHT).fill(false);
let currentPieceId: number[] = new Array(WIDTH * HEIGHT).fill(0);

export default function Tetris() {
    const [board, setBoard] = useState<number[]>(new Array(WIDTH * HEIGHT).fill(0));
    const [inPlace, setInPlace] = useState(new Array(WIDTH * HEIGHT).fill(false));
    const [tick, setTick] = useState(1);
    const [pieceId, setPieceId] = useState(new Array(WIDTH * HEIGHT).fill(0));
    const [pieceQueue, setPieceQueue] = useState<Piece[]>(shuffle([1, 2, 3, 4, 5, 6, 7]));
    const [gameOver, setGameOver] = useState(false);

    const renderFrame = () => {
        setBoard(currentBoard);
        setInPlace(currentInPlace);
        setPieceId(currentPieceId);
    }

    useEffect(() => {
        // handle the key being down
        const keyPressHandler = (event: KeyboardEvent) => {
            let code = event.key;
            // if down arrow is pressed, keep going down
            if (code === "ArrowDown") {
                // down
                fastMode = true;
            }
            const keyCooldown = 100;
            if (code == "ArrowUp" && !upWasPressed) {
                // up
                upWasPressed = true;
                currentPiece?.rotateRight(currentBoard, currentPieceId, currentInPlace);
            }
            if (code == "ArrowRight" && !rightWasPressed) {
                // right
                rightWasPressed = true;
                setTimeout(() => rightWasPressed = false, keyCooldown);
                moveRight();
            }
            if (code == "ArrowLeft" && !leftWasPressed) {
                // right
                leftWasPressed = true;
                setTimeout(() => leftWasPressed = false, keyCooldown);
                moveLeft();
            }
            if (code === " " && !spaceWasPressed) {
                if (currentPiece === null) return;
                hardDropHappened = true;
                spaceWasPressed = true;
                let tmp = currentPiece.hardDrop(currentBoard, currentPieceId, currentInPlace);
                currentPiece = null;
                currentBoard = tmp.board;
                currentPieceId = tmp.pieceId;
                currentInPlace = tmp.inPlace;
                renderFrame();
            }
        };

        const keyReleaseHandler = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                fastMode = false;
            }
            if (e.key === "ArrowUp") {
                upWasPressed = false;
            }
            if (e.key === "ArrowLeft") {
                leftWasPressed = false;
            }
            if (e.key === "ArrowRight") {
                rightWasPressed = false;
            }
            if (e.key === " ") {
                spaceWasPressed = false;
            }
        };

        // rest if the button is released
        document.addEventListener("keydown", keyPressHandler);
        document.addEventListener("keyup", keyReleaseHandler)

        return () => {
            document.removeEventListener("keydown", keyPressHandler);
            document.removeEventListener("keyup", keyReleaseHandler)
        };

    }, [currentPieceId, currentBoard]);

    useEffect(() => {
        if (gameOver) return;
        setTimeout(() => setTick(e => e + 1), 20);
        if (tick % (fastMode ? FAST_TICK : SLOW_TICK) === 0) {
            // the current piece has landed, send a new piece
            if (!moveDown() || hardDropHappened) {
                // checks if we lost
                hardDropHappened = false;
                for (let i = 0; i < WIDTH; i++) {
                    if (currentInPlace[i]) {
                        setGameOver(true);
                        return;
                    }
                }
                // checks if a line is to be removed
                let linesToRemove: number[] = [];
                for (let y = 0; y < HEIGHT; y++) {
                    let count = 0;
                    for (let x = 0; x < WIDTH; x++) {
                        if (inPlace[y * WIDTH + x]) count++;
                    }
                    if (count === WIDTH) linesToRemove.push(y);
                }
                removeLines(linesToRemove);

                dropNewPiece();
            }
            renderFrame();
        }
    }, [tick, gameOver])

    // updates the piece queue to always have at least 7 pieces in it
    useEffect(() => {
        if (pieceQueue.length < 7) {
            let tmp: Piece[] = new Array(QUEUE_BAGS * 7);
            let c = 0;
            for (let p = 1; p <= 7; p++) {
                for (let i = 0; i < QUEUE_BAGS; i++) {
                    tmp[c] = p;
                    c++;
                }
            }
            shuffle(tmp);
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

    // moves the piece down by one block
    const moveDown = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(currentInPlace)) {
            let tmp = currentPiece.moveDown(currentBoard, currentPieceId, currentInPlace);
            currentBoard = tmp.board;
            return true;
        }
        let tmp = currentPiece.render(currentBoard, currentPieceId, currentInPlace, true);
        currentBoard = tmp.board;
        currentInPlace = tmp.inPlace;
        currentPieceId = tmp.pieceId;
        currentPiece = null;
        return false;
    };

    const moveRight = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(currentInPlace, "r")) {
            let tmp = currentPiece.moveRight(currentBoard, currentPieceId, currentInPlace);
            currentBoard = tmp.board;
        }
    };

    const moveLeft = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(currentInPlace, "l")) {
            let tmp = currentPiece.moveLeft(currentBoard, currentPieceId, currentInPlace);
            currentBoard = tmp.board;
        }
    };

    const dropNewPiece = () => {
        const newPiece = pieceQueue.shift();
        if (newPiece === undefined) return;
        currentPiece = new TetrisPiece(newPiece, tick);
        setPieceQueue([...pieceQueue]);
        renderFrame();
    };

    return (
        <div className="window">
            <div className="gameBoard">
                {board.slice(0, 200).map((e, i) => <div className={`piece piece-${e} ${inPlace[i] ? "inPlace" : ""}`}></div>)}
            </div>
            <div className="upcoming">
                {pieceQueue.slice(0, 4).map(e => <div>Hello</div>)}
            </div>
        </div>
    );
};

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

function removeLines(linesToRemove: number[]) {
    let n = linesToRemove.length;
    if (n === 0) return;
    let sorted = linesToRemove.sort((a, b) => b - a);  // greater y first
    for (let startY of sorted) {
        for (let y = startY; y >= 0; y--) {
            for (let x = 0; x < WIDTH; x++) {
                const pos = y * WIDTH + x;
                const above = (y - 1) * WIDTH + x;
                currentBoard[pos] = currentBoard[above] || 0;
                currentPieceId[pos] = currentPieceId[above] || 0;
                currentInPlace[pos] = currentInPlace[above] || false;
                if (above > 0) {
                    currentBoard[above] = 0;
                    currentPieceId[above] = 0;
                    currentInPlace[above] = false;
                }
            }
        }
    }
}
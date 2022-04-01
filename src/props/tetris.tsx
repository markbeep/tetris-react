import { useEffect } from "react";
import { useState } from "react";
import "./tetris.css";
import { getPiece, Piece, TetrisPiece } from "./pieces";
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

export default function Tetris() {
    const [board, setBoard] = useState<number[]>(new Array(WIDTH * HEIGHT).fill(0));
    const [inPlace, setInPlace] = useState(new Array(WIDTH * HEIGHT).fill(false));
    const [tick, setTick] = useState(1);
    const [pieceQueue, setPieceQueue] = useState<Piece[]>(shuffle([1, 2, 3, 4, 5, 6, 7]));
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const renderFrame = () => {
        setBoard(currentBoard);
        setInPlace(currentInPlace);
    }

    // handles key presses
    useEffect(() => {
        // handle the key being down
        const keyPressHandler = (event: KeyboardEvent) => {
            let code = event.key;
            if (hardDropHappened) return;
            // if down arrow is pressed, keep going down
            if (code === "ArrowDown") {
                // down
                fastMode = true;
            }
            const keyCooldown = 100;
            if (code === "ArrowUp" && !upWasPressed) {
                // up
                upWasPressed = true;
                currentPiece?.rotateRight(currentBoard, currentInPlace);
            }
            if (code === "ArrowRight" && !rightWasPressed) {
                // right
                rightWasPressed = true;
                setTimeout(() => rightWasPressed = false, keyCooldown);
                moveRight();
            }
            if (code === "ArrowLeft" && !leftWasPressed) {
                // right
                leftWasPressed = true;
                setTimeout(() => leftWasPressed = false, keyCooldown);
                moveLeft();
            }
            if (code === " " && !spaceWasPressed) {
                if (currentPiece === null) return;
                hardDropHappened = true;
                spaceWasPressed = true;
                let tmp = currentPiece.hardDrop(currentBoard, currentInPlace);
                // dropNewPiece();
                currentBoard = tmp.board;
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

    }, []);

    // handles the game ticks
    useEffect(() => {
        if (gameOver) return;
        setTimeout(() => setTick(e => e + 1), 20);
        if (currentPiece === null) dropNewPiece();
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
                console.log("Checking for finished rows")
                for (let y = 0; y < HEIGHT; y++) {
                    let count = 0;
                    for (let x = 0; x < WIDTH; x++) {
                        if (inPlace[y * WIDTH + x]) count++;
                    }
                    // if (count === 0) break;
                    if (count === WIDTH) linesToRemove.push(y);
                }
                console.log(`Found ${linesToRemove.length} rows to remove`)

                let n = linesToRemove.length;
                if (n > 0) {
                    removeLines(linesToRemove);
                    setScore(s => s + getScore(n));
                }
            }
            renderFrame();
        }
    }, [tick, gameOver]);

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

    // moves the piece down by one block
    const moveDown = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(currentInPlace)) {
            let tmp = currentPiece.moveDown(currentBoard, currentInPlace);
            currentBoard = tmp.board;
            return true;
        }
        let tmp = currentPiece.render(currentBoard, currentInPlace, true);
        currentBoard = tmp.board;
        currentInPlace = tmp.inPlace;
        currentPiece = null;
        return false;
    };

    const moveRight = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(currentInPlace, "r")) {
            let tmp = currentPiece.moveRight(currentBoard, currentInPlace);
            currentBoard = tmp.board;
        }
    };

    const moveLeft = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(currentInPlace, "l")) {
            let tmp = currentPiece.moveLeft(currentBoard, currentInPlace);
            currentBoard = tmp.board;
        }
    };

    const dropNewPiece = () => {
        const newPiece = pieceQueue.shift();
        if (newPiece === undefined) return;
        currentPiece = new TetrisPiece(newPiece, tick);
        currentBoard = currentPiece.render(currentBoard, inPlace).board;
        setPieceQueue([...pieceQueue]);
        renderFrame();
    };

    return (
        <div className="container">
            <div className="scoreField">
                <h3>{score}</h3>
            </div>
            <div className="window">
                <div className="gameBoard">
                    {board.slice(0, 200).map((e, i) => <div className={`piece piece-${e} ${inPlace[i] ? "inPlace" : ""}`}></div>)}
                </div>
                <div className="upcoming">
                    <h3>Upcoming</h3>
                    {pieceQueue
                        .slice(0, 4)
                        .map(pieceId => {
                            let queueGrid = getPiece(pieceId, 0).flat();
                            return (
                                <div className="upcomingField">
                                    {queueGrid.map(exists => <div className={`piece ${exists ? `piece-${pieceId}` : ""}`}></div>)}
                                </div>
                            );
                        })
                    }
                </div>
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
    let sorted = linesToRemove.sort((a, b) => a - b);  // greater y first
    for (let startY of sorted) {
        for (let y = startY; y >= 0; y--) {
            for (let x = 0; x < WIDTH; x++) {
                const pos = y * WIDTH + x;
                const above = (y - 1) * WIDTH + x;
                currentBoard[pos] = currentBoard[above] || 0;
                currentInPlace[pos] = currentInPlace[above] || false;
                if (above > 0) {
                    currentBoard[above] = 0;
                    currentInPlace[above] = false;
                }
            }
        }
    }
}

function getScore(linesCleared: number, level = 0) {
    switch (linesCleared) {
        case 1: return 40 * (level + 1);
        case 2: return 100 * (level + 1);
        case 3: return 300 * (level + 1);
        case 4: return 1200 * (level + 1);
        default: return 0;
    }
}
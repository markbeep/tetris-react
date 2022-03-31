import { useEffect } from "react";
import { useState } from "react";
import "./tetris.css";
import { Piece, TetrisPiece } from "./pieces";
import { HEIGHT, WIDTH, SLOW_TICK, FAST_TICK, QUEUE_BAGS } from "./constants";


let currentPiece: TetrisPiece | null = null;
let leftWasPressed = false;
let rightWasPressed = false;
let upWasPressed = false;
let fastMode = false;

export default function Tetris() {
    const [board, setBoard] = useState<number[]>(new Array(WIDTH * HEIGHT).fill(0));
    const [inPlace, setInPlace] = useState(new Array(WIDTH * HEIGHT).fill(false));
    const [tick, setTick] = useState(1);
    const [pieceId, setPieceId] = useState(new Array(WIDTH * HEIGHT).fill(0));
    const [pieceQueue, setPieceQueue] = useState<Piece[]>(shuffle([1, 2, 3, 4, 5, 6, 7]));
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        // handle the key being down
        const keyPressHandler = (event: KeyboardEvent) => {
            let code = event.key;
            // if down arrow is pressed, keep going down
            if (code === "ArrowDown") {
                // down
                fastMode = true;
            }
            if (code == "ArrowUp" && !upWasPressed) {
                // up
                upWasPressed = true;
                currentPiece?.rotateRight(board, pieceId, inPlace);
            }
            if (code == "ArrowRight" && !rightWasPressed) {
                // right
                rightWasPressed = true;
                moveRight();
            }
            if (code == "ArrowLeft" && !leftWasPressed) {
                // right
                leftWasPressed = true;
                moveLeft();
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
        };

        // rest if the button is released
        document.addEventListener("keydown", keyPressHandler);
        document.addEventListener("keyup", keyReleaseHandler)

        return () => {
            document.removeEventListener("keydown", keyPressHandler);
            document.removeEventListener("keyup", keyReleaseHandler)
        };

    }, [pieceId, board]);

    useEffect(() => {
        if (gameOver) return;
        setTimeout(() => setTick(e => e + 1), 20);
        if (tick % (fastMode ? FAST_TICK : SLOW_TICK) === 0) {
            // the current piece has landed, send a new piece
            if (!moveDown()) {
                for (let i = 0; i < WIDTH; i++) {
                    if (inPlace[i]) {
                        setGameOver(true);
                        return;
                    }
                }
                dropNewPiece();
            }
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
        if (currentPiece.canMove(inPlace)) {
            let tmp = currentPiece.moveDown(board, pieceId, inPlace);
            setBoard([...tmp.board]);
            return true;
        }
        let tmp = currentPiece.render(board, pieceId, inPlace, true);
        setBoard([...tmp.board]);
        setInPlace([...tmp.inPlace]);
        setPieceId([...tmp.pieceId]);
        currentPiece = null;
        return false;
    };

    const moveRight = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(inPlace, "r")) {
            let tmp = currentPiece.moveRight(board, pieceId, inPlace);
            setBoard([...tmp.board]);
        }
    };

    const moveLeft = () => {
        if (currentPiece === null) return;  // there's currently no piece dropping
        if (currentPiece.canMove(inPlace, "l")) {
            let tmp = currentPiece.moveLeft(board, pieceId, inPlace);
            setBoard([...tmp.board]);
        }
    };

    const dropNewPiece = () => {
        const newPiece = pieceQueue.shift();
        if (newPiece === undefined) return;
        currentPiece = new TetrisPiece(newPiece, tick);
        setPieceQueue([...pieceQueue]);
    };

    return (
        <div className="window">
            <div className="gameBoard">
                {board.filter((_, i) => i < 200).map((e, i) => <div className={`piece piece-${e} ${inPlace[i] ? "inPlace" : ""}`}></div>)}
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
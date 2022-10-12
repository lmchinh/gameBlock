import { BlockLogic } from "../logics/BlockLogic"
import Block from "./Block"
import BlockArea from "./BlockArea"
import Board from "./Board"
import Popup from "./Popup"

var BLOCKS = {
    1: [[1, 1],
    [1, 0]],
    2: [[2, 2],
    [2, 2]],
    3: [[0, 3, 3],
    [3, 3, 0]],
    4: [[4]],
    5: [[0, 5],
    [5, 5]],
    6: [[6, 6, 6, 6]],
    7: [[0, 3, 0],
    [3, 3, 3]],
    8: [[1, 1],
    [0, 1],
    [0, 1]],
    9: [[4, 4],
    [0, 4]],
    10: [[2],
    [2],],
}

@cc._decorator.ccclass()
export default class extends cc.Component {
    @cc._decorator.property(Board) board: Board = null
    @cc._decorator.property(BlockArea) blocks: BlockArea = null
    @cc._decorator.property(cc.Label) score: cc.Label = null
    @cc._decorator.property(Popup) popup: Popup = null

    logics: BlockLogic

    protected onLoad() {
        window["scene"] = this

        cc.game.on("on-block-touch-start", this.onBlockTouchStart, this)
        cc.game.on("on-block-touch-end", this.onBlockTouchEnd, this)

        this.initLogics()
        this.newGame()

    }
    initLogics() {
        this.logics = new BlockLogic(8, BLOCKS)
        this.logics.onNewGame(() => {
            this.board.setData(this.logics.board)
            this.blocks.setData(this.logics.blockArea)
        })
        this.logics.onGameOver((score) => {
            this.popup.openAsync(score)
            // this.newGame()
        })
        this.logics.onBlockDropped(() => {
            // update UI when block drop
        })
        this.logics.onScoreChanged((score) => {
            this.score.string = `Score: ${score}`
            console.log(this.score.string)

        })
    }
    newGame() {
        this.logics.newGame()
    }
    onBlockTouchEnd(block: Block) {
        var localPos = block.node.getPosition()
        var worldPos = block.node.convertToWorldSpaceAR(cc.v2(0, 0))
        var boardPos = this.board.node.convertToNodeSpaceAR(worldPos)
        console.log("pos", localPos, worldPos, boardPos)

        var boardSize = this.board.node.getContentSize()
        boardPos.x += boardSize.width / 2
        boardPos.y = boardSize.height / 2 - boardPos.y

        var scale = block.node.scale
        var blockSize = block.node.getContentSize()
        boardPos.x -= blockSize.width / 3 * scale
        boardPos.y -= blockSize.height / 3 * scale
        console.log("boardPos", boardPos)

        var boardCellSize = this.board.getCellFullSize()
        var row = Math.floor(boardPos.y / boardCellSize.height)
        var col = Math.floor(boardPos.x / boardCellSize.width)

        if (this.logics.drop(block.data, row, col)) {
            this.board.updateState()
            this.blocks.removeBlock(block)
        } else {
            this.blocks.returnBlock(block)
        }

        console.log("position", row, col)

    }
    onBlockTouchStart(block: Block) {
        block.node.scale = this.board.scale
    }
}
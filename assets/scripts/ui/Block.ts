import { Block, BlockLogic } from "../logics/BlockLogic"
import BlockArea from "./BlockArea"
import Cell from "./Cell"

@cc._decorator.ccclass()
export default class extends cc.Component {
    savedPos: cc.Vec2
    savedScale: number
    resetState() {
        this.node.setPosition(this.savedPos)
        this.node.scale = this.savedScale
    }
    saveState() {
        this.savedPos = this.node.getPosition()
        this.savedScale = this.node.scale
    }
    @cc._decorator.property(cc.Prefab) cellPrefab: cc.Prefab = null

    data: Block
    private cellWidth: number

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
    }
    onTouchStart(event: cc.Event.EventTouch) {
        cc.game.emit("on-block-touch-start", this)
    }
    onTouchMove(event: cc.Event.EventTouch) {
        var d = event.getDelta()
        this.node.x += d.x
        this.node.y += d.y
    }
    onTouchEnd(event: cc.Event.EventTouch) {
        cc.game.emit("on-block-touch-end", this)
    }
    onTouchCancel(event: cc.Event.EventTouch) {

    }
    setData(data: Block) {
        this.data = data
        this.updateUI()
    }
    updateUI() {
        this.node.removeAllChildren()

        // 1. create cells
        for (var r = 0; r < this.data.rows; r++) {
            for (var c = 0; c < this.data.cols; c++) {
                var cell = this.createCell(this.data.cells[r][c])
                this.node.addChild(cell.node)
            }
        }
        // 2. set width
        this.node.width = this.data.cols * this.getCellWidth()

    }
    getCellWidth() {
        if (!this.cellWidth) {
            var cell = cc.instantiate(this.cellPrefab)
            this.cellWidth = cell.width
        }
        return this.cellWidth
    }
    createCell(data: number) {
        var node = cc.instantiate(this.cellPrefab)
        var cell = node.getComponent(Cell)
        cell.setData(data, true)
        return cell
    }
}
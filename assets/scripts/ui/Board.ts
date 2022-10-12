import { Board } from "../logics/BlockLogic"
import Cell from "./Cell"

@cc._decorator.ccclass()
export default class extends cc.Component {
    @cc._decorator.property(cc.Prefab) cellPrefab: cc.Prefab = null
    @cc._decorator.property(cc.Node) cellContainer: cc.Node = null

    data: Board
    scale: number
    cellSize: cc.Size
    cells: Cell[][]

    setData(data: Board) {
        this.data = data
        this.updateUI()
    }
    private updateUI() {
        this.cellContainer.removeAllChildren()

        var width = this.getCellSize().width
        this.scale = Math.floor(this.cellContainer.width / this.data.cols) / width
        this.cells = []
        for (var r = 0; r < this.data.rows; r++) {
            this.cells[r] = []
            for (var c = 0; c < this.data.cols; c++) {
                var cell = this.createCell(this.data.cells[r][c])
                cell.node.scale = this.scale
                this.cellContainer.addChild(cell.node)
                this.cells[r][c] = cell
            }
        }
        this.node.width = width * this.scale * this.data.cols
    }
    updateState() {
        for (var r = 0; r < this.data.rows; r++) {
            for (var c = 0; c < this.data.cols; c++) {
                this.cells[r][c].setData(this.data.cells[r][c])
            }
        }
    }
    getCellSize() {
        if (!this.cellSize) {
            var cell = cc.instantiate(this.cellPrefab)
            this.cellSize = cell.getContentSize()
        }
        return this.cellSize
    }
    createCell(data: number) {
        var node = cc.instantiate(this.cellPrefab)
        var cell = node.getComponent(Cell)
        cell.setData(data)
        return cell
    }
    getCellFullSize() {
        return cc.size(this.cellSize.width * this.scale, this.cellSize.height * this.scale)
    }
}
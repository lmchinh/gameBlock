export interface ICell {
    row: number
    col: number
}
export type BlockData = number[][]

export class BlockLogic {
    score: number

    private blockDroppedCallback: (block: Block, row: number, col: number) => void
    private cellsRemovedCallback: (cells: ICell[]) => void
    private scoreChangedCallback: (score: number, delta: number) => void
    private gameOverCallback: (score: number) => void
    private newGameCallback: () => void

    onNewGame(callback: () => void) {
        this.newGameCallback = callback
    }
    onGameOver(callback: (score: number) => void) {
        this.gameOverCallback = callback
    }
    onScoreChanged(callback: (score: number, delta: number) => void) {
        this.scoreChangedCallback = callback
    }
    onCellsRemoved(callback: (cells: ICell[]) => void) {
        this.cellsRemovedCallback = callback
    }
    onBlockDropped(callback: (block: Block, row: number, col: number) => void) {
        this.blockDroppedCallback = callback
    }
    board: Board
    blockArea: BlockArea

    constructor(size: number, blocks: Record<number, BlockData>) {
        this.board = new Board(size)
        this.blockArea = new BlockArea(blocks)
    }

    newGame(nextBlockIds?: number[]) {
        this.setScore(0)
        this.board.reset(0)
        this.blockArea.reset(nextBlockIds)
        this.newGameCallback?.()
    }
    drop(block: Block, row: number, col: number) {
        if (this.board.canDropBlockAt(block, row, col)) {
            this.board.drop(block, row, col)
            this.blockDroppedCallback(block, row, col)
            console.log(this.board.cells)
            var numberOfRowsCols = this.board.clearFullRowsCols()
            this.addScore(numberOfRowsCols * 8)
            this.blockArea.remove(block)

            console.log(this.blockArea.blocks.length)
            if (this.isGameOver()) {
                console.log("gameover", this.board.cells, this.blockArea.blocks)
                this.gameOverCallback(this.score)
                // await this.showPopupAsync()
                // this.newGame()
                // todo: raise event game over
            }
            return true
        } else {
            console.log("return block", block)
            this.blockArea.return(block)
            return false
        }
    }
    async showPopupAsync() {

    }
    isGameOver() {
        return !this.board.canDropBlocks(this.blockArea.blocks)
    }
    addScore(delta: number) {
        this.score += delta
        this.scoreChangedCallback(this.score, delta)
    }
    setScore(value: number) {
        this.score = value
        this.scoreChangedCallback(this.score, 0)
    }
}

class Cells {
    cells: BlockData // 0: trong, khac 0: co cell
    get rows() {
        return this.cells.length
    }
    get cols() {
        return this.cells[0]?.length ?? 0
    }

    reset(value = 0) {
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.cols; c++) {
                this.cells[r][c] = value
            }
        }
    }
    protected createCells(size: number, value = 0) {
        var cells = []
        for (var r = 0; r < size; r++) {
            cells[r] = []
            for (var c = 0; c < size; c++) {
                cells[r][c] = value
            }
        }
        return cells
    }

    getValue(row: number, col: number) {
        return this.cells[row][col]
    }
}

export class Board extends Cells {
    clearFullRowsCols() {
        // check hang
        var fullRowIndexes: number[] = []
        for (var i = 0; i < this.rows; i++) {
            if (this.isFullRow(i)) {
                fullRowIndexes.push(i)
            }
        }
        // check cot
        var fullColIndexes: number[] = []
        for (var i = 0; i < this.cols; i++) {
            if (this.isFullCol(i)) {
                fullColIndexes.push(i)
            }
        }
        // xoa theo hang
        for (var i of fullRowIndexes) {
            this.clearRow(i)
        }
        for (var i of fullColIndexes) {
            this.clearCol(i)
        }
        return fullRowIndexes.length + fullColIndexes.length
    }
    clearRow(row: number) {
        console.log("clearRow", row)
        for (var col = 0; col < this.cols; col++) {
            this.cells[row][col] = 0
        }
        console.log(this.cells)
    }
    clearCol(col: number) {
        console.log("clearCol", col)
        for (var row = 0; row < this.rows; row++) {
            this.cells[row][col] = 0
        }
    }
    private isFullRow(row: number) {
        for (var col = 0; col < this.cols; col++) {
            if (this.cells[row][col] === 0) {
                return false
            }
        }
        return true
    }
    private isFullCol(col: number) {
        for (var row = 0; row < this.rows; row++) {
            if (this.cells[row][col] === 0) {
                return false
            }
        }
        return true
    }
    drop(block: Block, row: number, col: number) {
        for (var r = 0; r < block.rows; r++) {
            for (var c = 0; c < block.cols; c++) {
                if (block.cells[r][c]) {
                    this.cells[r + row][c + col] = block.cells[r][c]
                }
            }
        }
    }
    constructor(size: number) {
        super()
        this.cells = this.createCells(size)
    }
    canDropBlockAt(block: Block, row: number, col: number) {
        // lặp qua tất cả vị trí các ô trong khối
        for (var blockRow = 0; blockRow < block.rows; blockRow++) {
            for (var blockCol = 0; blockCol < block.cols; blockCol++) {
                // Xác định vị trí ô trong bàn chơi
                var boardRow = row + blockRow
                var boardCol = col + blockCol
                // Kiểm tra vị trí nằm ngoài bàn chơi
                if (boardRow < 0 || boardRow >= this.rows || boardCol < 0 || boardCol >= this.cols) {
                    return false
                }
                // Giá trị của ô trong bàn chơi
                var boardValue = this.getValue(boardRow, boardCol)
                // Giá trị của ô trong khối
                var blockValue = block.getValue(blockRow, blockCol)
                // Nếu cả 2 đều có giá trị
                if (boardValue && blockValue) {
                    return false
                }
            }
        }
        return true
    }
    // check xem 1 khối có thể thả vào bất kỳ vị trí nào trong bàn chơi hay ko
    private canDropBlock(block: Block) {
        // lặp qua tất cả các vị trí các ô trong bàn chơi
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.cols; c++) {
                if (this.canDropBlockAt(block, r, c)) {
                    return true
                }
            }
        }
        return false
    }
    canDropBlocks(blocks: Block[]) {
        // lặp qua từng khối
        for (var m of blocks) {
            if (this.canDropBlock(m)) {
                return true
            }
        }
        return false
    }
}

export class BlockArea {
    return(block: Block) {

    }
    remove(block: Block) {
        var index = this.blocks.indexOf(block)
        if (index >= 0) {
            this.blocks.splice(index, 1)
        }
        if (this.blocks.length === 0) {
            this.createBlocks()
        }
    }
    private blockMap: Record<number, BlockData>
    private nextBlockIds: number[] // [1, 2, 3, 4, 5, 6]

    blocks: Block[]

    constructor(blockMap: Record<number, BlockData>) {
        this.blockMap = blockMap
    }
    reset(nextBlockIds?: number[]) {
        if (nextBlockIds) {
            this.nextBlockIds = nextBlockIds
        }
        this.createBlocks()
    }
    createBlocks(count = 3) {
        this.blocks = []
        for (var i = 0; i < count; i++) {
            // tao block
            var block = this.createBlock()
            // dua vao danh sach
            this.blocks.push(block)
        }
    }
    createBlock() {
        var id = this.nextBlockIds ? this.nextBlockIds.shift() : this.getRandomBlockId()
        var data = this.blockMap[id]
        return new Block(id, data)
    }
    getRandomBlockId() {
        return this.randomItem(Object.keys(this.blockMap))
    }
    randomItem(array: any[]) {
        return array[Math.floor(Math.random() * array.length)]
    }
}

export class Block extends Cells {
    constructor(public id: number, data: BlockData) {
        super()
        this.cells = data
    }
}


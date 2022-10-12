import * as logics from "../logics/BlockLogic"
import Block from "./Block";

@cc._decorator.ccclass()
export default class extends cc.Component {
    removeBlock(block: Block) {
        block.node.removeFromParent()
        this.blocks = this.blocks.filter(m => m != block)
        if (this.blocks.length == 0) {
            this.setData(this.data)
        }
    }
    @cc._decorator.property(cc.Prefab) blockPrefab: cc.Prefab = null
    @cc._decorator.property(cc.Layout) layout: cc.Layout = null

    data: logics.BlockArea
    blocks: Block[]

    setData(data: logics.BlockArea) {
        this.layout
        this.data = data
        this.node.removeAllChildren()

        this.blocks = []
        for (let m of data.blocks) {
            var block = this.createBlock(m)
            this.node.addChild(block.node)
            this.blocks.push(block)
        }
        // todo: 
        this.layout.enabled = true
        this.layout.updateLayout()
        this.layout.enabled = false

        for (let m of this.blocks) {
            m.saveState()
        }
    }
    createBlock(data: logics.Block) {
        var node = cc.instantiate(this.blockPrefab)
        var block = node.getComponent(Block)
        block.setData(data)
        return block
    }
    returnBlock(block: Block) {
        block.resetState()
    }
}
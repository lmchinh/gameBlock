const COLORS = [cc.Color.GRAY, cc.Color.MAGENTA, cc.Color.CYAN, cc.Color.RED, cc.Color.GREEN, cc.Color.YELLOW, cc.Color.BLUE]

@cc._decorator.ccclass()
export default class extends cc.Component {
    data: number
    allowTransparent: boolean

    setData(data: number, allowTransparent = false) {
        this.data = data
        this.allowTransparent = allowTransparent
        this.updateUI()
    }
    updateUI() {
        if (this.data || !this.allowTransparent) {
            this.node.opacity = 255
            this.node.color = COLORS[this.data]
        } else {
            this.node.opacity = 0
        }
    }
}
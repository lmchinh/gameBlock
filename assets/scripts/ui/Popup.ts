@cc._decorator.ccclass()
export default class extends cc.Component {
    @cc._decorator.property(cc.Label) score: cc.Label = null
    @cc._decorator.property(cc.Button) button: cc.Button = null

    async openAsync(score: number) {
        this.node.active = true
        this.node.opacity = 0
        this.node.scale = 0.2
        cc.tween(this.node)
            .to(0.5, { scale: 1, opacity: 255 }, { easing: "quartInOut" })
            .start()
        this.score.string = `Score: ${score}`
    }

    hide() {
        cc.tween(this.node)
            .to(0.5, { scale: 0.2, opacity: 0 }, { easing: "quartInOut" })
            .call(() => { this.node.active = false })
            .start()
    }

}
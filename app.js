class PlayArea extends React.Component {
    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.state = {
            userWidth: 25,
            userHeight: 25,
            userMovementDistance: 5,
            playAreaWidth: 300,
            playAreaHeight: 300,
            userLocationX: 140,
            eyePosition: "left",
            rainDrops: []
        };
        this.dropTick = setInterval(() => this.tick(), 50);
    }

    componentDidMount() {
        this.divRef.current.focus();
    }

    movePlayer(event) {
        if (event.keyCode == 37) {
            this.state.eyePosition = "left";
            if (this.state.userLocationX >= 5) {
                this.setState({
                    userLocationX: (this.state.userLocationX -= this.state.userMovementDistance)
                });
            }
        } else if (event.keyCode == 39) {
            this.state.eyePosition = "right";
            if (
                this.state.userLocationX <=
                this.state.playAreaWidth -
                    this.state.userWidth -
                    this.state.userMovementDistance
            ) {
                this.setState({
                    userLocationX: (this.state.userLocationX += this.state.userMovementDistance)
                });
            }
        }
    }

    generateRainDrops() {
        this.setState({
            rainDrops: _.concat(
                this.state.rainDrops,
                {
                    x:
                        Math.floor(
                            Math.random() * this.state.playAreaWidth - 5
                        ) + 5,
                    y: 0
                },
                {
                    x:
                        Math.floor(
                            Math.random() * this.state.playAreaWidth - 5
                        ) + 5,
                    y: 0
                },
                {
                    x:
                        Math.floor(
                            Math.random() * this.state.playAreaWidth - 5
                        ) + 5,
                    y: 0
                },
                {
                    x:
                        Math.floor(
                            Math.random() * this.state.playAreaWidth - 5
                        ) + 5,
                    y: 0
                },
                {
                    x:
                        Math.floor(
                            Math.random() * this.state.playAreaWidth - 5
                        ) + 5,
                    y: 0
                }
            )
        });
    }

    resetRainDrops() {
        var resetDrops = [];
        for (var drop of this.state.rainDrops) {
            resetDrops.push({
                x: Math.floor(Math.random() * this.state.playAreaWidth - 5),
                y: 0
            });
        }
        this.setState({
            rainDrops: resetDrops
        });
    }

    dropRain() {
        var updatedDrops = [];
        for (var drop of this.state.rainDrops) {
            updatedDrops.push({ x: drop.x, y: (drop.y += 5) });
        }
        this.setState({
            rainDrops: updatedDrops
        });
    }

    checkForGameOver() {
        if (
            this.state.rainDrops[0].y >=
            this.state.playAreaHeight - (this.state.userHeight + 15)
        ) {
            for (var drop of this.state.rainDrops) {
                if (
                    drop.x + 5 >= this.state.userLocationX &&
                    drop.x <= this.state.userLocationX + this.state.userWidth
                ) {
                    this.resetTotalState();
                }
            }
        }
    }

    tick() {
        if (this.state.rainDrops.length == 0) {
            this.generateRainDrops();
        }
        this.checkForGameOver();
        if (this.state.rainDrops[0].y > this.state.playAreaHeight - 20) {
            this.resetRainDrops();
        }
        this.dropRain();
    }

    resetTotalState() {
        this.setState({
            userWidth: 25,
            userHeight: 25,
            userMovementDistance: 5,
            playAreaWidth: 300,
            playAreaHeight: 300,
            userLocationX: 140,
            eyePosition: "left",
            rainDrops: []
        });
    }

    render() {
        var playAreaStyle = {
            width: this.state.playAreaWidth + "px",
            height: this.state.playAreaHeight + "px"
        };
        return (
            <div
                ref={this.divRef}
                id="playAreaContainer"
                style={playAreaStyle}
                tabIndex="0"
                onKeyDown={event => this.movePlayer(event)}
            >
                {this.state.rainDrops.map((drop, key) => (
                    <RainDrop key={key} x={drop.x} y={drop.y} />
                ))}
                <div id="userArea">
                    <User
                        position={this.state.userLocationX}
                        height={this.state.userHeight}
                        width={this.state.userWidth}
                        eyePosition={this.state.eyePosition}
                    />
                </div>
            </div>
        );
    }
}

class User extends React.Component {
    render() {
        var userStyle = {
            height: this.props.height,
            width: this.props.width,
            left: this.props.position + "px"
        };
        var userInsideStyle = {
            float: this.props.eyePosition
        };
        return (
            <div style={userStyle} id="userIcon">
                <div id="userHeadband" />
                <div style={userInsideStyle} id="userEye" />
            </div>
        );
    }
}

class RainDrop extends React.Component {
    render() {
        var rainDropStyle = {
            left: this.props.x + "px",
            top: this.props.y + "px"
        };
        return <div style={rainDropStyle} className="rainDrop" />;
    }
}

ReactDOM.render(<PlayArea />, document.getElementById("root"));

class App extends React.Component {
    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.state = {
            gameOver: false,
            userWidth: 25,
            userHeight: 25,
            userMovementDistance: 8,
            userSlideDistance: 24,
            playAreaWidth: 300,
            playAreaHeight: 300,
            userLocationX: 140,
            eyePosition: "left",
            rainDrops: [],
            userScore: 0
        };
        this.dropTick = setInterval(() => this.tick(), 30);
    }

    componentDidMount() {
        this.divRef.current.focus();
    }

    render() {
        var userAreaStyle = {
            width: this.state.playAreaWidth + "px",
            height: this.state.playAreaHeight + "px"
        };
        return (
            <div
                ref={this.divRef}
                id="appContainer"
                tabIndex="0"
                onKeyDown={event => (
                    this.movePlayer(event),
                    this.restartGame(event),
                    this.slidePlayer(event)
                )}
            >
                <div id="scoreArea">
                    <p>Your Score: {this.state.userScore}</p>
                </div>
                <div style={userAreaStyle} id="userArea">
                    {this.state.rainDrops.map((drop, key) => (
                        <RainDrop key={key} x={drop.x} y={drop.y} />
                    ))}
                    <User
                        position={this.state.userLocationX}
                        height={this.state.userHeight}
                        width={this.state.userWidth}
                        eyePosition={this.state.eyePosition}
                    />
                    <div id="modalContainer">
                        <Modal isGameOver={this.state.gameOver} />
                    </div>
                </div>
            </div>
        );
    }

    restartGame(event) {
        if (this.state.gameOver) {
            if (event.keyCode == 13) {
                this.resetTotalState();
            }
        }
    }

    movePlayer(event) {
        if (!this.state.gameOver) {
            if (event.keyCode == 37) {
                this.state.eyePosition = "left";
                if (
                    this.state.userLocationX >= this.state.userMovementDistance
                ) {
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
    }

    slidePlayer(event) {
        if (!this.state.gameOver) {
            if (event.keyCode == 40) {
                if (this.state.eyePosition == "left") {
                    if (
                        this.state.userLocationX <=
                        this.state.playAreaWidth -
                            this.state.userWidth -
                            this.state.userSlideDistance
                    ) {
                        this.setState({
                            userLocationX: (this.state.userLocationX += this.state.userSlideDistance)
                        });
                    } else {
                        this.setState({
                            userLocationX:
                                this.state.playAreaWidth - this.state.userWidth
                        });
                    }
                } else if (this.state.eyePosition == "right") {
                    if (
                        this.state.userLocationX >= this.state.userSlideDistance
                    ) {
                        this.setState({
                            userLocationX: (this.state.userLocationX -= this.state.userSlideDistance)
                        });
                    } else {
                        this.setState({
                            userLocationX: 0
                        });
                    }
                }
            }
        }
    }

    generateRainDrops() {
        this.setState({
            rainDrops: _.concat(
                this.state.rainDrops,
                {
                    x: Math.random() * (this.state.playAreaWidth - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (this.state.playAreaWidth - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (this.state.playAreaWidth - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (this.state.playAreaWidth - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (this.state.playAreaWidth - 16) + 16,
                    y: 0
                }
            )
        });
    }

    getTotalRainDrops() {
        var score = this.state.userScore;
        if (score < 2500) {
            return 6;
        } else if (score < 5000) {
            return 8;
        } else if (score < 7500) {
            return 10;
        } else if (score < 10000) {
            return 12;
        } else {
            return 15;
        }
    }

    resetRainDrops() {
        var resetDrops = [];
        for (var i = 0; i < this.getTotalRainDrops(); i++) {
            resetDrops.push({
                x: Math.random() * (this.state.playAreaWidth - 16 - 16) + 16,
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

    addPoints() {
        var originalScore = this.state.userScore;
        this.setState({
            userScore: originalScore + 5
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
                    this.setState({
                        gameOver: true
                    });
                }
            }
        }
    }

    tick() {
        if (this.state.rainDrops.length == 0) {
            this.generateRainDrops();
        }
        this.checkForGameOver();
        if (!this.state.gameOver) {
            if (this.state.rainDrops[0].y > this.state.playAreaHeight - 20) {
                this.resetRainDrops();
            }
            this.addPoints();
            this.dropRain();
        }
    }

    resetTotalState() {
        this.setState({
            gameOver: false,
            userWidth: 25,
            userHeight: 25,
            userMovementDistance: 5,
            userSlideDistance: 24,
            playAreaWidth: 300,
            playAreaHeight: 300,
            userLocationX: 140,
            eyePosition: "left",
            rainDrops: [],
            userScore: 0
        });
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

class Modal extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (!this.props.isGameOver) {
            return <div />;
        } else {
            return (
                <div id="gameModal">
                    <p id="modalText">Game Over</p>
                </div>
            );
        }
    }
}

ReactDOM.render(<App />, document.getElementById("root"));

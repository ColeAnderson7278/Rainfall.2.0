const HEIGHT = 300,
    WIDTH = 300,
    MOVEMENT_DISTANCE = 8,
    SLIDE_DISTANCE = 24,
    USER_HEIGHT = 25,
    USER_WIDTH = 25;

const START_STATE = {
    gameOver: false,
    formSubmitted: false,
    user: {
        locationX: 140,
        direction: "left"
    },
    rainDrops: [],
    userScore: 0,
    highScores: []
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.state = START_STATE;
        this.dropTick = setInterval(() => this.tick(), 30);
    }

    componentDidMount() {
        this.getHighScores();
        this.divRef.current.focus();
    }

    getHighScores() {
        fetch("https://rainfall-backend.herokuapp.com/high-scores")
            .then(res => res.json())
            .then(highScores => this.setState({ highScores: highScores }))
            .catch(error => console.error("Error:", error));
    }

    scoreSubmitted() {
        this.setState({ formSubmitted: true });
    }

    render() {
        var userAreaStyle = {
            width: WIDTH + "px",
            height: HEIGHT + "px"
        };
        var floorStyle = {
            width: WIDTH + "px"
        };
        return (
            <div
                ref={this.divRef}
                id="appContainer"
                tabIndex="0"
                onKeyDown={event => (
                    this.movePlayer(event), this.restartGame(event)
                )}
                onKeyUp={event => this.rollPlayer(event)}
            >
                <div id="highScoreGameAreaContainer">
                    <div>
                        <div id="scoreArea">
                            <p>Your Score: {this.state.userScore}</p>
                        </div>
                        <div style={userAreaStyle} id="userArea">
                            <Controls />
                            {this.state.rainDrops.map((drop, key) => (
                                <RainDrop key={key} x={drop.x} y={drop.y} />
                            ))}
                            <User
                                locationX={this.state.user.locationX}
                                userHeight={USER_HEIGHT}
                                userWidth={USER_WIDTH}
                                direction={this.state.user.direction}
                            />
                            <div id="modalContainer">
                                <Modal isGameOver={this.state.gameOver} />
                            </div>
                        </div>
                        <div style={floorStyle} id="floor">
                            {Array(18).fill(<div className="floorBoard" />)}
                        </div>
                        <ScoreForm
                            isGameOver={this.state.gameOver}
                            isFormSubmitted={this.state.formSubmitted}
                            userScore={this.state.userScore}
                            onSubmit={() => (
                                this.scoreSubmitted(),
                                this.divRef.current.focus()
                            )}
                        />
                    </div>
                    <div>
                        <div id="highScoresContainer">
                            <p id="highScoreHeader">High Scores:</p>
                            <hr />
                            {this.state.highScores.map((score, key) => (
                                <HighScore
                                    key={key}
                                    name={score.name}
                                    number={score.number}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    restartGame(event) {
        if (this.state.gameOver) {
            if (event.keyCode == 38) {
                this.resetTotalState();
            }
        }
    }

    movePlayer(event) {
        if (!this.state.gameOver) {
            if (event.keyCode == 37) {
                this.state.user.direction = "left";
                if (this.state.user.locationX >= MOVEMENT_DISTANCE) {
                    this.setState({
                        user: {
                            locationX: (this.state.user.locationX -= MOVEMENT_DISTANCE),
                            direction: "left"
                        }
                    });
                } else {
                    this.setState({
                        user: {
                            locationX: 0,
                            direction: "left"
                        }
                    });
                }
            } else if (event.keyCode == 39) {
                this.state.user.direction = "right";
                if (
                    this.state.user.locationX <=
                    WIDTH - USER_WIDTH - MOVEMENT_DISTANCE
                ) {
                    this.setState({
                        user: {
                            locationX: (this.state.user.locationX += MOVEMENT_DISTANCE),
                            direction: "right"
                        }
                    });
                } else {
                    this.setState({
                        user: {
                            locationX: WIDTH - USER_WIDTH,
                            direction: "right"
                        }
                    });
                }
            }
        }
    }

    rollPlayer(event) {
        if (!this.state.gameOver) {
            if (event.keyCode == 40) {
                if (this.state.user.direction == "left") {
                    if (
                        this.state.user.locationX <=
                        WIDTH - USER_WIDTH - SLIDE_DISTANCE
                    ) {
                        this.setState({
                            userLocationX: (this.state.user.locationX += SLIDE_DISTANCE)
                        });
                    } else {
                        this.setState({
                            userLocationX: WIDTH - USER_WIDTH
                        });
                    }
                } else if (this.state.user.direction == "right") {
                    if (this.state.user.locationX >= SLIDE_DISTANCE) {
                        this.setState({
                            userLocationX: (this.state.user.locationX -= SLIDE_DISTANCE)
                        });
                    } else {
                        highScores: [];
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
                    x: Math.random() * (WIDTH - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (WIDTH - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (WIDTH - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (WIDTH - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (WIDTH - 16) + 16,
                    y: 0
                },
                {
                    x: Math.random() * (WIDTH - 16) + 16,
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
                x: Math.random() * (WIDTH - 16 - 16) + 16,
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
            updatedDrops.push({
                x: (drop.x += drop.x > this.state.user.locationX + 10 ? -1 : 1),
                y: (drop.y += 5)
            });
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
        if (this.state.rainDrops[0].y >= HEIGHT - (USER_HEIGHT + 15)) {
            for (var drop of this.state.rainDrops) {
                if (
                    drop.x + 5 >= this.state.user.locationX &&
                    drop.x <= this.state.user.locationX + USER_WIDTH
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
            if (this.state.rainDrops[0].y > HEIGHT - 20) {
                this.resetRainDrops();
            }
            this.addPoints();
            this.dropRain();
        }
    }

    resetTotalState() {
        this.setState(START_STATE);
        this.getHighScores();
    }
}

function User({ userHeight, userWidth, locationX, direction }) {
    return (
        <div
            style={{ height: userHeight, width: userWidth, left: locationX }}
            id="userIcon"
        >
            <div id="userHeadband" />
            <div style={{ float: direction }} id="userEye" />
        </div>
    );
}

function RainDrop({ x, y }) {
    return <div style={{ left: x, top: y }} className="rainDrop" />;
}

function Modal({ isGameOver }) {
    if (!isGameOver) {
        return <div />;
    } else {
        return (
            <div id="gameModal">
                {Array(12).fill(<div className="curtain" />)}
                <p id="modalText">Game Over</p>
                <div id="modalControlInfo">
                    <i class="fas fa-arrow-up" />
                    <p>To Reset Game</p>
                </div>
            </div>
        );
    }
}

class ScoreForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        fetch("https://rainfall-backend.herokuapp.com/new-score", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({
                name: this.input.value,
                number: this.props.userScore
            })
        }).then(() => this.props.onSubmit());
        event.preventDefault();
    }

    render() {
        if (this.props.isGameOver && !this.props.isFormSubmitted) {
            return (
                <form id="scoreForm" onSubmit={this.handleSubmit}>
                    <label>
                        <input
                            required
                            id="playerNameInput"
                            placeholder="Enter name then submit or hit restart key"
                            minLength="1"
                            maxLength="10"
                            type="text"
                            ref={input => (this.input = input)}
                        />
                    </label>
                    <input
                        id="scoreFormSubmitBtn"
                        type="submit"
                        value="Submit"
                    />
                </form>
            );
        } else {
            return <div />;
        }
    }
}

function HighScore({ name, number }) {
    return (
        <div className="userInfoContainer">
            <p className="userName">{name}</p>
            <p className="userScore">{number}</p>
        </div>
    );
}

function Controls() {
    return (
        <div id="controlsContainer">
            <div id="controlsInfo">
                <i class="fas fa-arrow-left" />
                <p>Move Left</p>
            </div>
            <div id="controlsInfo">
                <i class="fas fa-arrow-down" />
                <p>Back Roll</p>
            </div>
            <div id="controlsInfo">
                <i class="fas fa-arrow-right" />
                <p>Move Right</p>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));

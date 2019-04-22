const HEIGHT = 300,
    WIDTH = 500,
    RAIN_WIDTH = 7,
    RAIN_HEIGHT = 16,
    RAIN_FALL_DISTANCE = 5,
    POWER_UP_WIDTH = 24,
    POWER_UP_HEIGHT = 24,
    POWER_UP_FALL_DISTANCE = 3,
    MOVEMENT_DISTANCE = 8,
    SLIDE_DISTANCE = 40,
    USER_HEIGHT = 28,
    USER_WIDTH = 28;

const START_STATE = {
    gameOver: false,
    formSubmitted: false,
    user: {
        locationX: 250 - USER_WIDTH / 2,
        direction: "left"
    },
    rainDrops: [],
    powerUps: [],
    userScore: 0,
    highScores: [],
    isRolling: false,
    userHealthAmount: 0,
    deathAudioRan: false
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.state = START_STATE;
        this.dropTick = setInterval(() => this.tick(), 30);
        this.dropRainTick = setInterval(() => this.generateRainTick(), 300);
        this.dropPowerUpTick = setInterval(
            () => this.generatePowerUpsTick(),
            12500
        );
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
                onKeyUp={event => (
                    this.rollPlayer(event), this.stopRoll(event)
                )}
            >
                <div id="highScoreGameAreaContainer">
                    <div>
                        <div id="scoreArea">
                            <p>Your Score: {this.state.userScore}</p>
                        </div>
                        <div style={userAreaStyle} id="userArea">
                            <Controls />
                            {this.state.rainDrops.map((drop, key) => (
                                <RainDrop
                                    key={key}
                                    x={drop.x}
                                    y={drop.y}
                                    width={RAIN_WIDTH}
                                    height={RAIN_HEIGHT}
                                />
                            ))}
                            <PowerUpDisplay
                                userHealthAmount={this.state.userHealthAmount}
                            />
                            <Controls />
                            {this.state.powerUps.map((powerUp, key) => (
                                <PowerUp
                                    key={key}
                                    x={powerUp.x}
                                    y={powerUp.y}
                                    height={POWER_UP_HEIGHT}
                                    width={POWER_UP_WIDTH}
                                />
                            ))}
                            <User
                                locationX={this.state.user.locationX}
                                userHeight={USER_HEIGHT}
                                userWidth={USER_WIDTH}
                                direction={this.state.user.direction}
                                isRolling={this.state.isRolling}
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
                    <HighScoreContainer highScores={this.state.highScores} />
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
                        AudioPlayer.rollAudio();
                        this.setState({
                            user: {
                                locationX: (this.state.user.locationX += SLIDE_DISTANCE),
                                direction: "left"
                            },
                            isRolling: true
                        });
                    } else {
                        AudioPlayer.rollAudio();
                        this.setState({
                            user: {
                                locationX: WIDTH - USER_WIDTH,
                                direction: "left"
                            },
                            isRolling: true
                        });
                    }
                } else if (this.state.user.direction == "right") {
                    if (this.state.user.locationX >= SLIDE_DISTANCE) {
                        AudioPlayer.rollAudio();
                        this.setState({
                            user: {
                                locationX: (this.state.user.locationX -= SLIDE_DISTANCE),
                                direction: "right"
                            },
                            isRolling: true
                        });
                    } else {
                        AudioPlayer.rollAudio();
                        this.setState({
                            user: { locationX: 0, direction: "right" },
                            isRolling: true
                        });
                    }
                }
            }
        }
    }

    stopRoll(event) {
        if (event.keyCode == 40) {
            setTimeout(() => {
                this.setState({
                    isRolling: false
                });
            }, 200);
        }
    }

    dropRain() {
        var updatedDrops = [];
        for (var drop of this.state.rainDrops) {
            updatedDrops.push({
                x: (drop.x += drop.x > this.state.user.locationX + 6 ? -1 : 1),
                y: (drop.y += RAIN_FALL_DISTANCE)
            });
        }
        this.setState({
            rainDrops: updatedDrops
        });
    }

    dropPowerUp() {
        var updatedPowerUps = [];
        for (var powerUp of this.state.powerUps) {
            updatedPowerUps.push({
                x: powerUp.x,
                y: (powerUp.y += POWER_UP_FALL_DISTANCE)
            });
        }
        this.setState({
            powerUps: updatedPowerUps
        });
    }

    addPoints() {
        var originalScore = this.state.userScore;
        this.setState({
            userScore: originalScore + 5
        });
    }

    didDropHit(x, y) {
        if (
            x + RAIN_WIDTH >= this.state.user.locationX &&
            x <= this.state.user.locationX + USER_WIDTH &&
            y >= HEIGHT - USER_HEIGHT - RAIN_HEIGHT
        ) {
            return true;
        } else {
            false;
        }
    }

    checkForGameOver() {
        for (var drop of this.state.rainDrops) {
            if (
                this.didDropHit(drop.x, drop.y) &&
                this.state.userHealthAmount <= 0
            ) {
                this.setState({
                    gameOver: true
                });
            } else if (
                this.didDropHit(drop.x, drop.y) &&
                this.state.userHealthAmount > 0
            ) {
                AudioPlayer.hitAudio();
                this.setState({
                    rainDrops: this.state.rainDrops.filter(
                        drop => !this.didDropHit(drop.x, drop.y)
                    ),
                    userHealthAmount: this.state.userHealthAmount - 1
                });
            }
        }
    }

    didPowerUpHit(x, y) {
        if (
            x + POWER_UP_HEIGHT >= this.state.user.locationX &&
            x <= this.state.user.locationX + USER_WIDTH &&
            y >= HEIGHT - USER_HEIGHT - POWER_UP_HEIGHT
        ) {
            return true;
        } else {
            return false;
        }
    }

    checkForAcquiredPowerUp() {
        for (var powerUp of this.state.powerUps) {
            if (
                this.didPowerUpHit(powerUp.x, powerUp.y) &&
                this.state.userHealthAmount < 3
            ) {
                AudioPlayer.collectAudio();
                this.setState({
                    powerUps: this.state.powerUps.filter(
                        powerUp => !this.didPowerUpHit(powerUp.x, powerUp.y)
                    ),
                    userHealthAmount: this.state.userHealthAmount + 1
                });
            } else {
                this.setState({
                    powerUps: this.state.powerUps.filter(
                        powerUp => !this.didPowerUpHit(powerUp.x, powerUp.y)
                    )
                });
            }
        }
    }

    generateRainDrop() {
        this.setState({
            rainDrops: _.concat(this.state.rainDrops, {
                x: Math.random() * (WIDTH - RAIN_HEIGHT) + RAIN_HEIGHT,
                y: 0
            })
        });
    }

    generatePowerUp() {
        this.setState({
            powerUps: _.concat(this.state.powerUps, {
                x: Math.random() * (WIDTH - POWER_UP_HEIGHT) + POWER_UP_HEIGHT,
                y: 0
            })
        });
    }

    checkRainDrops() {
        this.setState({
            rainDrops: this.state.rainDrops.filter(
                drop => drop.y < HEIGHT - RAIN_HEIGHT
            )
        });
    }

    checkPowerUps() {
        this.setState({
            powerUps: this.state.powerUps.filter(
                powerUp => powerUp.y < HEIGHT - POWER_UP_HEIGHT
            )
        });
    }

    generateRainTick() {
        if (this.state.rainDrops.length >= 0) {
            this.generateRainDrop();
        }
    }

    generatePowerUpsTick() {
        if (this.state.powerUps.length >= 0) {
            this.generatePowerUp();
        }
    }

    tick() {
        this.checkForGameOver();
        this.checkForAcquiredPowerUp();
        if (!this.state.gameOver) {
            this.checkRainDrops();
            this.checkPowerUps();
            this.addPoints();
            this.dropRain();
            this.dropPowerUp();
        } else if (this.state.gameOver && !this.state.deathAudioRan) {
            AudioPlayer.charDeathAudio();
            this.setState({
                deathAudioRan: true
            });
        }
    }

    resetTotalState() {
        this.setState(START_STATE);
        this.getHighScores();
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
                            placeholder="Enter name then submit or reset the game"
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

class AudioPlayer extends React.Component {
    static charDeathAudio() {
        let audio = new Audio("audio_folder/char_death_sound_effect.mp3");
        return audio.play();
    }

    static rollAudio() {
        let audio = new Audio("audio_folder/roll_sound_effect.mp3");
        return audio.play();
    }

    static hitAudio() {
        let audio = new Audio("audio_folder/hit_sound_effect.mp3");
        return audio.play();
    }

    static collectAudio() {
        let audio = new Audio("audio_folder/collect_sound_effect.mp3");
        return audio.play();
    }
}

function User({ userHeight, userWidth, locationX, direction, isRolling }) {
    if (!isRolling) {
        return (
            <div
                style={{
                    height: userHeight,
                    width: userWidth,
                    left: locationX
                }}
                id="userIcon"
            >
                <div id="userHeadband" />
                <div style={{ float: direction }} id="userEye" />
            </div>
        );
    } else {
        if (direction == "left") {
            return (
                <div
                    className="rollingLeft"
                    style={{
                        height: userHeight,
                        width: userWidth,
                        left: locationX
                    }}
                    id="userIcon"
                >
                    <div id="userHeadband" />
                    <div style={{ float: direction }} id="userEye" />
                </div>
            );
        } else {
            return (
                <div
                    className="rollingRight"
                    style={{
                        height: userHeight,
                        width: userWidth,
                        left: locationX
                    }}
                    id="userIcon"
                >
                    <div id="userHeadband" />
                    <div style={{ float: direction }} id="userEye" />
                </div>
            );
        }
    }
}

function RainDrop({ x, y, width, height }) {
    return (
        <div
            style={{ left: x, top: y, width: width, height: height }}
            className="rainDrop"
        />
    );
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
                    <i className="fas fa-arrow-up" />
                    <p>To Reset Game</p>
                </div>
            </div>
        );
    }
}

function HighScore({ name, number }) {
    return (
        <div className="userInfoContainer">
            <p className="userName">{name} -</p>
            <p className="userScore">{number}</p>
        </div>
    );
}

function HighScoreContainer({ highScores }) {
    return (
        <div>
            <div id="highScoresContainer">
                <p id="highScoreHeader">High Scores:</p>
                {highScores.map((score, key) => (
                    <HighScore
                        key={key}
                        name={score.name}
                        number={score.number}
                    />
                ))}
            </div>
        </div>
    );
}

function Controls() {
    return (
        <div id="controlsContainer">
            <div id="controlsInfo">
                <i className="fas fa-arrow-left" />
                <p>Move Left</p>
            </div>
            <div id="controlsInfo">
                <i className="fas fa-arrow-down" />
                <p>Back Roll</p>
            </div>
            <div id="controlsInfo">
                <i className="fas fa-arrow-right" />
                <p>Move Right</p>
            </div>
        </div>
    );
}

function PowerUp({ x, y, height, width }) {
    return (
        <div
            style={{ left: x, top: y, height: height, width: width }}
            className="powerUp"
        >
            <div class="bar horizontal" />
            <div class="bar vertical" />
        </div>
    );
}

function PowerUpDisplay({ userHealthAmount }) {
    return (
        <div id="powerUpDisplayContainer">
            <i id="heartIcon" class="fas fa-heart" />
            <p id="userHealthIndicator">x{userHealthAmount}</p>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));

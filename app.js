const PLAY_AREA = {
        HEIGHT: 300,
        WIDTH: 500
    },
    RAIN = {
        WIDTH: 7,
        HEIGHT: 16,
        FALL_DISTANCE: 5
    },
    HEALTH_PACK = {
        WIDTH: 24,
        HEIGHT: 24,
        FALL_DISTANCE: 3
    },
    USER = {
        HEIGHT: 28,
        WIDTH: 28,
        MOVEMENT_DISTANCE: 8,
        SLIDE_DISTANCE: 40
    };

const START_STATE = {
    gameOver: false,
    formSubmitted: false,
    user: {
        locationX: PLAY_AREA.WIDTH / 2 - USER.WIDTH / 2,
        direction: "left"
    },
    rainDrops: [],
    healthPacks: [],
    userScore: 0,
    highScores: [],
    rainfallSpeed: 250,
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
        this.dropRainTick = setInterval(
            () => this.generateRainTick(),
            this.state.rainfallSpeed
        );
        this.dropHealthPackTick = setInterval(
            () => this.generateHealthPacksTick(),
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
            .then(highScores =>
                this.setState(() => ({ highScores: highScores }))
            )
            .catch(error => console.error("Error:", error));
    }

    scoreSubmitted() {
        this.setState(() => ({ formSubmitted: true }));
    }

    render() {
        var userAreaStyle = {
            width: PLAY_AREA.WIDTH + "px",
            height: PLAY_AREA.HEIGHT + "px"
        };
        var floorStyle = {
            width: PLAY_AREA.WIDTH + "px"
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
                                    width={RAIN.WIDTH}
                                    height={RAIN.HEIGHT}
                                />
                            ))}
                            <HealthPackDisplay
                                userHealthAmount={this.state.userHealthAmount}
                            />
                            <Controls />
                            {this.state.healthPacks.map((health, key) => (
                                <HealthPack
                                    key={key}
                                    x={health.x}
                                    y={health.y}
                                    height={HEALTH_PACK.HEIGHT}
                                    width={HEALTH_PACK.WIDTH}
                                />
                            ))}
                            <User
                                locationX={this.state.user.locationX}
                                userHeight={USER.HEIGHT}
                                userWidth={USER.WIDTH}
                                direction={this.state.user.direction}
                                isRolling={this.state.isRolling}
                            />
                            <div id="modalContainer">
                                <GameOverModal
                                    isGameOver={this.state.gameOver}
                                />
                            </div>
                        </div>
                        <div style={floorStyle} id="floor">
                            {Array(18)
                                .fill(null)
                                .map((_, index) => (
                                    <div key={index} className="floorBoard" />
                                ))}
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
                this.setState(START_STATE);
                this.getHighScores();
            }
        }
    }

    movePlayer(event) {
        var user = {
            locationX: this.state.user.locationX,
            direction: this.state.user.direction
        };
        if (!this.state.gameOver) {
            if (event.keyCode == 37) {
                if (this.state.user.locationX >= USER.MOVEMENT_DISTANCE) {
                    user.locationX = this.state.user.locationX -=
                        USER.MOVEMENT_DISTANCE;
                } else {
                    user.locationX = 0;
                }
                user.direction = "left";
            } else if (event.keyCode == 39) {
                if (
                    this.state.user.locationX <=
                    PLAY_AREA.WIDTH - USER.WIDTH - USER.MOVEMENT_DISTANCE
                ) {
                    user.locationX = this.state.user.locationX +=
                        USER.MOVEMENT_DISTANCE;
                } else {
                    user.locationX = PLAY_AREA.WIDTH - USER.WIDTH;
                }
                user.direction = "right";
            }
            this.setState(() => ({
                user: { locationX: user.locationX, direction: user.direction }
            }));
        }
    }

    rollPlayer(event) {
        var user = {
            locationX: this.state.user.locationX,
            direction: this.state.user.direction,
            isRolling: this.state.isRolling
        };
        if (!this.state.gameOver) {
            if (event.keyCode == 40) {
                AudioPlayer.rollAudio();
                if (this.state.user.direction == "left") {
                    user.direction = "left";
                    user.isRolling = true;
                    if (
                        this.state.user.locationX <=
                        PLAY_AREA.WIDTH - USER.WIDTH - USER.SLIDE_DISTANCE
                    ) {
                        user.locationX = this.state.user.locationX +=
                            USER.SLIDE_DISTANCE;
                    } else {
                        user.locationX = PLAY_AREA.WIDTH - USER.WIDTH;
                    }
                } else if (this.state.user.direction == "right") {
                    user.direction = "right";
                    user.isRolling = true;
                    if (this.state.user.locationX >= USER.SLIDE_DISTANCE) {
                        user.locationX = this.state.user.locationX -=
                            USER.SLIDE_DISTANCE;
                    } else {
                        user.locationX = 0;
                    }
                }
            }
            this.setState(() => ({
                user: {
                    locationX: user.locationX,
                    direction: user.direction
                },
                isRolling: user.isRolling
            }));
        }
    }

    stopRoll(event) {
        if (event.keyCode == 40) {
            setTimeout(() => {
                this.setState(() => ({
                    isRolling: false
                }));
            }, 200);
        }
    }

    dropRain() {
        var updatedDrops = [];
        for (var drop of this.state.rainDrops) {
            updatedDrops.push({
                x: (drop.x += drop.x > this.state.user.locationX + 6 ? -1 : 1),
                y: (drop.y += RAIN.FALL_DISTANCE)
            });
        }
        this.setState(() => ({
            rainDrops: updatedDrops
        }));
    }

    dropHealthPack() {
        var updatedHealthPacks = [];
        for (var healthPack of this.state.healthPacks) {
            updatedHealthPacks.push({
                x: healthPack.x,
                y: (healthPack.y += HEALTH_PACK.FALL_DISTANCE)
            });
        }
        this.setState(() => ({
            healthPacks: updatedHealthPacks
        }));
    }

    addPoints() {
        var originalScore = this.state.userScore;
        this.setState(() => ({
            userScore: originalScore + 5
        }));
    }

    didDropHit(x, y) {
        if (
            x + RAIN.WIDTH >= this.state.user.locationX &&
            x <= this.state.user.locationX + USER.WIDTH &&
            y >= PLAY_AREA.HEIGHT - USER.HEIGHT - RAIN.HEIGHT
        ) {
            return true;
        } else {
            false;
        }
    }

    checkForGameOver() {
        var gameOver = this.state.isGameOver;
        var drops = this.state.rainDrops;
        var userHealth = this.state.userHealthAmount;
        for (var drop of this.state.rainDrops) {
            if (
                this.didDropHit(drop.x, drop.y) &&
                this.state.userHealthAmount <= 0
            ) {
                gameOver = true;
            } else if (
                this.didDropHit(drop.x, drop.y) &&
                this.state.userHealthAmount > 0
            ) {
                AudioPlayer.hitAudio();
                drops = drops.filter(drop => !this.didDropHit(drop.x, drop.y));
                userHealth -= 1;
            }
        }
        this.setState(() => ({
            gameOver: gameOver,
            rainDrops: drops,
            userHealthAmount: userHealth
        }));
    }

    didHealthPackHit(x, y) {
        return (
            x + HEALTH_PACK.HEIGHT >= this.state.user.locationX &&
            x <= this.state.user.locationX + USER.WIDTH &&
            y >= PLAY_AREA.HEIGHT - USER.HEIGHT - HEALTH_PACK.HEIGHT
        );
    }

    checkForAcquiredHealthPack() {
        var userHealth = this.state.userHealthAmount;
        for (var healthPack of this.state.healthPacks) {
            if (
                this.didHealthPackHit(healthPack.x, healthPack.y) &&
                this.state.userHealthAmount < 3
            ) {
                AudioPlayer.collectAudio();
                userHealth += 1;
            }
            this.setState(state => ({
                healthPacks: state.healthPacks.filter(
                    healthPack =>
                        !this.didHealthPackHit(healthPack.x, healthPack.y)
                ),
                userHealthAmount: userHealth
            }));
        }
    }

    generateRainDrop() {
        this.setState(() => ({
            rainDrops: _.concat(this.state.rainDrops, {
                x:
                    Math.random() * (PLAY_AREA.WIDTH - RAIN.HEIGHT) +
                    RAIN.HEIGHT,
                y: 0
            })
        }));
    }

    generateHealthPack() {
        this.setState(() => ({
            healthPacks: _.concat(this.state.healthPacks, {
                x:
                    Math.random() * (PLAY_AREA.WIDTH - HEALTH_PACK.HEIGHT) +
                    HEALTH_PACK.HEIGHT,
                y: 0
            })
        }));
    }

    checkRainDrops() {
        this.setState(() => ({
            rainDrops: this.state.rainDrops.filter(
                drop => drop.y < PLAY_AREA.HEIGHT - RAIN.HEIGHT
            )
        }));
    }

    checkHealthPacks() {
        this.setState(() => ({
            healthPacks: this.state.healthPacks.filter(
                healthPack =>
                    healthPack.y < PLAY_AREA.HEIGHT - HEALTH_PACK.HEIGHT
            )
        }));
    }

    generateRainTick() {
        if (this.state.rainDrops.length >= 0) {
            this.generateRainDrop();
        }
    }

    generateHealthPacksTick() {
        if (this.state.healthPacks.length >= 0) {
            this.generateHealthPack();
        }
    }

    tick() {
        this.checkForGameOver();
        this.checkForAcquiredHealthPack();
        if (!this.state.gameOver) {
            this.checkRainDrops();
            this.checkHealthPacks();
            this.addPoints();
            this.dropRain();
            this.dropHealthPack();
        } else if (this.state.gameOver && !this.state.deathAudioRan) {
            AudioPlayer.charDeathAudio();
            this.setState({
                deathAudioRan: true
            });
        }
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
                name: event.target.elements.name.value,
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
                            name="name"
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

const AudioPlayer = {
    charDeathAudio() {
        let audio = new Audio("audio_folder/char_death_sound_effect.mp3");
        return audio.play();
    },

    rollAudio() {
        let audio = new Audio("audio_folder/roll_sound_effect.mp3");
        return audio.play();
    },

    hitAudio() {
        let audio = new Audio("audio_folder/hit_sound_effect.mp3");
        return audio.play();
    },

    collectAudio() {
        let audio = new Audio("audio_folder/collect_sound_effect.mp3");
        return audio.play();
    }
};

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

function GameOverModal({ isGameOver }) {
    if (!isGameOver) {
        return <div />;
    } else {
        return (
            <div id="gameModal">
                {Array(12)
                    .fill(null)
                    .map((_, index) => (
                        <div key={index} className="curtain" />
                    ))}
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
            <p className="userName">{name}</p>
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

function HealthPack({ x, y, height, width }) {
    return (
        <div
            style={{ left: x, top: y, height: height, width: width }}
            className="healthPack"
        >
            <div className="bar horizontal" />
            <div className="bar vertical" />
        </div>
    );
}

function HealthPackDisplay({ userHealthAmount }) {
    return (
        <div id="healthPackDisplayContainer">
            <i id="heartIcon" className="fas fa-heart" />
            <p id="userHealthIndicator">x{userHealthAmount}</p>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));

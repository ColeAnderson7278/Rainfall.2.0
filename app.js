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
            userLocationX: 0,
            eyePosition: "left"
        };
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

ReactDOM.render(<PlayArea />, document.getElementById("root"));

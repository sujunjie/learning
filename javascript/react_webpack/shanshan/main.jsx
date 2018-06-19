const React = require('react');
const ReactDOM = require('react-dom');

class Shanshan extends React.Component{
    constructor(props) {
        super(props);
        this.state  = {pos: 0};
    }

    componentDidMount(props) {
        this.timerId = setInterval(
            _ => {
                let nextPos = this.state.pos + 1;
                if (nextPos >= this.props.text.length) {
                    nextPos = 0;
                }
                this.setState({pos: nextPos});
            },
            100
        );
    }

    render() {
        let res = [];
        for (let i = 0; i < this.props.text.length; i++) {
            if (i === this.state.pos) {
                res.push(<i style={{color:'red'}}>{this.props.text[i]}</i>);
            } else {
                res.push(<i>{this.props.text[i]}</i>);
            }
        }
        return (
            <h1>
                {res}
            </h1>
        );
    }
}

ReactDOM.render(
    <Shanshan text="Hello world!" />,
    document.querySelector('#wrapper')
);

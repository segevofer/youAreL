import React from 'react';
import $ from 'jquery';
import _ from 'lodash';

const ENTER = 13;

export default class SaveUrlPrompt extends React.Component {

    constructor() {
        super();

        this.state = {
            name: ''
        };
    }

    onKeyUp(e) {
        this.setState({
            name: e.target.value
        });

        if (e.which === ENTER) {
            this.save();
        }
    }

    save() {
        const name = this.state.name;
        if (!name) {
            return;
        }
        this.props.saveUrl(this.state.name);
    }

    componentDidMount() {
        setTimeout(() => {
            $('#url-name').focus();
        }, 200)
    }

    render() {

        return (
            <div className="SaveUrlPrompt">

                <div className="input-group">
                    <input type="text"
                           id="url-name"
                           onKeyUp={(e) => this.onKeyUp(e)}
                           className="form-control"
                           placeholder="Give it a name"/>
                    <span className="input-group-btn">
                        <button className="btn btn-primary" type="button" onClick={() => this.save()}>
                            Save
                        </button>
                  </span>
                </div>

            </div>
        );
    }
}

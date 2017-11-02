import React from 'react';
import $ from 'jquery';

import _ from 'lodash';

const ENTER = 13;
const UP = 38;
const DOWN = 40;
const BACKSPACE = 8;

export default class ListOfSavedUrls extends React.Component {

    focusUrl(index) {
        const elm = _.head($('.ListOfSavedUrls .savedUrl[tabindex="' + index + '"]'));
        if (elm && _.isFunction(elm.focus)) {
            elm.focus();
        }
    }

    removeSavedUrl(event, url) {
        event.stopPropagation();
        this.props.removeSavedUrl(url);
    }

    duplicateSavedUrl(event, url) {
        event.stopPropagation();
        this.props.duplicateSavedUrl(url);
    }

    renameSavedUrl(event, url) {
        event.stopPropagation();
        this.props.renameSavedUrl(url);
    }

    onKeyUp(event, url, index) {

        switch (event.which) {
            case ENTER:
                event.preventDefault();
                event.stopPropagation();
                this.selectUrl(url);
                break;
            case UP:
                event.preventDefault();
                event.stopPropagation();
                this.focusUrl(index - 1);
                break;
            case DOWN:
                event.preventDefault();
                event.stopPropagation();
                this.focusUrl(index + 1);
                break;
            case BACKSPACE:
                this.removeSavedUrl(event, url);
                break;
            default:
                console.log(event.which);
                break;
        }
    }

    selectUrl(url) {
        this.props.selectSavedUrl(url);
    }

    componentDidMount() {
        setTimeout(() => {
            this.focusUrl(1);
        }, 300);
    }

    render() {

        const savedUrls = _.map(this.props.savedUrls, (url, index) => {
            const tabIndex = index + 1;

            return (
                <div className="savedUrl"
                     key={tabIndex}
                     onKeyUp={(e) => this.onKeyUp(e, url, tabIndex)}
                     onClick={() => this.selectUrl(url)}
                     tabIndex={tabIndex}>
                    <div>
                        <span className="url-name">{url.name}</span>

                        <span className="url-actions">
                            <i className="fa fa-trash" onClick={(e) => this.removeSavedUrl(e, url)} title="delete"/>
                            <i className="fa fa-files-o" onClick={(e) => this.duplicateSavedUrl(e, url)} title="duplicate"/>
                            <i className="fa fa-pencil" onClick={(e) => this.renameSavedUrl(e, url)} title="rename"/>
                        </span>

                    </div>
                    <div className="url-origin">
                        {url.location.origin}
                    </div>

                </div>
            );
        });

        let emptyMessage = "";

        if (!savedUrls.length) {
            emptyMessage = (
                <div className="empty-message">
                    You didn't save any url yet...
                    <br/>
                    <br/>
                    <a className="btn-link" onClick={() => this.props.backToParamsView()}>
                        Start here
                    </a>
                </div>
            );
        }

        return (
            <div className="ListOfSavedUrls">
                {emptyMessage}
                {savedUrls}
            </div>
        )
    }
}

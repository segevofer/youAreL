import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import UrlParamsContainer from './Components/UrlParamsContainer'
import _ from 'lodash';
import $ from 'jquery';
import Context from './Context'
import '../styles/index.scss';
import '../libs/font-awesome-4.7.0/scss/font-awesome.scss'

const KEYS = {
    BACKSPACE: 8,
    ENTER: 13,
    N: 78,
    S: 83,
    L: 76
};


function isDebug() {
    return typeof chrome.tabs === 'undefined';
}

const DEBUG = isDebug();
const context = new Context(DEBUG);

if (DEBUG) {
    console.log('Debug mode');
    context.setActiveTab({
        url: window.location.href,
        id: 'TEST_123'
    });
} else {
    chrome.tabs.query({active: true, currentWindow: true}, (arrayOfTabs) => {
        const tab = arrayOfTabs[0];
        context.setAllTabs(arrayOfTabs);
        context.setActiveTab(tab);
        context.setLoaded(!!tab);
    });
}

export default class App extends React.Component {

    constructor() {
        super();

        this.state = {
            origin: "",
            urlParams: []
        };
    }

    componentDidMount() {
        context.onLoad(() => {
            this.setState({
                origin: context.ejectOrigin(context.activeTab.url),
                urlParams: this.buildUrlParamsObjects(context.activeTab.url)
            });
        });

        window.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    }

    buildUrlParamsObjects(url) {
        let urlParams = context.getUrlParams(url);
        let result = _.map(urlParams, function (value, key) {
            return {
                key,
                value
            };
        });

        // placeholder if empty
        if (!result.length) {
            result.push({
                key: "",
                value: ""
            });
        }

        return result;
    }

    handleRemove(index) {
        let newUrlParams = _.clone(this.state.urlParams);
        newUrlParams.splice(index, 1);

        this.setState({
            urlParams: newUrlParams
        });
    }

    handleChange(event, index, keyOrValue) {
        let newUrlParams = _.clone(this.state.urlParams);
        newUrlParams[index][keyOrValue] = event.target.value;

        this.setState({
            urlParams: newUrlParams
        });
    }

    buildCurrentUrl() {
        if (!this.state.urlParams.length) {
            return '';
        }

        let newUrl = this.state.origin + "?";
        _.forEach(this.state.urlParams, function (obj) {
            if (obj.key && obj.value) {
                newUrl += obj.key + "=" + obj.value + "&";
            }
        });

        newUrl = newUrl.substr(0, newUrl.length - 1);

        return newUrl;
    }

    renderUrlAndGo() {
        if (!this.state.urlParams.length) {
            return;
        }
        context.updateUrl(this.buildCurrentUrl());
        setTimeout(window.close, 500);
    }

    getOrigin() {
        return _.clone(this.state.origin);
    }

    loadFavorite() {
        if (localStorage.urlParams) {
            let newLoadedParams = JSON.parse(localStorage.urlParams);
            if (newLoadedParams) {
                let paramsToApply = _.clone(this.state.urlParams);
                _.forEach(newLoadedParams, function (obj) {
                    let foundByKey = _.find(paramsToApply, {key: obj.key});
                    if (foundByKey) {
                        foundByKey.value = obj.value;
                    } else {
                        paramsToApply.push(obj);
                    }
                });

                this.setState({
                    urlParams: paramsToApply
                });
            }
        }
    }

    rejectedParams(obj) {
        return obj.key === "metaSiteId";
    }

    saveFavorite() {
        let urlParams = _.reject(this.state.urlParams, this.rejectedParams);
        if (!urlParams.length) {
            return;
        }

        localStorage.urlParams = JSON.stringify(urlParams);
    }

    focusLastKeyInput() {
        _.last($('input[placeholder="key"]')).focus();
    }

    clearParams() {
        this.setState({
            urlParams: [{
                key: "",
                value: ""
            }]
        });
        setTimeout(this.focusLastKeyInput, 100);
    }

    addUrlParam() {
        let newUrlParams = _.clone(this.state.urlParams);

        newUrlParams.push({
            key: "",
            value: ""
        });

        this.setState({
            urlParams: newUrlParams
        });

        setTimeout(this.focusLastKeyInput, 100);
    }

    handleUrlChange(e) {
        const url = e.target.value;
        this.setState({
            origin: context.ejectOrigin(url),
            urlParams: this.buildUrlParamsObjects(url)
        });
    }

    handleKeyDown(event) {
        let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        let code = event.keyCode || event.which;
        let specialKey = isMac ? event.metaKey : event.ctrlKey;
        let extraKey = isMac ? event.ctrlKey : event.altKey;
        if (specialKey || extraKey) {
            if (code === KEYS.ENTER) {
                this.renderUrlAndGo();
            } else if (code === KEYS.BACKSPACE) {
                this.clearParams();
            } else if (code === KEYS.N) {
                this.addUrlParam();
            } else if (code === KEYS.S) {
                this.saveFavorite();
            } else if (code === KEYS.L) {
                this.loadFavorite();
            }
        }
    }

    render() {

        let noParams = !this.state.urlParams.length;

        return (
            <div>
                <h1 className="main-header">You Are L</h1>
                <UrlParamsContainer
                    urlParams={this.state.urlParams}
                    onChange={this.handleChange.bind(this) }
                    onRemove={this.handleRemove.bind(this) }/>
                <div className="btnBox">
                    <div>
                        {/*(Ctrl+L)*/}
                        <button className="btn btn-primary" onClick={() => this.loadFavorite()}>Load</button>
                        {/*(Ctrl+S)*/}
                        <button className={"btn btn-success " + (noParams?"disabled":"")} onClick={(event) => this.saveFavorite()}>Save</button>
                        {/*(Ctrl+Backspace)*/}
                        <button className="btn btn-warning" onClick={() => this.clearParams()}>Clear</button>
                        {/*(Ctrl+N)*/}
                        <button className="btn btn-success" onClick={() => this.addUrlParam()}>Add</button>
                        {/*(Ctrl+Enter)*/}
                        <button className={"btn btn-info " + (noParams?"disabled":"")} onClick={(event) => this.renderUrlAndGo()}>Apply</button>
                    </div>
                    <div>
                        <input value={this.buildCurrentUrl()}
                               className="main-url"
                               onChange={(event) => this.handleUrlChange(event)}/>
                    </div>
                </div>
            </div>
        )
    }
}

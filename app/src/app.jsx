import React from 'react';
import UrlParamsContainer from './Components/UrlParamsContainer'
import ListOfSavedUrls from './Components/ListOfSavedUrls'
import SaveUrlPrompt from './Components/SaveUrlPrompt'
import StorageModel from './Models/StorageModel'
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
    const debugTabs = [{
        url: window.location.href,
        id: 'TEST_123'
    }];
    context.setAllTabs(debugTabs)
        .setActiveTab(debugTabs[0]);

    setTimeout(() => {
        context.setLoaded(true);
    }, 1000);
} else {
    chrome.tabs.query({active: true, currentWindow: true}, (arrayOfTabs) => {
        const tab = arrayOfTabs[0];
        context.setAllTabs(arrayOfTabs)
            .setActiveTab(tab)
            .setLoaded(!!tab);
    });
}

const VIEWS = {
    PARAMS: 'PARAMS',
    LOAD: 'LOAD',
    SAVE: 'SAVE'
};

export default class App extends React.Component {

    constructor() {
        super();

        this.state = {
            // VIEW
            currentView: VIEWS.PARAMS,
            urlToRename: {},

            // MODEL
            origin: "",
            originData: StorageModel.getEmptyOriginData(),
            urlParams: [],
            savedUrls: []
        };
    }

    buildUrlFromParams() {
        const urlParams = _.reject(this.state.urlParams, urlParam => {
            return _.includes(this.state.originData.rejected, urlParam.key);
        });

        if (!urlParams.length) {
            return '';
        }

        let newUrl = "?";
        _.forEach(urlParams, function (obj) {
            if (obj.key && obj.value) {
                newUrl += obj.key + "=" + obj.value + "&";
            }
        });

        newUrl = newUrl.substr(0, newUrl.length - 1);
        return newUrl;
    }

    componentDidMount() {
        context.onLoad(() => {
            const origin = context.getUrlOrigin(context.activeTab.url);
            let urlParams = this.buildUrlParamsObjects(context.activeTab.url);

            const isParamsEmpty = !urlParams.length || (urlParams.length === 1 && !urlParams[0].key && !urlParams[0].value);
            if (isParamsEmpty) {
                const foundForOrigin = StorageModel.getUrlParamsForOrigin(origin);
                if (foundForOrigin) {
                    urlParams = this.buildUrlParamsObjects(origin + foundForOrigin);
                }
            }

            const savedUrls = StorageModel.getSavedUrlParams();
            const originData = StorageModel.getOriginData(origin);
            this.setState({origin, urlParams, savedUrls, originData});
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

        _.forEach(_.get(this.state.originData, 'favorites'), function (key) {
            if (!_.find(result, {key})) {
                result.push({
                    key,
                    value: ""
                });
            }
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
        return this.state.origin + this.buildUrlFromParams();
    }

    renderUrlAndGo() {
        if (!this.state.urlParams.length) {
            return;
        }
        context.updateUrl(this.buildCurrentUrl());
        setTimeout(window.close, 500);
    }

    selectSavedUrl(favorite) {
        const urlParams = this.buildUrlParamsObjects(this.state.origin + _.get(favorite, ['location', 'search']));
        this.setState({
            urlParams,
            currentView: VIEWS.PARAMS
        });
    }

    removeSavedUrl(url) {
        StorageModel.removeUrl(url);
        this.refreshSavedUrls();
    }

    duplicateSavedUrl(url) {
        const name = url.name + ' copy';
        const origin = _.get(url, ['location', 'origin']);
        const search = _.get(url, ['location', 'search']);

        StorageModel.saveUrl(name, origin, search);
        this.refreshSavedUrls();
    }

    renameSavedUrl(url) {
        this.setState({
            urlToRename: url,
            currentView: VIEWS.SAVE
        });
    }

    refreshSavedUrls() {
        this.setState({
            savedUrls: StorageModel.getSavedUrlParams()
        })
    }

    setView(view) {
        this.setState({currentView: view});
    }

    toggleView(view) {
        this.setView(this.state.currentView === view ? VIEWS.PARAMS : view);
    }

    saveUrl(name) {
        if (!name) {
            return;
        }

        let nextView = VIEWS.PARAMS;

        if (!_.isEmpty(this.state.urlToRename)) {
            StorageModel.renameUrl(this.state.urlToRename, name);
            nextView = VIEWS.LOAD;
        } else {
            const origin = this.state.origin;
            const search = this.buildUrlFromParams();
            StorageModel.saveUrl(name, origin, search);
        }

        this.refreshSavedUrls();
        this.setState({
            urlToRename: {},
            currentView: nextView
        });
    }

    focusLastKeyInput() {
        _.last($('input[placeholder="key"]')).focus();
    }

    clearParams() {
        if (this.state.currentView !== VIEWS.PARAMS) {
            return;
        }
        this.setState({
            urlParams: [{
                key: "",
                value: ""
            }]
        });
        setTimeout(this.focusLastKeyInput, 100);
    }

    addUrlParam() {
        if (this.state.currentView !== VIEWS.PARAMS) {
            return;
        }
        let urlParams = _.clone(this.state.urlParams);

        urlParams.push({
            key: "",
            value: ""
        });

        this.setState({urlParams});
        setTimeout(this.focusLastKeyInput, 100);
    }

    handleUrlChange(e) {
        const url = e.target.value;
        this.setState({
            origin: context.getUrlOrigin(url),
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
                this.toggleView(VIEWS.SAVE);
            } else if (code === KEYS.L) {
                this.toggleView(VIEWS.LOAD);
            }
        }
    }

    setOriginDataKey(namespace, key, shouldBeAddedToArray) {
        const originData = _.clone(this.state.originData);

        if (shouldBeAddedToArray) {
            if (!_.includes(originData[namespace], key)) {
                originData[namespace].push(key);
            }
        } else {
            let index = _.indexOf(originData[namespace], key);
            if (index !== -1) {
                originData[namespace].splice(index, 1);
            }
        }

        StorageModel.setOriginData(this.state.origin, originData);
        this.setState({originData});
    }

    setFavorite(key, isFavorite) {
        this.setOriginDataKey('favorites', key, isFavorite);
    }

    setRejected(key, isRejected) {
        this.setOriginDataKey('rejected', key, isRejected);
    }

    render() {
        let noParams = !this.state.urlParams.length;
        let currentView;

        switch (this.state.currentView) {
            case VIEWS.PARAMS:
                currentView = (
                    <UrlParamsContainer
                        urlParams={this.state.urlParams}
                        originData={this.state.originData}
                        setFavorite={this.setFavorite.bind(this)}
                        setRejected={this.setRejected.bind(this)}
                        onChange={this.handleChange.bind(this)}
                        onRemove={this.handleRemove.bind(this)}>
                    </UrlParamsContainer>
                );
                break;
            case VIEWS.LOAD:
                currentView = (
                    <ListOfSavedUrls
                        savedUrls={this.state.savedUrls}
                        removeSavedUrl={this.removeSavedUrl.bind(this)}
                        duplicateSavedUrl={this.duplicateSavedUrl.bind(this)}
                        backToParamsView={this.setView.bind(this, VIEWS.PARAMS)}
                        renameSavedUrl={this.renameSavedUrl.bind(this)}
                        selectSavedUrl={this.selectSavedUrl.bind(this)}>
                    </ListOfSavedUrls>
                );
                break;
            case VIEWS.SAVE:
                currentView = (
                    <SaveUrlPrompt
                        saveUrl={this.saveUrl.bind(this)}>
                    </SaveUrlPrompt>
                );
                break;
            default:
                break;
        }

        return (
            <div>
                <h1 className="main-header">You Are L</h1>

                <div className="main-content">
                    {currentView}
                </div>

                <div className="btnBox">
                    <div>
                        {/*(Ctrl+L)*/}
                        <button className="btn btn-primary"
                                onClick={() => this.toggleView(VIEWS.LOAD)}>
                            Load
                        </button>

                        {/*(Ctrl+S)*/}
                        <button className={"btn btn-success " + (noParams ? "disabled" : "")}
                                onClick={() => this.toggleView(VIEWS.SAVE)}>
                            Save
                        </button>

                        {/*(Ctrl+Backspace)*/}
                        <button className="btn btn-warning"
                                onClick={() => this.clearParams()}>
                            Clear
                        </button>

                        {/*(Ctrl+N)*/}
                        <button className="btn btn-success"
                                onClick={() => this.addUrlParam()}>
                            Add
                        </button>

                        {/*(Ctrl+Enter)*/}
                        <button className={"btn btn-info " + (noParams ? "disabled" : "")}
                                onClick={(event) => this.renderUrlAndGo()}>
                            Apply
                        </button>
                    </div>
                </div>

            </div>
        )
    }
}

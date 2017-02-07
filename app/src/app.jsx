import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import UrlParamsContainer from './Components/UrlParamsContainer'
import _ from 'lodash';
import $ from 'jquery';

// Global Model
let Context = {
	allTabs: [],
	activeTab: null,
	loaded: false,

	updateUrl: (url) => {
		chrome.tabs.update(Context.activeTab.id, {url: url});
	},


	ejectOrigin: (url) => {
		if (url.indexOf("?") != -1) {
			let pathArray = url.split("?");
			return pathArray[0];
		} else {
			return url;
		}
	},

	ejectSearch: (url) => {
		let org = Context.ejectOrigin(url);
		return url.substr(org.length + 1);
	},

	getUrlParams: (windowLocation) => {
		if (!windowLocation) return "";
		var query_string = {};

		var query = Context.ejectSearch(windowLocation);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			// If first entry with this name
			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
				// If second entry with this name
			} else if (typeof query_string[pair[0]] === "string") {
				var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
				query_string[pair[0]] = arr;
				// If third or later entry with this name
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		}
		delete query_string[""];
		return query_string;
	}
};

window.Context = Context;

chrome.tabs.query({active: true, currentWindow: true}, (arrayOfTabs) => {
	const tab = arrayOfTabs[0];
	Context.allTabs = arrayOfTabs;
	Context.activeTab = tab;
	Context.loaded = !!tab;
	render(<AppContainer><App/></AppContainer>, document.querySelector("#app"));
});


export default class App extends React.Component {

	constructor() {
		super();

		this.state = {
			origin: "",
			urlParams: []
		};
	}

	componentDidMount() {
		const self = this;
		this.setState({
			origin: Context.ejectOrigin(Context.activeTab.url),
			urlParams: self.buildUrlParamsObjects(Context.activeTab.url)
		});
	}

	buildUrlParamsObjects(url) {
		let urlParams = Context.getUrlParams(url);
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

	renderUrlAndGo() {
		if (!this.state.urlParams.length) {
			return;
		}

		let newUrl = this.state.origin + "?";
		_.forEach(this.state.urlParams, function (obj) {
			if(obj.key && obj.value) {
				newUrl += obj.key + "=" + obj.value + "&";
			}
		});
		newUrl = newUrl.substr(0, newUrl.length - 1);

		Context.updateUrl(newUrl);
		setTimeout(window.close, 500);
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
		setTimeout(this.focusLastKeyInput, 200);
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

		setTimeout(this.focusLastKeyInput, 200);
	}

	render() {

		let noParams = !this.state.urlParams.length;

		return (
			<div>
				<h1 className="main-header">You Are L</h1>
				<UrlParamsContainer
					urlParams={this.state.urlParams}
					onEnter={this.renderUrlAndGo.bind(this)}
					onChange={this.handleChange.bind(this) }
					onRemove={this.handleRemove.bind(this) }/>
				<div className="btnBox">
					<button className="btn btn-primary" onClick={() => this.loadFavorite()}>Load</button>
					<button className={"btn btn-success " + (noParams?"disabled":"")} onClick={(event) => this.saveFavorite()}>Save</button>
					<button className="btn btn-warning" onClick={() => this.clearParams()}>Clear</button>
					<button className="btn btn-success" onClick={() => this.addUrlParam()}>Add</button>
					<button className={"btn btn-info " + (noParams?"disabled":"")} onClick={(event) => this.renderUrlAndGo()}>Go</button>
				</div>
			</div>
		)
	}
}

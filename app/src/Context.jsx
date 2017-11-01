import _ from 'lodash';

export default class Context {
    constructor(debug) {
        this.allTabs = [];
        this.activeTab = {};
        this.loaded = false;
        this.onLoadCallbacks = [];
        this.debug = debug;
    }

    isLoaded() {
        return !!this.loaded;
    }

    onLoad(callback) {
        this.onLoadCallbacks.push(callback);
    }

    setAllTabs(allTabs) {
        this.allTabs = allTabs;
        return this;
    }

    setActiveTab(activeTab) {
        this.activeTab = activeTab;
        return this;
    }

    setLoaded(loaded) {
        this.loaded = loaded;
        if (loaded) {
            _.forEach(this.onLoadCallbacks, foo => foo());
        }
        return this;
    }

    updateUrl(url) {
        if (this.debug) {
            window.location = url;
        } else {
            chrome.tabs.update(this.activeTab.id, {url: url});
        }
        return this;
    }

    getUrlOrigin(url) {
        if (this.isLoaded() && _.isString(url) && url.indexOf("?") != -1) {
            let pathArray = url.split("?");
            return pathArray[0];
        } else {
            return url;
        }
    }

    getUrlSearch(url) {
        let org = this.getUrlOrigin(url);
        return url.substr(org.length + 1)
    }

    getUrlParams(windowLocation) {
        if (!windowLocation) return "";
        var queryString = {};

        var query = this.getUrlSearch(windowLocation);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof queryString[pair[0]] === "undefined") {
                queryString[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof queryString[pair[0]] === "string") {
                var arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
                queryString[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                queryString[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        delete queryString[""];
        return queryString;
    }
}
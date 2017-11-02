import _ from 'lodash';

const modelName = '_youAreL';

const emptyModel = {
    urls: [],
    origins: {},
    version: 1
};

const emptyOriginData = {
    favorites: [],
    rejected: ['metaSiteId']
};

function urlModel(name, origin, search) {
    return {
        name,
        location: {
            origin,
            search
        }
    }
}

const StorageModel = {
    loadModel() {
        const existingModel = JSON.parse(localStorage[modelName] || '{}');
        return _.defaultsDeep(existingModel, emptyModel);
    },

    saveModel(model) {
        return localStorage[modelName] = JSON.stringify(model);
    },

    getEmptyOriginData() {
        return _.clone(emptyOriginData);
    },

    getOriginData(origin) {
        const model = this.loadModel();
        return model.origins[origin] || this.getEmptyOriginData();
    },

    setOriginData(origin, originData) {
        const model = this.loadModel();
        model.origins[origin] = originData;
        this.saveModel(model);
    },

    saveUrl(name, origin, search) {
        const model = this.loadModel();
        let newUrl = urlModel(name, origin, search);
        model.urls.push(newUrl);
        this.saveModel(model);
    },

    removeUrl(url) {
        const model = this.loadModel();
        let removeMe = _.find(model.urls, url);
        let index = _.indexOf(model.urls, removeMe);
        model.urls.splice(index, 1);
        this.saveModel(model);
    },

    renameUrl(url, newName) {
        const model = this.loadModel();
        let renameMe = _.find(model.urls, url);
        renameMe.name = newName;
        this.saveModel(model);
    },

    getUrlParamsForOrigin(origin){
        const model = this.loadModel();
        let found = '';

        _.forEach(model.urls, function (url) {
            if (url.location.origin === origin) {
                found = url.location.search;
            }
        });

        return found;
    },

    getSavedUrlParams() {
        const model = this.loadModel();
        return model.urls;
    }
};

export default StorageModel;
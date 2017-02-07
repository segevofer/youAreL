import React from 'react';
import _ from 'lodash';
import UrlParam from './UrlParam'

export default class UrlParamsContainer extends React.Component {

	buildUrlParamHtml(urlParam, index) {
		return (
			<UrlParam urlParam={urlParam}
								key={index}
								index={index}
								onEnter={ this.props.onEnter }
								onChange={ this.props.onChange }
								onRemove={ this.props.onRemove }/>
		)
	}

	buildEmptyMessage() {
		return (
			<div className="empty-message">
				No url params yet. Start by adding one
			</div>
		);
	}

	render() {
		var isEmpty = !this.props.urlParams.length || (this.props.urlParams.length === 1 && !this.props.urlParams[0].key && !this.props.urlParams[0].value);
		return (
			<div className="UrlParamsContainer">
				{ isEmpty && this.buildEmptyMessage() }
				{ _.map(this.props.urlParams, this.buildUrlParamHtml.bind(this)) }
			</div>
		)
	}
}

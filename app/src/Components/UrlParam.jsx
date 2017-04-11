import React from 'react';

export default class UrlParam extends React.Component {
	render() {
		let showWarning = this.props.urlParam.key === "metaSiteId";
		let warning = '';

		if (showWarning) {
		    warning = (
		    	<div className="metaSiteIdWarning">
						<i className="fa fa-warning warning-icon"></i>
						metaSiteId will not be saved
					</div>
				);
		}

		return (
			<div className="UrlParam">
				<input value={this.props.urlParam.key}
							 onChange={(event) => this.props.onChange(event, this.props.index, 'key')}
							 title={this.props.urlParam.key}
							 placeholder="key"/>

				<input value={this.props.urlParam.value}
							 onChange={(event) => this.props.onChange(event, this.props.index, 'value')}
							 title={this.props.urlParam.value}
							 placeholder="value"/>

				<i className="fa fa-times remove-icon"
					 title="remove"
					 onClick={() => this.props.onRemove(this.props.index)}></i>
				{ warning }
			</div>
		)
	}
}

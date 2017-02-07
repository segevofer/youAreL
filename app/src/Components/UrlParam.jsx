import React from 'react';

export default class UrlParam extends React.Component {

	handleKeyboard(event) {
		let isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		let code = event.keyCode || event.which;
		let specialKey = isMac ? event.metaKey : event.ctrlKey;
		let Enter = 13;
		if (specialKey && code === Enter) {
			console.log("Enter was clicked !");
			this.props.onEnter();
		}
	}

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
							 onKeyDown={(event) => this.handleKeyboard.call(this, event)}
							 title={this.props.urlParam.key}
							 placeholder="key"/>

				<input value={this.props.urlParam.value}
							 onChange={(event) => this.props.onChange(event, this.props.index, 'value')}
							 onKeyDown={(event) => this.handleKeyboard.call(this, event)}
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

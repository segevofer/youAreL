import React from 'react';
import _ from 'lodash';

export default class UrlParam extends React.Component {
    getWarning() {
        return (
            <div className="rejectedKeyWarning">
                <span className="rejectedKeyWarning-text">
                    "{this.props.urlParam.key}" will not be saved
                </span>
            </div>
        );
    }

    setFavorite() {
        this.props.setFavorite(this.props.urlParam.key, true);
    }

    setRejected() {
        this.props.setRejected(this.props.urlParam.key, true);
    }

    render() {
        const {key, value} = this.props.urlParam;

        const isRejected = _.includes(this.props.originData.rejected, key);
        const isFavorite = _.includes(this.props.originData.favorites, key);

        const starIcon = isFavorite ? (
					<i className="fa fa-star" title="remove from favorites" onClick={(event) => this.props.setFavorite(key, false)}/>
				) : (
					<i className="fa fa-star-o" title="Add to favorites" onClick={(event) => this.props.setFavorite(key, true)}/>
				);

        const rejectedIcon = isRejected ? (
					<i className="fa fa-eye-slash" onClick={(event) => this.props.setRejected(key, false)}/>
				) : (
					<i className="fa fa-eye" onClick={(event) => this.props.setRejected(key, true)}/>
				);

        const copyToClipboard = () => {
						if (this.inputRef && _.isFunction(this.inputRef.select)) {
							this.inputRef.select();
							document.execCommand('copy');
							window.setTimeout(() => this.inputRef.blur(), 200);
						}
        };

        return (
            <div className="UrlParam">

                <span className="urlParamsActions">
										{starIcon}
										{rejectedIcon}
                </span>

                <input value={key}
                       onChange={(event) => this.props.onChange(event, this.props.index, 'key')}
                       title={key}
                       placeholder="key"/>

                <input value={value}
											 ref={(ref) => this.inputRef = ref}
                       onChange={(event) => this.props.onChange(event, this.props.index, 'value')}
                       title={value}
                       placeholder="value"/>

                <i className="fa fa-copy"
                   title="copy to clipboard"
                   onClick={(event) => copyToClipboard()}></i>

                <i className="fa fa-times remove-icon"
                   title="remove"
                   onClick={() => this.props.onRemove(this.props.index)}></i>

                <span>
                    {isRejected ? this.getWarning() : ''}
                </span>
            </div>
        )
    }
}

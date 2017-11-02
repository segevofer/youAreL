import React from 'react';
import _ from 'lodash';

export default class UrlParam extends React.Component {

// <i className="fa fa-star-o"/>

    getWarning() {
        return (
            <div className="rejectedKeyWarning">
                {/*<i className="fa fa-warning warning-icon"></i>*/}
                <span className="rejectedKeyWarning-text">
                    This key will not be saved
                </span>
            </div>
        );
    }

    setNotFavoriteAndNotRejected() {
        this.props.setFavorite(this.props.urlParam.key, false);
        this.props.setRejected(this.props.urlParam.key, false);
    }

    setFavorite() {
        this.props.setRejected(this.props.urlParam.key, false);
        this.props.setFavorite(this.props.urlParam.key, true);
    }

    setRejected() {
        this.props.setRejected(this.props.urlParam.key, true);
        this.props.setFavorite(this.props.urlParam.key, false);
    }

    render() {
        const key = this.props.urlParam.key;
        const value = this.props.urlParam.value;

        let iconToShow;
        const isRejected = _.includes(this.props.originData.rejected, key);
        const isFavorite = _.includes(this.props.originData.favorites, key);

        if (isRejected) {
            iconToShow = (
                <i className="fa fa-eye-slash" onClick={(event) => this.setNotFavoriteAndNotRejected()}/>
            );
        } else if (isFavorite) {
            iconToShow = (
                <i className="fa fa-star" onClick={(event) => this.setRejected()}/>
            );
        } else {
            iconToShow = (
                <i className="fa fa-star-o" onClick={(event) => this.setFavorite()}/>
            );
        }

        return (
            <div className="UrlParam">

                <span className="urlParamsActions">
                    {iconToShow}
                </span>

                <input value={key}
                       onChange={(event) => this.props.onChange(event, this.props.index, 'key')}
                       title={key}
                       placeholder="key"/>

                <input value={value}
                       onChange={(event) => this.props.onChange(event, this.props.index, 'value')}
                       title={value}
                       placeholder="value"/>

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

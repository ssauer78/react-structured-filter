import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * A single option within the TypeaheadSelector
 */
class TypeaheadOption extends React.Component {
  static propTypes = {
    customClasses: PropTypes.object,
    onClick: PropTypes.func,
    children: PropTypes.string,
    hover: PropTypes.bool
  };

  constructor (props) {
    super(props);
    this._getClasses = this._getClasses.bind(this);
    this._onClick = this._onClick.bind(this);
    this.state = {
      hover: false
    };
  }

  _getClasses () {
    var classes = {
      'typeahead-option': true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;
    return classNames(classes);
  }

  _onClick () {
    return this.props.onClick();
  }

  render () {
    var classes = {
      hover: this.props.hover
    };
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;
    var classList = classNames(classes);
    return (
      <li className={classList} onClick={this._onClick}>
        <a href='#' className={this._getClasses()} ref='anchor'>
          {this.props.children}
        </a>
      </li>
    );
  }
}

TypeaheadOption.defaultProps = {
  customClasses: {},
  onClick: function (event) {
    event.preventDefault();
  }
};

export default TypeaheadOption;

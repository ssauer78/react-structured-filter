import React, { PropTypes } from 'react';
import TypeaheadOption from './option';
import classNames from 'classnames';

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
class TypeaheadSelector extends React.Component {
  static propTypes = {
    options: PropTypes.array,
    header: PropTypes.string,
    customClasses: PropTypes.object,
    selectionIndex: PropTypes.number,
    onOptionSelected: PropTypes.func
  };

  constructor (props) {
    super(props);
    this.setSelectionIndex = this.setSelectionIndex.bind(this);
    this.getSelectionForIndex = this.getSelectionForIndex.bind(this);
    this._onClick = this._onClick.bind(this);
    this._nav = this._nav.bind(this);
    this.navDown = this.navDown.bind(this);
    this.navUp = this.navDown.bind(this);
    this.state = {
      selectionIndex: this.props.selectionIndex,
      selection: this.getSelectionForIndex(this.props.selectionIndex)
    };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({selectionIndex: null});
  }

  setSelectionIndex (index) {
    this.setState({
      selectionIndex: index,
      selection: this.getSelectionForIndex(index)
    });
  }

  getSelectionForIndex (index) {
    if (index === null) {
      return null;
    }
    return this.props.options[index];
  }

  _onClick (result) {
    this.props.onOptionSelected(result);
  }

  _nav (delta) {
    if (!this.props.options) {
      return;
    }
    var newIndex;
    if (this.state.selectionIndex === null) {
      if (delta === 1) {
        newIndex = 0;
      } else {
        newIndex = delta;
      }
    } else {
      newIndex = this.state.selectionIndex + delta;
    }
    if (newIndex < 0) {
      newIndex += this.props.options.length;
    } else if (newIndex >= this.props.options.length) {
      newIndex -= this.props.options.length;
    }
    var newSelection = this.getSelectionForIndex(newIndex);
    this.setState({selectionIndex: newIndex, selection: newSelection});
  }

  navDown () {
    this._nav(1);
  }

  navUp () {
    this._nav(-1);
  }

  render () {
    var classes = {
      'typeahead-selector': true
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    var results = this.props.options.map(function (result, i) {
      // check if result is an object
      // console.log(result);
      if (typeof result === 'object') {
        return (
          <TypeaheadOption ref={result.category} key={result.category}
            hover={this.state.selectionIndex === i}
            customClasses={this.props.customClasses}
            onClick={this._onClick.bind(this, result.category)}>
            {result.label}
          </TypeaheadOption>
        );
      } else {
        return (
          <TypeaheadOption ref={result} key={result}
            hover={this.state.selectionIndex === i}
            customClasses={this.props.customClasses}
            onClick={this._onClick.bind(this, result)}>
            {result}
          </TypeaheadOption>
        );
      }
    }, this);
    return <ul className={classList}>
      <li className='header'>{this.props.header}</li>
        {results}
      </ul>;
  }
}

TypeaheadSelector.defaultProps = {
  selectionIndex: null,
  customClasses: {},
  onOptionSelected: function (option) {}
};

export default TypeaheadSelector;

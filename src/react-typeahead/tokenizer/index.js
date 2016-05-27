import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Token from './token';
import KeyEvent from '../keyevent';
import Typeahead from '../typeahead';
import classNames from 'classnames';
import ReactDOM from 'react-dom';

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable 'token', that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
class TypeaheadTokenizer extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    options: PropTypes.array,
    customClasses: PropTypes.object,
    defaultSelected: PropTypes.array,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    onTokenRemove: PropTypes.func,
    onTokenAdd: PropTypes.func,
    uniqueIdentifier: PropTypes.string
  };

  constructor (props) {
    super(props);
    this._renderTokens = this._renderTokens.bind(this);
    this._getOptionsForTypeahead = this._getOptionsForTypeahead.bind(this);
    this._getHeader = this._getHeader.bind(this);
    this._getCategoryType = this._getCategoryType.bind(this);
    this._getCategoryOptions = this._getCategoryOptions.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._removeTokenForValue = this._removeTokenForValue.bind(this);
    this._editToken = this._editToken.bind(this);
    this._addTokenForValue = this._addTokenForValue.bind(this);
    this._getInputType = this._getInputType.bind(this);

    this.state = {
      selected: this.props.defaultSelected,
      label: '',
      category: '',
      operator: ''
    };
  }

  // if the type of the list changes, reset the tokens (search fields)
  componentWillUpdate (nextProps) {
    if (this.props.type !== nextProps.type) {
      this.state.selected.map(function (selected) {
        this._removeTokenForValue(selected, false);
      }, this);
    }
  }

  // On unmount, clear the search!
  componentWillUnmount () {
    this.state.selected.map(function (selected) {
      this._removeTokenForValue(selected, false);
    }, this);
  }

  _renderTokens () {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function (selected) {
      var mykey = selected.category + selected.label + selected.operator + selected.value;
      return (
        <Token key={mykey} className={classList}
          onRemove={this._removeTokenForValue}
          onEdit={this._editToken}>
          {selected}
        </Token>
      );
    }, this);
    return result;
  }

  _getOptionsForTypeahead () {
    if (this.state.category === '') {
      var categories = [];
      for (var i = 0; i < this.props.options.length; i++) {
        categories.push({category: this.props.options[i].category, label: this.props.options[i].label});
      }
      return categories;
    } else if (this.state.operator === '') {
      var categoryType = this._getCategoryType();
      console.log(categoryType);
      if (categoryType === 'TEXT' || categoryType === 'USER') {
        return ['==', '!=', 'contains', '!contains', 'icontains', '!iconstains', 'startswith', '!startswith'];
      } else if (categoryType === 'SELECT') {
        return ['==', '!='];
      } else if (categoryType === 'NUMBER' || categoryType === 'DATE') {
        return ['==', '!=', '<', '<=', '>', '>='];
      } else {
        console.log('WARNING: Unknown category type in tokenizer');
        return ['==', '!=', 'contains', '!contains', 'icontains', '!iconstains', 'startswith', '!startswith'];
      }
    } else {
      var options = this._getCategoryOptions();
      if (typeof options !== 'function') {
        return options;
      } else {
        return options(this.state.category, this.state.operator);
      }
    }
  }

  _getHeader () {
    if (this.state.category === '') {
      return 'Category';
    } else if (this.state.operator === '') {
      return 'Operator';
    } else {
      return 'Value';
    }
  }

  _getCategoryType () {
    for (var i = 0; i < this.props.options.length; i++) {
      if (this.props.options[i].category === this.state.category) {
        var categoryType = this.props.options[i].type;
        return categoryType;
      }
    }
  }

  _getCategoryOptions () {
    for (var i = 0; i < this.props.options.length; i++) {
      if (this.props.options[i].category === this.state.category) {
        return this.props.options[i].options;
      }
    }
  }

  _onKeyDown (event) {
    // We only care about intercepting backspaces
    if (event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = ReactDOM.findDOMNode(this.refs.typeahead.refs.inner.inputRef());
    if (entry.selectionStart === entry.selectionEnd && entry.selectionStart === 0) {
      if (this.state.operator !== '') {
        this.setState({operator: ''});
      } else if (this.state.category !== '') {
        this.setState({category: '', label: ''});
      } else {
        // No tokens
        if (!this.state.selected.length) {
          return;
        }
        this._removeTokenForValue(
          this.state.selected[this.state.selected.length - 1]
        );
      }
      event.preventDefault();
    }
  }

  _removeTokenForValue (value, updateLocalStorage = true) {
    var index = this.state.selected.indexOf(value);
    if (index === -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({selected: this.state.selected});
    this.props.onTokenRemove(this.state.selected);

    if (updateLocalStorage) {
      // now we have the token list and can store it in the localStorage
      if (this.checkStorage()) {
        let search = JSON.stringify(this.state.selected); // stringify all selected token
        localStorage.setItem('searchToken_' + this.props.uniqueIdentifier, search);
      }
    }

    return;
  }

  // If the user wants to edit a token we need to remove the token
  // and add the given values to the state. Also we need to set the
  // typeahead value to the tokens old value and give the focus to the field.
  _editToken (token) {
    this._removeTokenForValue(token);
    this.setState({category: token.category, operator: token.operator, label: token.label});
    // Set the entered text or selected value
    ReactDOM.findDOMNode(this.refs.typeahead.refs.inner.refs.entry).value = token.value;

    // And also set the state of the typeahead component
    this.refs.typeahead.refs.inner._onTextEntryUpdated();
    ReactDOM.findDOMNode(this.refs.typeahead.refs.inner.refs.entry).focus();
  }

  _addTokenForValue (value) {
    if (this.state.category === '') {
      // need to find the proper label
      let label = value;
      this.props.options.forEach(function (option) {
        if (option.category === value) {
          label = option.label;
        }
      });
      this.setState({category: value, label: label});
      this.refs.typeahead.refs.inner.setEntryText('');
      return;
    }

    if (this.state.operator === '') {
      this.setState({operator: value});
      this.refs.typeahead.refs.inner.setEntryText('');
      return;
    }
    value = {'category': this.state.category, 'label': this.state.label, 'operator': this.state.operator, 'value': value};

    // this.state.selected.push(value);
    let selected = this.state.selected;
    selected.push(value);
    this.setState({selected: selected});
    this.refs.typeahead.refs.inner.setEntryText('');
    this.props.onTokenAdd(this.state.selected);

    // now we have the list of token and can store them in the localStorage
    console.log('uniqueId: ' + this.props.uniqueIdentifier);
    if (this.checkStorage()) {
      let search = JSON.stringify(this.state.selected); // stringify all selected token
      localStorage.setItem('searchToken_' + this.props.uniqueIdentifier, search);
    }
    this.setState({category: '', operator: '', label: ''});
    return;
  }

  /*
   * Returns the data type the input should use ('date' or 'text')
   */
  _getInputType () {
    if (this.state.category !== '' && this.state.operator !== '') {
      return this._getCategoryType();
    } else {
      return 'text';
    }
  }

  checkStorage () { // check if the localStorage exists
    var uid = new Date().toString();
    var storage;
    var result;
    try {
      (storage = localStorage).setItem('uid', uid);
      result = storage.getItem('uid') === uid;
      storage.removeItem('uid');
      return result && storage;
    } catch (exception) {}
    return false;
  }

  render () {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    return (
      <div className='filter-tokenizer'>
        <span className='input-group-addon'>
          <i className='fa fa-search'></i>
        </span>
        <div className='token-collection'>
          {this._renderTokens()}
          <div className='filter-input-group'>
            <div className='filter-category'>{this.state.label} </div>
            <div className='filter-operator'>{this.state.operator} </div>

            <Typeahead ref='typeahead'
              className={classList}
              placeholder={this.props.placeholder}
              customClasses={this.props.customClasses}
              options={this._getOptionsForTypeahead()}
              header={this._getHeader()}
              datatype={this._getInputType()}
              defaultValue={this.props.defaultValue}
              onOptionSelected={this._addTokenForValue}
              onKeyDown={this._onKeyDown} />
            </div>
          </div>
      </div>
    );
  }
}

TypeaheadTokenizer.defaultProps = {
  options: [],
  defaultSelected: [],
  customClasses: {},
  defaultValue: '',
  placeholder: '',
  onTokenAdd: function () {},
  onTokenRemove: function () {}
};

const mapStateToProps = (state) => ({
  type: state.list[state.list.object].type
});

// export default TypeaheadTokenizer;
export default connect(mapStateToProps)(TypeaheadTokenizer);

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TypeaheadSelector from './selector';
import KeyEvent from '../keyevent';
import fuzzy from 'fuzzy';
import DatePicker from '../../react-datepicker/datepicker.js';
import moment from 'moment';
import classNames from 'classnames';
import listensToClickOutside from 'react-onclickoutside/decorator';

/**
 * A 'typeahead', an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
class Typeahead extends React.Component {
  static propTypes = {
    customClasses: PropTypes.object,
    maxVisible: PropTypes.number,
    options: PropTypes.array,
    header: PropTypes.string,
    datatype: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    onOptionSelected: PropTypes.func,
    onKeyDown: PropTypes.func,
    className: PropTypes.string
  };

  handleClickOutside = (event) => {
    this.setState({focused: false});
  };

  constructor (props) {
    super(props);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.getOptionsForValue = this.getOptionsForValue.bind(this);
    this.setEntryText = this.setEntryText.bind(this);
    this._renderIncrementalSearchResults = this._renderIncrementalSearchResults.bind(this);
    this._onOptionSelected = this._onOptionSelected.bind(this);
    this._onTextEntryUpdated = this._onTextEntryUpdated.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onEscape = this._onEscape.bind(this);
    this._onTab = this._onTab.bind(this);
    this.eventMap = this.eventMap.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this.isDescendant = this.isDescendant.bind(this);
    this._handleDateChange = this._handleDateChange.bind(this);
    this._showDatePicker = this._showDatePicker.bind(this);
    this.inputRef = this.inputRef.bind(this);
    this.state = {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      options: this.props.options,
      header: this.props.header,
      datatype: this.props.datatype,

      focused: false,

      // The currently visible set of options
      visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

      // This should be called something else, 'entryValue'
      entryValue: this.props.defaultValue,

      // A valid typeahead value
      selection: null
    };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({options: nextProps.options,
      header: nextProps.header,
      datatype: nextProps.datatype,
      visible: nextProps.options});
  }

  getOptionsForValue (value, options) {
    let _options = [];
    let isLabeledOption = false; // is it a labeled option?
    let _labeled = {};
    options.forEach(function (v) {
      if (typeof v !== 'string' && typeof v === 'object' && 'label' in v && v.label) {
        isLabeledOption = true;
        _options.push(v.label.toString());
        _labeled[v.label.toString()] = v.category;
      } else {
        _options.push(v.toString()); // keep old style
      }
    });
    var result = fuzzy.filter(value, _options).map(function (res) {
      return res.string;
    });

    if (isLabeledOption) {
      let _result = [];
      result.forEach(function (value) {
        _result.push({category: _labeled[value], label: value});
      });
      return _result;
    }
    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  }

  setEntryText (value) {
    if (this.refs.entry != null) {
      ReactDOM.findDOMNode(this.refs.entry).value = value;
    }
    this._onTextEntryUpdated();
  }

  _renderIncrementalSearchResults () {
    if (!this.state.focused) {
      return '';
    }

    // Something was just selected
    if (this.state.selection) {
      return '';
    }

    // There are no typeahead / autocomplete suggestions
    if (!this.state.visible.length) {
      return '';
    }

    return (
      <TypeaheadSelector
        ref='sel' options={this.state.visible} header={this.state.header}
        onOptionSelected={this._onOptionSelected}
        customClasses={this.props.customClasses} />
    );
  }

  _onOptionSelected (option) {
    var nEntry = ReactDOM.findDOMNode(this.refs.entry);
    nEntry.focus();
    nEntry.value = option;
    this.setState({visible: this.getOptionsForValue(option, this.state.options),
                   selection: option,
                   entryValue: option});

    this.props.onOptionSelected(option);
  }

  _onTextEntryUpdated () {
    var value = '';
    if (this.refs.entry != null) {
      value = ReactDOM.findDOMNode(this.refs.entry).value;
    }
    this.setState({visible: this.getOptionsForValue(value, this.state.options),
                   selection: null,
                   entryValue: value});
  }

  _onEnter (event) {
    if (!this.refs.sel.state.selection) {
      return this.props.onKeyDown(event);
    }
    let selection = this.refs.sel.state.selection;
    if (typeof selection !== 'string' && 'category' in selection) {
      this._onOptionSelected(selection.category);
    } else {
      this._onOptionSelected(selection);
    }
  }

  _onEscape () {
    this.refs.sel.setSelectionIndex(null);
    this.setState({focused: false});
  }

  _onTab (event) {
    var option = this.refs.sel.state.selection ? this.refs.sel.state.selection : this.state.visible[0];
    this._onOptionSelected(option);
  }

  eventMap (event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.refs.sel.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.refs.sel.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  }

  _onKeyDown (event) {
    // If Enter pressed
    if (event.keyCode === KeyEvent.DOM_VK_RETURN || event.keyCode === KeyEvent.DOM_VK_ENTER) {
      // If no options were provided so we can match on anything
      if (this.props.options.length === 0) {
        this._onOptionSelected(this.state.entryValue);
      }

      // If what has been typed in is an exact match of one of the options
      // TODO does not work anymore... search for label?
      if (this.props.options.indexOf(this.state.entryValue) > -1) {
        this._onOptionSelected(this.state.entryValue);
      }
    }

    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.refs.sel) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];
    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  }

  _onFocus (event) {
    this.setState({focused: true});
  }

  isDescendant (parent, child) {
    var node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  _handleDateChange (date) {
    this.props.onOptionSelected(date.format('YYYY-MM-DD'));
  }

  _showDatePicker () {
    if (this.state.datatype === 'date') {
      return true;
    }
    return false;
  }

  inputRef () {
    if (this._showDatePicker()) {
      return this.refs.datepicker.refs.dateinput.refs.entry;
    } else {
      return this.refs.entry;
    }
  }

  render () {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: true
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    if (this._showDatePicker()) {
      return (
        <span ref='input' className={classList} onFocus={this._onFocus}>
          <DatePicker ref='datepicker' dateFormat={'YYYY-MM-DD'}
            selected={moment()} onChange={this._handleDateChange}
            onKeyDown={this._onKeyDown}
          />
        </span>
      );
    }

    return (
      <span ref='input' className={classList} onFocus={this._onFocus}>
        <input ref='entry' type='text'
          placeholder={this.props.placeholder}
          className={inputClassList} defaultValue={this.state.entryValue}
          onChange={this._onTextEntryUpdated} onKeyDown={this._onKeyDown}
          />
        {this._renderIncrementalSearchResults()}
      </span>
    );
  }
}

Typeahead.defaultProps = {
  options: [],
  header: 'Category',
  datatype: 'text',
  customClasses: {},
  defaultValue: '',
  placeholder: '',
  onKeyDown: function (event) { return; },
  onOptionSelected: function (option) { }
};

export default listensToClickOutside(Typeahead);

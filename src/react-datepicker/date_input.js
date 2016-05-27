import React, { PropTypes } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import DateUtil from './util/date';

class DateInput extends React.Component {
  static propTypes = {
    onKeyDown: PropTypes.func,
    date: PropTypes.object,
    focus: PropTypes.bool,
    dateFormat: PropTypes.string,
    setSelected: PropTypes.func,
    handleClick: PropTypes.func,
    onFocus: PropTypes.func,
    placeholderText: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.toggleFocus = this.toggleFocus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.safeDateFormat = this.safeDateFormat.bind(this);
    this.isValueAValidDate = this.isValueAValidDate.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      value: this.safeDateFormat(this.props.date)
    };
  }

  componentDidMount () {
    this.toggleFocus(this.props.focus);
  }

  componentWillReceiveProps (newProps) {
    this.toggleFocus(newProps.focus);

    this.setState({
      value: this.safeDateFormat(newProps.date)
    });
  }

  toggleFocus (focus) {
    if (focus) {
      ReactDOM.findDOMNode(this.refs.entry).focus();
    } else {
      ReactDOM.findDOMNode(this.refs.entry).blur();
    }
  }

  handleChange (event) {
    // var date = moment(event.target.value, this.props.dateFormat, true);

    this.setState({
      value: event.target.value
    });
  }

  safeDateFormat (date) {
    let _date = Boolean(date);
    if (_date) {
      return date.format(this.props.dateFormat);
    } else {
      return null;
    }
  }

  isValueAValidDate () {
    var date = moment(event.target.value, this.props.dateFormat, true);

    return date.isValid();
  }

  handleEnter (event) {
    if (this.isValueAValidDate()) {
      var date = moment(event.target.value, this.props.dateFormat, true);
      this.props.setSelected(new DateUtil(date));
    }
  }

  handleKeyDown (event) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.handleEnter(event);
        break;
      case 'Backspace':
        this.props.onKeyDown(event);
        break;
    }
  }

  handleClick (event) {
    this.props.handleClick(event);
  }

  render () {
    return <input
      ref='entry'
      type='text'
      value={this.state.value}
      onClick={this.handleClick}
      onKeyDown={this.handleKeyDown}
      onFocus={this.props.onFocus}
      onChange={this.handleChange}
      className='datepicker__input'
      placeholder={this.props.placeholderText}
    />;
  }
}

DateInput.defaultProps = {
  dateFormat: 'YYYY-MM-DD'
};

export default DateInput;

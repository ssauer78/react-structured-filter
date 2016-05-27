import React, { PropTypes } from 'react';
import Popover from './popover';
import Calendar from './calendar';
import DateInput from './date_input';

class DatePicker extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    placeholderText: PropTypes.string,
    selected: PropTypes.object.isRequired,
    dateFormat: PropTypes.string.isRequired,
    minDate: PropTypes.string,
    maxDate: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.handleFocus = this.handleFocus.bind(this);
    this.hideCalendar = this.hideCalendar.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.onInputClick = this.onInputClick.bind(this);
    this.calendar = this.calendar.bind(this);

    this.state = {
      focus: true
    };
  }

  handleFocus () {
    this.setState({
      focus: true
    });
  }

  hideCalendar () {
    this.setState({
      focus: false
    });
  }

  handleSelect (date) {
    this.hideCalendar();
    this.setSelected(date);
  }

  setSelected (date) {
    this.props.onChange(date.moment());
  }

  onInputClick () {
    this.setState({
      focus: true
    });
  }

  calendar () {
    if (this.state.focus) {
      return (
        <Popover>
          <Calendar
            selected={this.props.selected}
            onSelect={this.handleSelect}
            hideCalendar={this.hideCalendar}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate} />
        </Popover>
      );
    }
  }

  render () {
    return (
      <div>
        <DateInput
          ref='dateinput'
          date={this.props.selected}
          dateFormat={this.props.dateFormat}
          focus={this.state.focus}
          onFocus={this.handleFocus}
          onKeyDown={this.props.onKeyDown}
          handleClick={this.onInputClick}
          handleEnter={this.hideCalendar}
          setSelected={this.setSelected}
          hideCalendar={this.hideCalendar}
          placeholderText={this.props.placeholderText} />
        {this.calendar()}
      </div>
    );
  }
}

export default DatePicker;

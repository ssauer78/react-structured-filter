import React, { PropTypes } from 'react';
import Day from './day';
import DateUtil from './util/date';
import moment from 'moment';
import listensToClickOutside from 'react-onclickoutside/decorator';

class Calendar extends React.Component {
  static propTypes = {
    hideCalendar: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    minDate: PropTypes.object,
    maxDate: PropTypes.object,
    selected: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.increaseMonth = this.increaseMonth.bind(this);
    this.decreaseMonth = this.decreaseMonth.bind(this);
    this.weeks = this.weeks.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.renderWeek = this.renderWeek.bind(this);
    this.renderDay = this.renderDay.bind(this);
    this.days = this.days.bind(this);
    this.state = {
      date: new DateUtil(this.props.selected).safeClone(moment())
    };
  }

  handleClickOutside = (event) => {
    this.props.hideCalendar();
  };

  increaseMonth () {
    this.setState({
      date: this.state.date.addMonth()
    });
  }

  decreaseMonth () {
    this.setState({
      date: this.state.date.subtractMonth()
    });
  }

  weeks () {
    return this.state.date.mapWeeksInMonth(this.renderWeek);
  }

  handleDayClick (day) {
    this.props.onSelect(day);
  }

  renderWeek (weekStart, key) {
    if (!weekStart.weekInMonth(this.state.date)) {
      return;
    }

    return (
      <div key={key}>
        {this.days(weekStart)}
      </div>
    );
  }

  renderDay (day, key) {
    var minDate = new DateUtil(this.props.minDate).safeClone();
    var maxDate = new DateUtil(this.props.maxDate).safeClone();
    var disabled = day.isBefore(minDate) || day.isAfter(maxDate);

    return (
      <Day
        key={key}
        day={day}
        date={this.state.date}
        onClick={this.handleDayClick.bind(this, day)}
        selected={new DateUtil(this.props.selected)}
        disabled={disabled} />
    );
  }

  days (weekStart) {
    return weekStart.mapDaysInWeek(this.renderDay);
  }

  render () {
    return (
      <div className='datepicker'>
        <div className='datepicker__triangle'></div>
        <div className='datepicker__header'>
          <a className='datepicker__navigation datepicker__navigation--previous'
            onClick={this.decreaseMonth}>
          </a>
          <span className='datepicker__current-month'>
            {this.state.date.format('MMMM YYYY')}
          </span>
          <a className='datepicker__navigation datepicker__navigation--next'
            onClick={this.increaseMonth}>
          </a>
          <div>
            <div className='datepicker__day'>Mo</div>
            <div className='datepicker__day'>Tu</div>
            <div className='datepicker__day'>We</div>
            <div className='datepicker__day'>Th</div>
            <div className='datepicker__day'>Fr</div>
            <div className='datepicker__day'>Sa</div>
            <div className='datepicker__day'>Su</div>
          </div>
        </div>
        <div className='datepicker__month'>
          {this.weeks()}
        </div>
      </div>
    );
  }
}

export default listensToClickOutside(Calendar);

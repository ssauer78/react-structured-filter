import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';

class Day extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    day: PropTypes.object.isRequired,
    selected: PropTypes.object.isRequired
  };

  handleClick (event) {
    if (this.props.disabled) {
      return;
    }

    this.props.onClick(event);
  }

  render () {
    let classes = classNames({
      'datepicker__day': true,
      'datepicker__day--disabled': this.props.disabled,
      'datepicker__day--selected': this.props.day.sameDay(this.props.selected),
      'datepicker__day--today': this.props.day.sameDay(moment())
    });

    return (
      <div className={classes} onClick={this.handleClick.bind(this)}>
        {this.props.day.day()}
      </div>
    );
  }
}

export default Day;

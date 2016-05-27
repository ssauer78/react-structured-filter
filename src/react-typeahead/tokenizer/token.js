import React from 'react';

/*
 * Encapsulates the rendering of an option that has been 'selected' in a
 * TypeaheadTokenizer
 */
class Token extends React.Component {
  static propTypes = {
    children: React.PropTypes.object,
    onRemove: React.PropTypes.func,
    onEdit: React.PropTypes.func
  };

  _makeCloseButton () {
    if (!this.props.onRemove) {
      return '';
    }
    return (
      <a className='typeahead-token-close' href='#' onClick={function (event) {
        this.props.onRemove(this.props.children);
        event.preventDefault();
      }.bind(this)}>&#x00d7;</a>
    );
  }

  onDoubleClick () {
    if (!this.props.onEdit) { // function not given, we do nothing
      return '';
    }
    this.props.onEdit(this.props.children);
  }

  render () {
    return (
      <div {...this.props} className='typeahead-token' onDoubleClick={this.onDoubleClick.bind(this)}>
        {this.props.children['label']} {this.props.children['operator']} '{this.props.children['value']}'
        {this._makeCloseButton()}
      </div>
    );
  }
}

export default Token;

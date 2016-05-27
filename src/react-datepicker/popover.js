import React, { PropTypes } from 'react';
import Tether from 'tether';
import ReactDOM from 'react-dom';

class Popover extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.object
  };

  constructor (props) {
    super(props);
    this._popoverComponent = this._popoverComponent.bind(this);
    this._tetherOptions = this._tetherOptions.bind(this);
    this._renderPopover = this._renderPopover.bind(this);
  }

  componentWillMount () {
    let popoverContainer = document.createElement('span');
    popoverContainer.className = 'datepicker__container';

    this._popoverElement = popoverContainer;

    document.querySelector('body').appendChild(this._popoverElement);
  }

  componentWillUnmount () {
    this._tether.destroy();
    ReactDOM.unmountComponentAtNode(this._popoverElement);
    if (this._popoverElement.parentNode) {
      this._popoverElement.parentNode.removeChild(this._popoverElement);
    }
  }

  componentDidMount () {
    this._renderPopover();
  }

  componentDidUpdate () {
    this._renderPopover();
  }

  _popoverComponent () {
    var className = this.props.className;
    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }

  _tetherOptions () {
    return {
      element: this._popoverElement,
      target: ReactDOM.findDOMNode(this).parentElement,
      attachment: 'top left',
      targetAttachment: 'bottom left',
      targetOffset: '10px 0',
      optimizations: {
        moveElement: false // always moves to <body> anyway!
      },
      constraints: [
        {
          to: 'window',
          attachment: 'together',
          pin: true
        }
      ]
    };
  }

  _renderPopover () {
    ReactDOM.render(this._popoverComponent(), this._popoverElement);

    if (this._tether != null) {
      this._tether.setOptions(this._tetherOptions());
    } else {
      this._tether = new Tether(this._tetherOptions());
    }
  }

  render () {
    return <span/>;
  }
}

export default Popover;

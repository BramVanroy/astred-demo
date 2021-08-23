import '../styles/Details.css';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';


class Details extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {detailsVisible: false};
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick() {
    this.setState({
      detailsVisible: !this.state.detailsVisible,
    });
  }

  render() {
    const className = this.state.detailsVisible ? 'details open' : 'details';
    return (
      <aside className={className}>
        <p><button onClick={this.onButtonClick}>{this.state.detailsVisible ? 'Read less' : 'Read more'}</button></p>
        <div className="content">
          {this.props.children}
        </div>
      </aside>
    );
  }
}

Details.propTypes = {
  children: PropTypes.any,
};


export default Details;

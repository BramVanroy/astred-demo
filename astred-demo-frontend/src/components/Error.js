import '../styles/Error.css';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';


class Error extends PureComponent {
  render() {
    return (
      <section id="error">
        <div className="content">
          <h2><span>Oops!</span> An error occurred</h2>
          <p>It seems that something went wrong when running this demo. If the error persists, <a href="http://bramvanroy.be" title="Home page Bram Vanroy" target="_blank" rel="noreferrer noopener">get in touch</a>! Make sure to mention the error message that is displayed below as well as what you were trying to do exactly.</p>
          <p className="error-msg">{this.props.error}</p>
          <p>Refresh to try again.</p>
        </div>
      </section>
    );
  }
}

Error.propTypes = {
  error: PropTypes.string,
};

export default Error;

import '../styles/Publication.css';

import React, {PureComponent} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';


class Publication extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="publication">
        <a href={this.props.url} title={this.props.title} target="_blank" rel="noreferrer noopener"><FontAwesomeIcon icon={this.props.iconName} /></a>
        <div className="content">
          {this.props.contents}
        </div>
      </div>
    );
  }
}

Publication.propTypes = {
  contents: PropTypes.node,
  iconName: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,
};


export default Publication;

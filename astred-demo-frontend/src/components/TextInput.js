import React, {PureComponent} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';


class TextInput extends PureComponent {
  render() {
    return (
      <label title={this.props.label}><FontAwesomeIcon icon={this.props.iconName} />
        <input name={this.props.name} type="text" value={this.props.value} onChange={this.props.onChange} maxLength="256"
          pattern={this.props.isAlignField ? '\\s*(?:\\d+-\\d+)(?:\\s\\d+-\\d+)*\\s*' : null} />
      </label>
    );
  }
}

TextInput.defaultProps = {
  iconName: 'font',
  isAlignField: false,
};

TextInput.propTypes = {
  iconName: PropTypes.string,
  isAlignField: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};


export default TextInput;

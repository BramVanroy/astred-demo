import React, {PureComponent} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';


class CheckboxInput extends PureComponent {
  render() {
    return (
      <label title={this.props.title}><span><FontAwesomeIcon icon={this.props.iconName} />{this.props.label}</span>
        <input name={this.props.name} type="checkbox" checked={this.props.checked} onChange={(evt) => this.props.onChange(evt.target)} />
      </label>
    );
  }
}

CheckboxInput.propTypes = {
  checked: PropTypes.bool,
  iconName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  title: PropTypes.string,
};


export default CheckboxInput;

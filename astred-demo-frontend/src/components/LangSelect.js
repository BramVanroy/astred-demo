import React, {PureComponent} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';


class LangSelect extends PureComponent {
  render() {
    return (
      <label title={this.props.label}><span><FontAwesomeIcon icon="language" /></span>
        <select name={this.props.name} value={this.props.value} onChange={this.props.onChange}>
          {
            this.props.languages.map((lang, index) => <option value={lang[1]} key={index}>{lang[0]}</option>)
          }
        </select>
      </label>
    );
  }
}

LangSelect.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  languages: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};


export default LangSelect;

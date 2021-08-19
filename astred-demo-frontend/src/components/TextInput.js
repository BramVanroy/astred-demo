import { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class TextInput extends PureComponent {    
    render() {
        return (
            <label title={this.props.label}><FontAwesomeIcon icon={this.props.iconName} />
                <input name={this.props.name} type="text" value={this.props.value} onChange={this.props.onChange} maxLength="256" 
                pattern={this.props.isAlignField ? "\\s*(?:\\d+-\\d+)(?:\\s\\d+-\\d+)*\\s*" : null} className={this.props.invalid ? "invalid" : ""} />
            </label>
        )
    }
}

TextInput.defaultProps = {
    iconName: "font",
    isAlignField: false,
    // Cannot use :invalid pseudo-selector because "required" triggers
    // invalid from the start without any value
    invalid: false
  };

export default TextInput

import { PureComponent } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class CheckboxInput extends PureComponent {    
    render() {
        return (
            <label title={this.props.title}><span><FontAwesomeIcon icon={this.props.iconName} />{this.props.label}</span>
                <input name={this.props.name} type="checkbox" checked={this.props.checked} onChange={evt => this.props.onChangeCheckbox(evt.target)} />
            </label>
        )
    }
}


export default CheckboxInput

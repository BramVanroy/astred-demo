import { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class LangSelect extends PureComponent {
    render() {
        return (
            <label title={this.props.label}><span><FontAwesomeIcon icon="language" /></span>
                <select name={this.props.name} defaultValue={this.props.defaultValue} onChange={this.props.onChange}>
                    {
                        this.props.languages.map((lang, index) => <option value={lang[1]} key={index}>{lang[0]}</option>)
                    }
                </select>
            </label>
        )
    }
}

export default LangSelect

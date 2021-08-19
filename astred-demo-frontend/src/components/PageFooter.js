import React, { PureComponent } from 'react'

import '../styles/PageFooter.css';


class PageFooter extends PureComponent {
    render() {
        return (
            <footer id="page-footer">
            <p>Built by <a href="http://bramvanroy.be" title="Home page Bram Vanroy" target="_blank" rel="noreferrer noopener">Bram Vanroy</a> in light of his completed
             PhD project <a href="https://research.flw.ugent.be/en/projects/predict" title="Predicting difficulty in translation home page" target="_blank" rel="noreferrer noopener">PreDicT</a>.</p>
             <p>The code for this demo is available on Github. It makes use of the <a href="https://github.com/BramVanroy/astred" title="ASTrED Python library" target="_blank" rel="noreferrer noopener">ASTrED</a> library.</p>
          </footer>
        );
    }
}

export default PageFooter;

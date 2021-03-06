import '../styles/PageFooter.css';

import React from 'react';


function PageFooter() {
  return (
    <footer id="page-footer">
      <p>Built by <a href="http://bramvanroy.be" title="Home page Bram Vanroy" target="_blank" rel="noreferrer noopener">Bram Vanroy</a> in light of his completed
             PhD project <a href="https://research.flw.ugent.be/en/projects/predict" title="Predicting difficulty in translation home page" target="_blank" rel="noreferrer noopener">PreDicT</a>.</p>
      <p>The code for this demo is <a href="https://github.com/BramVanroy/astred-demo" title="ASTrED demo source code" target="_blank" rel="noreferrer noopener">available on Github</a>. It makes use of the <a href="https://github.com/BramVanroy/astred" title="ASTrED Python library" target="_blank" rel="noreferrer noopener">ASTrED</a> library.</p>
    </footer>
  );
}

export default PageFooter;

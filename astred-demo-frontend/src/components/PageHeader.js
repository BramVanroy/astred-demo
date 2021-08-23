import '../styles/PageHeader.css';

import React from 'react';


function PageHeader() {
  return (
    <header id="page-header">
      <div className="content">
        <h1>ASTrED demo</h1>
        <p>Automatically tokenize and align two sentences, and calculate <span>syntactic similarity metrics</span></p>
      </div>
    </header>
  );
}

export default PageHeader;

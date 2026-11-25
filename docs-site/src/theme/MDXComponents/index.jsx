import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

// Preserve native table semantics while making horizontal scrolling keyboard-accessible.
export default {...MDXComponents,table:props=><table {...props} tabIndex={0}/>};

import React from 'react';

import NavBarContainer from '../containers/NavBarContainer';
import StreamingHolderContainer from '../containers/StreamingHolderContainer';
import ThemeContainer from '../containers/ThemeContainer';

const Frame = ({ children }) => {
  return (
    <div style={{width: '100%', minWidth: '1024px'}}>
      <NavBarContainer />
      <div style={{ paddingTop: '70px' }} />
      <div className="container" style={{position: 'relative' }}>
        <div style={{position: 'absolute', right: '15px'}}>
          <div className="addthis_sharing_toolbox"></div>
        </div>
        <StreamingHolderContainer />
        {children}
      </div>
      <footer>
        <div className="container" style={{ textAlign: 'right' }}>
          LiveSite by ICPC Secretaries
        </div>
      </footer>
      <ThemeContainer />
    </div>
  );
};

export default Frame;

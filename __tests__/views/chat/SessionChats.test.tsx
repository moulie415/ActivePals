import React from 'react';
import {shallow} from 'enzyme';
import SessionChats from '../../../app/views/chat/SessionChats';
import {SessionChatsNavigationProp} from '../../../app/types/views/chat/SessionChats';

describe('SessionChats', () => {

  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(
        <SessionChats navigation={{} as SessionChatsNavigationProp} />,
      );
      expect(component).toMatchSnapshot();
    });
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import SessionChats from '../../../app/views/chat/SessionChats';
import mockStore from '../../__mocks__/mockstore';
import friends from '../../fixtures/friends';
import profile from '../../fixtures/profile';
import chats from '../../fixtures/chats';

describe('SessionChats', () => {
  const initialState = { friends: { friends }, profile: { profile }, chats: { chats } };
  const store = mockStore(initialState);
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(<SessionChats store={store} />);
      expect(component).toMatchSnapshot();
    });
  });
});

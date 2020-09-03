import React from 'react';
import { shallow } from 'enzyme';
import SignUp from '../../app/views/SignUp';
import mockStore from '../__mocks__/mockstore';

describe('SignUp', () => {
  const initialState = {};
  const store = mockStore(initialState);
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(<SignUp store={store} />);
      expect(component).toMatchSnapshot();
    });
  });
});

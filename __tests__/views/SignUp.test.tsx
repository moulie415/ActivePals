import React from 'react';
import {shallow} from 'enzyme';
import SignUp from '../../app/views/SignUp';
import {SignUpNavigationProp} from '../../app/types/views/SignUp';

describe('SignUp', () => {
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(
        <SignUp navigation={{} as SignUpNavigationProp} />,
      );
      expect(component).toMatchSnapshot();
    });
  });
});

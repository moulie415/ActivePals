import React from 'react';
import { shallow } from 'enzyme';
import Button from '../../app/components/Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(<Button text="test" />);
      expect(component).toMatchSnapshot();
    });
  });
});

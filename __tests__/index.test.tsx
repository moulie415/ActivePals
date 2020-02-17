import React from 'react';
import { shallow } from 'enzyme';
import Index from '../index';

describe('Index', () => {
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(<Index />);
      expect(component).toMatchSnapshot();
    });
  });
});

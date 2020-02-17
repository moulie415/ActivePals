import React from 'react';
import { shallow } from 'enzyme';
import Credits from '../../app/views/Credits';

describe('Credits', () => {
  describe('Rendering', () => {
    it('should match to snapshot', () => {
      const component = shallow(<Credits />);
      expect(component).toMatchSnapshot();
    });
  });
});

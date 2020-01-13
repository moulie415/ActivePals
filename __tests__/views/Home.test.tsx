import React from 'react';
import { shallow } from 'enzyme';
import Home  from '../../app/views/Home';

describe('Home', () => {
    describe('Rendering', () => {
        it('should match to snapshot', () => {
            const component = shallow(
                <Home />
            )
            expect(component).toMatchSnapshot()
        });
    });
});

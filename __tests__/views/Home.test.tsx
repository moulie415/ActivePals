import React from 'react';
import { shallow } from 'enzyme';
import { Home } from '../../app/views/Home';
import profile from '../fixtures/profile';

describe('Button', () => {
    describe('Rendering', () => {
        it('should match to snapshot', () => {
            const component = shallow(
                <Home
                    profile={profile}
                    friends={{ qwerty: profile }}
                />
            )
            expect(component).toMatchSnapshot()
        });
    });
});

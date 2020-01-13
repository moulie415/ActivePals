import React from 'react';
import { shallow } from 'enzyme';
import Home  from '../../app/views/Home';
import profile from '../fixtures/profile';
import post from '../fixtures/post';
import rep from '../fixtures/rep';

const uid = 'L3Y01ZOzb6PULpd1rQ6wBRpNQEG3';

const users = { [uid]: profile };

const testFunc = () => 0;

describe('Button', () => {
    describe('Rendering', () => {
        it('should match to snapshot', () => {
            const component = shallow(
                <Home />
                // <Home
                //     profile={profile}
                //     friends={users}
                //     feed={{ uid: post }}
                //     users={users}
                //     viewPost={testFunc}
                //     goToProfile={testFunc}
                //     viewProfile={testFunc}
                //     postStatus={testFunc}
                //     onRepPost={testFunc}
                //     comment={testFunc}
                //     getCommentRepsUsers={testFunc}
                //     getRepsUsers={testFunc}
                //     getComments={testFunc}
                //     getFriends={testFunc}
                //     getReplies={testFunc}
                //     getPosts={testFunc}
                //     getProfile={testFunc}
                //     navigateFullScreenVideo={testFunc}
                //     repComment={testFunc}
                //     previewFile={testFunc}
                //     onNotificationPress={testFunc}
                //     repsUsers={{ qwerty: rep }}
                    
                // />
            )
            expect(component).toMatchSnapshot()
        });
    });
});

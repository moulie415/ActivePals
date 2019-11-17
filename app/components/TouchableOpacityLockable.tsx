import React, { Component } from 'react'

import { 
    TouchableOpacity,
} from 'react-native'

export default class TouchableOpacityLockable extends Component {

    constructor(props) {
        super(props)
        this.lock = false
        this.lockedAt = undefined
        this.mutex = {
            lock: () => this.lock = true,
            unlock: () => this.lock = false,
            lockFor: ms => {
                if (ms) {
                    this.lock = true
                    this.lockTimer = {lockedAt: Date.now(), lockFor: ms}
                }
            }
        }
    }

    render() {
        return <TouchableOpacity 
        {...this.props}
        onPress = { () => {
            if (this.props.onPress) {
                if (this.lockTimer && Date.now() - this.lockTimer.lockedAt >= this.lockTimer.lockFor) {
                    this.lock = false
                    this.lockTimer = undefined
                }
                if (!this.lock) {
                    this.props.onPress(this.mutex)
                }
            }
        }}>
            {this.props.children}
        </TouchableOpacity>
    }
}
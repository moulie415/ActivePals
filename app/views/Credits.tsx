import React, { Component } from "react"
import Header from '../components/Header/header'
import {
    View,
    Image
} from 'react-native'
import {
    Container,
    Content
} from 'native-base'
import Text from '../components/Text'
import { getResource , getType} from '../constants/utils'
import Hyperlink from 'react-native-hyperlink'
import colors from '../constants/colors'

// football icon made by Christopher Schreiner @infanf http://twitter.com/infanf

class Credits extends Component {

    render() {
        return <Container>
            <Header 
                hasBack={true}
                title={'Credits'}
            />
            <Content>
                <Hyperlink
                linkDefault={true}
                linkStyle={ { color: colors.secondary } }
                linkText={ url => {
                    switch(url) {
                        case 'http://twitter.com/Templarian':
                            return '@Templarian'
                        case 'http://twitter.com/Google':
                            return '@Google'
                        case 'http://okodesign.ru/':
                            return 'okodesign.ru'
                        case 'http://www.freepik.com/':
                            return 'www.freepik.com'
                        case 'https://www.flaticon.com/authors/monkik':
                            return 'www.flaticon.com/authors/monkik'
                        case 'https://www.zapsplat.com':
                            return 'zapsplat.com'
                        default: {
                            return url
                        }
                    }
                    }}
                >
                    <Text style={{textAlign:'center', fontSize: 30, fontWeight: 'bold', marginTop: 20}}>Icon designers</Text>
                    <View style={{alignItems: 'center', flexDirection: 'row', alignSelf: 'center'}}>
                        {getType('Gym', 30)}
                        {getType('Running', 30)}
                        {getType('Custom', 30)}
                    </View>
                    <Text style={{textAlign:'center', marginHorizontal: 20, marginBottom: 10}}>Icons made by Austin Andrews http://twitter.com/Templarian</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
                        {renderImage(require('../../assets/images/weightlifting_up.png'), 30, 5)}
                        {renderImage(require('../../assets/images/weightlifting_down.png'), 30, 5)}  
                    </View>
                    <Text style={{textAlign:'center', marginHorizontal: 20, marginBottom: 10}}>
                    {'Icons made by Elias Bikbulatov from \nhttp://okodesign.ru/'}</Text>
                    <View style={{alignItems: 'center'}}>
                    {getType('Cycling', 30)}
                    <Text style={{textAlign:'center', marginHorizontal: 20, marginBottom: 10}}>Icon made by http://twitter.com/Google</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                    {renderImage(require('../../assets/images/muscle.png'), 30, 5)}  
                    <Text style={{textAlign:'center', marginHorizontal: 20, marginBottom: 10}}>
                    {'Icon made by Freepik from \nhttp://www.freepik.com/'}</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                    {renderImage(require('../../assets/images/logo.png'), 30, 5)}  
                    <Text style={{textAlign:'center', marginHorizontal: 20, marginBottom: 10}}>
                    {'Icon made by monkik from \nhttps://www.flaticon.com/authors/monkik'}</Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                     
                    <Text style={{textAlign:'center', marginHorizontal: 20, marginBottom: 10}}>
                    {'Sound effects obtained from \nhttps://www.zapsplat.com'}</Text>
                    </View>
                </Hyperlink>

            </Content>
        </Container>
    }
}

const renderImage = (require, size,  margin, color = '#000') => {
    return <Image 
        style={{height: size, width: size, tintColor: color, margin}}
        source={require}
    />
}
import { connect } from 'react-redux'

export default connect(null, null)(Credits)
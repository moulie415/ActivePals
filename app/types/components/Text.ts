import { StyleProp, TextStyle } from "react-native";

export default interface TextProps {
    style?: StyleProp<TextStyle>;
    adjustFontSizeToFit?: boolean;
}
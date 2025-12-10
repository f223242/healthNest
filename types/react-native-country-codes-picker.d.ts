declare module 'react-native-country-codes-picker' {
    import { ComponentType } from 'react';
    import { StyleProp, TextStyle, ViewStyle } from 'react-native';

    export interface CountryPickerProps {
        show: boolean;
        lang?: string;
        style?: {
            modal?: StyleProp<ViewStyle>;
            backdrop?: StyleProp<ViewStyle>;
            textInput?: StyleProp<TextStyle>;
            countryButtonStyles?: StyleProp<ViewStyle>;
            dialCode?: StyleProp<TextStyle>;
            countryName?: StyleProp<TextStyle>;
        };
        pickerButtonOnPress: (item: {
            dial_code: string;
            code: string;
            name: string;
            flag: string;
        }) => void;
        onBackdropPress?: () => void;
        enableModalAvoiding?: boolean;
        androidWindowSoftInputMode?: string;
        inputPlaceholder?: string;
        searchMessage?: string;
        lang?: string;
        // Add other props as needed, using any for safety if unsure
        [key: string]: any;
    }

    export const CountryPicker: ComponentType<CountryPickerProps>;
}

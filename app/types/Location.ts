export default interface Location {
    adminArea: string;
    country: string;
    countryCode: string;
    feature: string;
    formattedAddress: string;
    locality: string;
    position: Position;
    postalCode: string;
    streetName: string;
    subAdminArea: string;
    subLocality: string;
}

export interface Position {
    lat: number;
    lng: number
}
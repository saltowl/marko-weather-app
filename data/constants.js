export const STATUS = {
    INIT: 'INITIAL',
    DISPLAY: 'DISPLAY'
};

export const INITIAL_STATE = {
    status: STATUS.INIT,
    pressure: 0,
    temp: 0,
    humidity: 0,
    sunrise: 0,
    sunset: 0,
    icon: '',
    main: '',
    wind_deg: "0deg",
    wind_speed: 0,
    description: ''
};
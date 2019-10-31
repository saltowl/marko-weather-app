import { expect } from 'chai';
import { INITIAL_STATE, STATUS } from '../data/constants'

const Weather = require('../components/weather/component');
const weather = new Weather();

describe('Weather component', () => {
    
    it('convert time correctly', () => {
        expect(weather.processTimeString(1572496341)).to.equal('7:32 AM');
        expect(weather.processTimeString(1572530028)).to.equal('4:53 PM');
    });
    
    it('fill state with data', () => {
        const data = {
            base: "stations",
            clouds: {all: 75},
            cod: 200,
            coord: {lon: 37.62, lat: 55.75},
            dt: 1572515073,
            id: 524901,
            main: {temp: -2.4, pressure: 1021, humidity: 79, temp_min: -3, temp_max: -1.11},
            name: "Moscow",
            sys: {type: 1, id: 9027, country: "RU", sunrise: 1572496341, sunset: 1572530028},
            timezone: 10800,
            visibility: 10000,
            weather: [{id: 620, main: "Snow", description: "light shower snow", icon: "13d"}],
            wind: {speed: 6, deg: 290},
        };

        const resultState = {
            status: STATUS.DISPLAY,
            pressure: '766 mmHg',
            temp: '-2.4 °C',
            humidity: '79%',
            sunrise: '7:32 AM',
            sunset: '4:53 PM',
            icon: '13d',
            main: 'Snow',
            wind_deg: '290deg',
            wind_speed: '6 m/s',
            description: 'Light shower snow',
            message: ''
        };

        weather.fillState(data);
        expect(weather.state).to.deep.equal(resultState);
    });

    it('reset state', () => {
        weather.resetState();
        expect(weather.state).to.deep.equal(INITIAL_STATE);
    });

    describe('data request', () => {

        it('fill state when request an existent city', (done) => {
            const city = 'Moscow,RU';
            weather.getData(city).then(() => {
                expect(weather.state.status).to.eql(STATUS.DISPLAY);
                expect(weather.state.message).to.eql('');
            }).then(done, done);
        });
    
        it('fill message when request a non-existent city', (done) => {
            const city = '789';
            weather.getData(city).catch(() => {
                expect(weather.state.status).to.eql(STATUS.INIT);
                expect(weather.state.message).to.eql("City isn't found");
            }).then(done, done);
        });

    });
    
});
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import { JSDOM } from 'jsdom';
import { INITIAL_STATE, STATUS, MAX_DISPLAYED_CITIES } from '../data/constants';
import cities from '../data/processed_city.list';
import axios from 'axios';
import Weather from '../components/weather/component';

const weather = new Weather();

chai.use(chaiDom);
const { document } = (new JSDOM(`<!DOCTYPE html>`)).window;
global.document = document;

describe('Weather component', () => {
    
    it('convert time correctly', () => {
        expect(weather.processTimeString(1572496341)).to.equal('7:32 AM');
        expect(weather.processTimeString(1572530028)).to.equal('4:53 PM');
    });
    
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

    it('fill state with data', () => {
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

        it('fill state when request an existent city', function(done) {
            const city = 'Moscow,RU';
            this.sandbox.stub(axios, 'get').returns(new Promise((r) => r({ data })));

            weather.getData(city).then(() => {
                expect(weather.state.status).to.eql(STATUS.DISPLAY);
                expect(weather.state.message).to.eql('');
            }).then(done, done);
        });
    
        it('fill message when request a non-existent city', function(done) {
            const city = '789';
            this.sandbox.stub(axios, 'get').returns(new Promise((_, r) => r({})));

            weather.getData(city).catch(() => {
                expect(weather.state.status).to.eql(STATUS.INIT);
                expect(weather.state.message).to.eql("City isn't found");
            }).then(done, done);
        });

    });

    describe('message', () => {

        it('set message', () => {
            const message = 'Smth';
            weather.showMessage(message);
            expect(weather.state.message).to.eql(message);
        });

        it('reset message', () => {
            weather.resetMessage();
            expect(weather.state.message).to.eql('');
        });

    });

    const $listContainer = document.createElement('div');
    $listContainer.setAttribute('id', 'city_autocomplete-list');
    $listContainer.classList.add('autocomplete-items');
    for (let i = 0; i < 3; i++) {
        let $item = document.createElement('div');
        $item.innerHTML = `<div>${i}<input type="hidden" value="${i}"></div>`
        $listContainer.appendChild($item);
    }
    document.body.appendChild($listContainer);
    const $list = $listContainer.getElementsByTagName('div');

    describe('autocomplete list', () => {

        describe('remove "autocomplete-active" from the item', () => {

            it('remove class "autocomplete-active" from selected element of autocomplete list', () => {
                let selectedNum = 1;
                $list[selectedNum].classList.add('autocomplete-active');
    
                weather.removeActive($list);
    
                expect($list[selectedNum]).not.to.have.class('autocomplete-active');
            });

        });

        describe('add "autocomplete-active" to the item', () => {

            it('add class "autocomplete-active" to the selected element of autocomplete list', () => {
                weather.currentFocus = 0;
    
                weather.addActive($list);
    
                expect($list[weather.currentFocus]).to.have.class('autocomplete-active');
            });
    
            it('not add class "autocomplete-active", if there isn\'t autocomplete list', () => {
                weather.currentFocus = 1;
    
                weather.addActive();
    
                expect($list[weather.currentFocus]).not.to.have.class('autocomplete-active');
            });

        });

        describe('handle key down event in the input "city"', () => {

            const e = {
                keyCode: ''
            };

            it('if the arrow DOWN key is pressed, select next item in the list', () => {
                e.keyCode = 40;
                let focus = 0;
                weather.currentFocus = focus;
                
                weather.handleKeyDown(e);
                
                expect(weather.currentFocus).to.eql(focus + 1);
                let $item = document.getElementById('city_autocomplete-list').getElementsByTagName('div')[weather.currentFocus];
                expect($item).to.have.class('autocomplete-active');
            });
    
            it('if the arrow DOWN key is pressed and there are no more items, select the fist one', () => {
                e.keyCode = 40;
                let focus = $list.length;
                weather.currentFocus = focus;
                
                weather.handleKeyDown(e);
                
                expect(weather.currentFocus).to.eql(0);
                let $item = document.getElementById('city_autocomplete-list').getElementsByTagName('div')[weather.currentFocus];
                expect($item).to.have.class('autocomplete-active');
            });
    
            it('if the arrow UP key is pressed, select previous item in the list', () => {
                e.keyCode = 38;
                let focus = 1;
                weather.currentFocus = focus;
                
                weather.handleKeyDown(e);
                
                expect(weather.currentFocus).to.eql(focus - 1);
                let $item = document.getElementById('city_autocomplete-list').getElementsByTagName('div')[weather.currentFocus];
                expect($item).to.have.class('autocomplete-active');
            });
    
            it('if the arrow UP key is pressed and the current selected is the fist item in the list, select the last one', () => {
                e.keyCode = 38;
                let focus = 0;
                weather.currentFocus = focus;
                
                weather.handleKeyDown(e);
                
                expect(weather.currentFocus).to.eql($list.length - 1);
                let $item = document.getElementById('city_autocomplete-list').getElementsByTagName('div')[weather.currentFocus];
                expect($item).to.have.class('autocomplete-active');
            });

            it('the ENTER key is pressed and there no selected item', () => {
                e.keyCode = 13;
                weather.currentFocus = -1;
                
                let result = weather.handleKeyDown(e);
                
                expect(result).to.be.eql(1);
            });
    
            it('the ENTER key is pressed and there is selected item', () => {
                e.keyCode = 13;
                weather.currentFocus = 1;
                
                let result = weather.handleKeyDown(e);
                
                expect(result).to.be.eql(0);
            });

        });


        describe('handle input event in the input "city"', () => {

            const $inp = document.createElement('input');
            $inp.setAttribute('id', 'city');
            document.body.appendChild($inp);
            
            it('create autocomplete list with correct length', () => {
                $inp.value = 'M';
                let citiesCount = Math.min(cities.length, MAX_DISPLAYED_CITIES);

                weather.handleInput();

                let $citiesList = document.getElementById('city_autocomplete-list');
                expect($citiesList).to.have.length(citiesCount);
            });

            it('left open just one autocomplete list', () => {
                $inp.value = 'P';

                weather.handleInput();

                let $citiesLists = document.getElementsByClassName('autocomplete-items');
                expect($citiesLists).to.have.length(1);
            });

            it('create autocomplete list with correct values', () => {
                $inp.value = 'M';

                weather.handleInput();

                let cityListhtml = `<div><strong>M</strong>ar’ina Roshcha, RU<input type="hidden" value="Mar’ina Roshcha, RU"></div><div><strong>M</strong>erida, VE<input type="hidden" value="Merida, VE"></div><div><strong>M</strong>kuze, ZA<input type="hidden" value="Mkuze, ZA"></div><div><strong>M</strong>ao, DO<input type="hidden" value="Mao, DO"></div><div><strong>M</strong>atoba, JP<input type="hidden" value="Matoba, JP"></div><div><strong>M</strong>utaykutan, RU<input type="hidden" value="Mutaykutan, RU"></div><div><strong>M</strong>orden, CA<input type="hidden" value="Morden, CA"></div><div><strong>M</strong>asama, TZ<input type="hidden" value="Masama, TZ"></div><div><strong>M</strong>bongoté, CF<input type="hidden" value="Mbongoté, CF"></div><div><strong>M</strong>assa, SD<input type="hidden" value="Massa, SD"></div>`;
                let $citiesList = document.getElementById('city_autocomplete-list');
                expect($citiesList).to.contain.html(cityListhtml);
            });

            it('close autocomplete list when item picked', () => {
                $inp.value = 'M';

                weather.handleInput();
                document.getElementById('city_autocomplete-list').firstElementChild.click();

                let $citiesList = document.getElementById('city_autocomplete-list');
                expect($citiesList).not.to.exist;
            });

        });

    });
    
});
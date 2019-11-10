import axios from 'axios';
import cities from '../../data/processed_city.list';
import * as constants from '../../data/constants';

function closeAllLists($el) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    const $inp = document.getElementById('city');
    const $items = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < $items.length; i++) {
        if ($el != $items[i] && $el != $inp) {
          $items[i].parentNode.removeChild($items[i]);
        }
    }
}

module.exports = class {
    onCreate() {
        this.state = constants.INITIAL_STATE;
        this.currentFocus = -1;

        this.fillState = this.fillState.bind(this);
        this.resetState = this.resetState.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.resetMessage = this.resetMessage.bind(this);
        this.getData = this.getData.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.addActive = this.addActive.bind(this);
        this.removeActive = this.removeActive.bind(this);
    }

    onMount() {
        document.addEventListener('click', function (e) {
            closeAllLists(e.target);
        });
    }

    fillState(data) {
        this.state = {
            main: data.weather[0].main,
            pressure: `${(data.main.pressure * 0.75006375541921).toFixed(0)} mmHg`,
            temp: `${(data.main.temp < 0 ? '' : '+')}${(data.main.temp).toFixed(1)} °C`,
            humidity: `${data.main.humidity}%`,
            sunrise: this.processTimeString(data.sys.sunrise),
            sunset: this.processTimeString(data.sys.sunset),
            icon: data.weather[0].icon,
            wind_deg: `${data.wind.deg}deg`,
            wind_speed: `${data.wind.speed} m/s`,
            description: data.weather[0].description[0].toUpperCase() + data.weather[0].description.substr(1),
            status: constants.STATUS.DISPLAY,
            message: ''
        }
    }

    resetState() {
        this.state = constants.INITIAL_STATE;
    }

    processTimeString(date) {
        return new Date(date * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const cityInfo = document.getElementById('city').value.replace(', ', ',');
        if (cityInfo !== '') {
            if (this.state.message !== '') {
                this.resetMessage();
            }
            this.getData(cityInfo);
        } else {
            this.showMessage('Enter the name of the city');
            this.resetState();
        }
    }

    getData(cityInfo) {
        return axios
            .get(`https://api.openweathermap.org/data/2.5/weather?q=${cityInfo}&units=metric&APPID=96c2fc4713551153e7966978b449861a`)
            .then(response => {
                this.fillState(response.data);
            })
            .catch(error => {
                if (error.response && error.response.status === 404) {
                    this.resetState();
                    this.showMessage("City isn't found");
                } else {
                    this.resetState();
                    this.showMessage('Something went wrong');
                }
            });
    }

    showMessage(message) {
        this.state.message = message;
    }

    resetMessage() {
        this.state.message = '';
    }

    handleInput(e) {
        const $inp = document.getElementById('city');
        const val = $inp.value;

        closeAllLists();
        if (!val) {
            return false;
        }

        this.currentFocus = -1;

        let $cityList = document.createElement('div');
        $cityList.setAttribute('id', 'city_autocomplete-list');
        $cityList.setAttribute('class', 'autocomplete-items');

        $inp.parentNode.appendChild($cityList);
        const citiesCount = Math.min(cities.length, constants.MAX_DISPLAYED_CITIES);
        let fittedCount = 0;
        for (let i = 0; i < cities.length; i++) {
            let city = cities[i];
            let cityStr = `${city.name}, ${city.country}`;

            if (cityStr.substr(0, val.length) === val) {
                let $city = document.createElement('div');

                $city.innerHTML = `<strong>${cityStr.substr(0, val.length)}</strong>`;
                $city.innerHTML += cityStr.substr(val.length);

                $city.innerHTML += `<input type='hidden' value='${cityStr}'>`;

                $city.addEventListener('click', function(e) {
                    $inp.value = this.getElementsByTagName('input')[0].value;
                    closeAllLists();
                });

                $cityList.appendChild($city);
                fittedCount++;
            }
            if (fittedCount >= citiesCount) {
                break;
            }
        }
    }

    handleKeyDown(e) {
        let $el = document.getElementById('city_autocomplete-list');
        if ($el) {
            $el = $el.getElementsByTagName('div');
        }
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            this.currentFocus++;
            this.addActive($el);
        } else if (e.keyCode == 38) {
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            this.currentFocus--;
            this.addActive($el);
        } else if (e.keyCode == 13) {
            if (this.currentFocus > -1) {
                if ($el) {
                    $el[this.currentFocus].click();
                    return 0;
                }
            }
            return 1;
        }
    }

    addActive($el) {
        if (!$el) {
            return false;
        }

        this.removeActive($el);
        if (this.currentFocus >= $el.length) {
            this.currentFocus = 0;
        }
        if (this.currentFocus < 0) {
            this.currentFocus = $el.length - 1;
        }

        $el[this.currentFocus].classList.add('autocomplete-active');
    }
    
    removeActive($el) {
        for (var i = 0; i < $el.length; i++) {
          $el[i].classList.remove('autocomplete-active');
        }
     }
};
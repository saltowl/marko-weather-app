## What is it?

This is a simple application that displays the weather forecast for a selected city using [API](https://openweathermap.org/api). This project uses the [Marko](https://markojs.com/) template engine and the SASS preprocessor. 

## Data

`processed_city.list.json` is modified `city.list.json` by https://openweathermap.org

Modification was performed using the following python script:
~~~~
import json

with open('city.list.json', 'r', encoding='utf8', errors='ignore') as json_file:
    data = json.load(json_file)

processed_data = []
for city in data:
    processed_data.append({
        'name': city['name'],
        'country': city['country']
    })

with open('processed_city.list.json', 'w', encoding='utf8', errors='ignore') as outfile:
    json.dump(processed_data, outfile)

~~~~

## Instruction for use

First of all run in terminal:

`npm install`

If you want to change just some styles run:

`sass --watch styles/index.scss styles/index.css`

To compile the whole project run:

`lasso --main index.js --inject-into index.html --config lasso.json`

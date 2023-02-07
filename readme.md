# Puppeteer script to make an appointment for https://inpol.mazowieckie.pl/login

To run script:

```
npm i
npm start
```

Here are the useful settings in the code:

```js
// Here you need to put your login / pass / case number
const login = 'login';
const pass = 'pass';
const caseNumber = 'casenumber';

// CSS selectors to select location and queue
const appLocationBtn = '#mat-select-0'
const appQueueOpt = '#mat-option-4'
```

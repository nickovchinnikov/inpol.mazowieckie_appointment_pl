import puppeteer from 'puppeteer';

const auth = async (page, login, pass, caseNumber) => {
  await page.goto('https://inpol.mazowieckie.pl/login');

  // Type into login / pass
  await page.type('#mat-input-0', login);
  await page.type('#mat-input-1', pass);

  // Wait for suggest overlay to appear and click "show all results".
  const submitBtn = '.btn.btn--submit';
  await page.waitForSelector(submitBtn);
  await page.click(submitBtn);

  // Wait for the results page to load and display the results.
  const resultsSelector = '.col-lg-6 .card.card--border';
  await page.waitForSelector(resultsSelector);

  await page.goto(`https://inpol.mazowieckie.pl/home/cases/${caseNumber}`);

  // Wait for the results page to load and display the results.
  await page.waitForSelector('.cases__details');
}

const checkForLocationAndOrder = async (page, appLocationOpt, appQueueOpt) => {
  // Click appointment btn works by this way
  await page.evaluate(() => {
    document.querySelector(
      '.accordion [class="accordion__item"]:nth-child(2) button.btn--accordion'
    ).click();
  });

  // Click location
  const appLocationBtn = '#mat-select-0'
  await page.waitForSelector(appLocationBtn, {visible: true});
  await page.click(appLocationBtn);

  // Select location option
  await page.waitForSelector(appLocationOpt, {visible: true});
  await page.click(appLocationOpt);

  // Select a queue
  const appQueueBtn = '#mat-select-2'
  await page.waitForSelector(appQueueBtn, {visible: true});
  await page.click(appQueueBtn);

  // Select queue option
  await page.waitForSelector(appQueueOpt, {visible: true});
  await page.click(appQueueOpt);

  // Wait until spinner will disappear
  const calSpinner = '.spinner .ng-star-inserted'
  await page.waitForSelector(calSpinner, {hidden: true, timeout: 300000});
}


const runner = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 100, // slow down by 100ms
    ignoreDefaultArgs: [
        "--mute-audio",
    ],
    args: [
        "--autoplay-policy=no-user-gesture-required",
    ]
  });

  try {
    const page = await browser.newPage();

    const login = 'login';
    const pass = 'pass';
    const caseNumber = 'casenumber';

    await auth(page, login, pass, caseNumber);

    // If you want to check all locations, you can add a loop
    const appLocationBtn = '#mat-select-0'
    const appQueueOpt = '#mat-option-4'

    await checkForLocationAndOrder(page, appLocationBtn, appQueueOpt);

    // Dates check, you can check every active date if you need
    // Check next month
    const calendarNextMonthButton = '.mat-focus-indicator.mat-calendar-next-button.mat-icon-button.mat-button-base'
    await page.waitForSelector(calendarNextMonthButton);
    await page.click(calendarNextMonthButton);

    // Click appointment btn works by this way
    await page.evaluate(() => {
      const dates = document.querySelectorAll(
        'tr.ng-star-inserted td[class="mat-calendar-body-cell ng-star-inserted"]'
      )
      const lastDate = dates[dates.length - 1]
      lastDate.click();
    });

    const errorMsgSelector = '.cdk-global-overlay-wrapper span'
    try {
      await page.waitForSelector(errorMsgSelector, { timeout: 5000 })
      console.warn("No Dates!")
    } catch {
      console.log("Found Dates and Time!")

      const alertPage = await browser.newPage();

      await alertPage.goto('https://soundcloud.com/in-fringe/nuclear-alarm-siren-sound')
      
      const playSound = '.sc-button-play.playButton.sc-button.m-stretch'
      await alertPage.waitForSelector(playSound);
      await alertPage.click(playSound);
      await alertPage.waitForSelector('calendarNextMonthButton', { timeout: 5000000 });
    }

    await browser.close();
  }
  catch(e) {
    console.warn("Error: ", e)
    console.warn("No Dates!")
  }
}

runner()

// 5 min loop
const repeatTime = 5 * 60 * 1000
setInterval(runner, repeatTime)

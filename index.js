const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Path to the token file and read the token
const tokenPath = path.join(__dirname, 'token.txt');
const authToken = 'Bearer ' + fs.readFileSync(tokenPath, 'utf8').trim();

const baseURL = 'https://mobiverse-backend-prod-c4gljf5eva-uc.a.run.app';
const headers = {
    'Authorization': authToken,
    'Content-Type': 'application/json'
};

// Function to get the current formatted date and time
function getFormattedDateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = now.getFullYear();
    return `[${hours}:${minutes}:${seconds}, ${day}/${month}/${year}]`;
}

// Function to create a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to get user information
async function getUserInfo() {
    try {
        const response = await axios.get(baseURL + '/users', { headers: headers });
        return response.data;
    } catch (error) {
        console.error(getFormattedDateTime() + " Failed to retrieve user info: " + (error.response ? error.response.message : error.message));
        return null;
    }
}

// Function to get all the available mines
async function getMines() {
    const allMines = [];
    const url = "https://mobiverse-backend-prod-c4gljf5eva-uc.a.run.app/mines";

    for (let x = 0; x < 50; x++) {
        process.stdout.write(`\r Getting all the mines ${x}`);
        try {
            const response = await axios.get(`${url}/${x}`, { headers: headers });
            const mines = response.data;

            // Check if response contains expected data
            if (mines.hasOwnProperty('currentAmount')) {
                const amt = mines.currentAmount;
                allMines.push({ mine: x, cur_amt: amt });
            } else {
                console.log(`Mine index ${x} does not contain 'currentAmount'. Skipping.`);
            }
        } catch (error) {
            if (error.response) {
                console.error(`HTTP error for mine index ${x}: ${error.response.status}`);
            } else if (error.request) {
                console.error(`Request exception for mine index ${x}: ${error.request}`);
            } else {
                console.error(`Error for mine index ${x}: ${error.message}`);
            }
        }
    }

    if (allMines.length > 0) {
        return allMines.reduce((max, mine) => (mine.cur_amt > max.cur_amt ? mine : max), allMines[0]);
    } else {
        console.log("No valid mines found.");
        return null;
    }
}

// Function to mine gold
async function mineGold(mineIndex) {
    try {
        const response = await axios.patch(baseURL + `/users/mintPool?mineIndex=${mineIndex}`, {}, { headers: headers });
        // console.log(response.data)
        return response.data;
    } catch (error) {
        console.log(getFormattedDateTime() + ` Failed Mined in ${mineIndex}: ` + (error.response ? error.response.message : error.message));
        return null;
    }
}

// Function to activate fever
async function activateFever() {
    const url = baseURL + '/fever/activate';
    try {
        const response = await axios.post(url, {}, { headers: headers });
        const data = response.data;
        if (data.success) {
            console.log(getFormattedDateTime() + " Fever Activated Successfully");
        } else {
            console.log(getFormattedDateTime() + " Failed to Activate Fever");
            console.log("Response: " + JSON.stringify(data));
        }
    } catch (error) {
        console.error(getFormattedDateTime() + " Failed to Activate Fever: " + (error.response ? error.response.message : error.message));
        console.error("Response: " + JSON.stringify(error.response ? error.response.data : error.message));
    }
}

// Function to spin the wheel
async function spinWheel() {
    const url = baseURL + '/wheel/spin';
    try {
        const response = await axios.patch(url, {}, { headers: headers });
        const { newUserData, prize, prizeValue } = response.data;

        // Check if newUserData and prize exist and are not null
        if (newUserData && prize && prize.value && prize.name) {
            console.log(getFormattedDateTime() + ` Spin Success | Remaining Diamonds: ${newUserData.diamond || 0} | Reward: ${prize.value} ${prize.name}`);
        } else if (newUserData && prize) {
            console.log(getFormattedDateTime() + ` Spin Success | Remaining Diamonds: ${newUserData.diamond || 0} | Reward: ${prize.rewardValue} ${prize.rewardType}`);
        } else {
            console.log(getFormattedDateTime() + " Spin Success but received incomplete data:");
            console.log("newUserData: ", newUserData);
            console.log("prize: ", prize);
        }

        if (newUserData.diamond > 0) {
            await spinWheel();
        } else {
            console.log(getFormattedDateTime() + " Diamond 0 cannot Spin.");
        }
    } catch (error) {
        console.error(getFormattedDateTime() + " Failed to spin: " + (error.response ? error.response.message : error.message));
    }
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Main function to run the bot
async function runBot() {

    let recentToken = 0;

    const userInfo = await getUserInfo();
    if (!userInfo) return;

    console.log('\x1b[0m\n==================================================');
    console.log(getFormattedDateTime() + ` ID: ${userInfo.id}`);
    console.log(getFormattedDateTime() + ` Level: ${userInfo.level}`);
    console.log(getFormattedDateTime() + ` EXP: ${userInfo.exp}`);
    console.log(getFormattedDateTime() + ` Token: ${numberWithCommas(userInfo.token.toFixed(2))}`);
    console.log(getFormattedDateTime() + ` Diamond: ${userInfo.diamond}`);
    console.log('\x1b[0m==================================================\n');

    await delay(1000);


    while (true) {
        console.log(getFormattedDateTime() + " Looking for the mine with the highest gold....");
        const maxMine = await getMines();
        if (!maxMine) {
            console.log(getFormattedDateTime() + " No valid mines found. Exiting...");
            return;
        }
        console.log("\n")
        console.log(getFormattedDateTime() + ` Highest gold mine found: ${maxMine.mine} with amount ${numberWithCommas(maxMine.cur_amt.toFixed(2))}`);
        console.log("\n")
        await delay(1000);


        while (true) {
            const mineResult = await mineGold(maxMine.mine);
            if (mineResult) {

                const currentAmount = Math.round(mineResult.mine.currentAmount * 100) / 100;
                const maxAmount = Math.round(mineResult.mine.maxAmount * 100) / 100;
                const tokenFormatted = numberWithCommas(mineResult.token.toFixed(2));
                const diamondFormatted = numberWithCommas(mineResult.diamond);


                const tokenDiff = mineResult.token - recentToken;
                const tokenDiffDisplay = recentToken !== 0 ? `+${tokenDiff.toFixed(2)}` : '';
                recentToken = mineResult.token;

                console.log(`${getFormattedDateTime()} Mine: ${maxMine.mine} | Mine Status: (${((currentAmount / maxAmount) * 100).toFixed(2)}%) | Token: ${tokenFormatted}  ${tokenDiffDisplay} | Level: ${mineResult.level} | Diamond: ${diamondFormatted}`);

                if (currentAmount === 0) {
                    console.log(getFormattedDateTime() + ` Mine ${maxMine.mine} finished. Looking for another mine...\n`);
                    break;
                }

                const feverAvailable = mineResult.feverUpdateStatus ? mineResult.feverUpdateStatus.success : false;
                if (!feverAvailable) {
                    console.log(getFormattedDateTime() + " Fever available! Activation trial...");
                    await activateFever();
                    if (mineResult.feverUpdateStatus) {
                        mineResult.feverUpdateStatus.success = true;
                    }
                    if (mineResult.diamond > 0) {
                        await spinWheel();
                    } else {
                        console.log(getFormattedDateTime() + " Diamond 0 cannot spin.");
                    }
                }
            } else {
                console.log(getFormattedDateTime() + " Skip.\n");
                break;
            }
            await delay(10000);
        }
        await delay(3000);
    }
}

runBot();

const fs = require('fs').promises;

// Map each subtitle file to its corresponding YouTube video ID
const videoMapping = {
    '1': 'yqNn4jlKG8U',
    '2': 'OR0Nhw45FdI',
    '3': '4EEHfIREOq4',
    '4': 'ROc2Qc9FTo0',
    '5': 'OI-SkxriIqY',
    '6': 'qtMw205DcTQ',
    '7': 'yxNji8lZUAU',
    '8': '2ES1qC7v38A',
    '9': 'Gnc6a1Tzeh0',
    '10': 'yw49zRYP84c',
    '11': 'wjF8ZyOKIGU',
    '12': 'lUz9jrTQY0A',
    '13': '3DlHRGyVDeg',
    '14': '2U64HMfE7CQ',
    '15': 'z2yYCvuCCZc',
    '16': 'BoD5MDV2uPY',
    '17': 'uZ-zqnQmTfk',
    '18': 'wr11A4Jp09M',
    '19': 'sfslbhlh7Ug',
    '20': 'OU2YYbcyBQQ',
    '21': 'FFzg7xb1S6A',
    '22': '4-CdppTk-V0',
    '23': 'NU4gmNx5jh0',
    '24': '1_M5wckaeKM',
    '25': 'T-LatuJf_hU',
    '26': 'Dgq0rue0QLA',
    '27': 'vRX4cXSD62s',
    '28': 'FxLOHewLE1g',
    '29': 'JKgyD2GZsS4',
    '30': 'JRTf_VjV6JQ',
    '31': 'RV8o2vYSYas',
    '32': '',
    '33': 'WJEnimika3c',
    '34': 'Lq620RZw_MY',
    '35': 'J607KqiXD6U',
    '36': 'jtfez6CiinU',
    '37': 'difGhrqanrE',
    '38': 'KNS2E-nq5bM',
    '39': 'Xe-Cwix5b8U',
    '40': 'aQ6SXGxY_Mg',
    '41': '',
    '42': 'aPJ-XObSmF0',
    '43': 'Ej5NWaFgyYg',
    '44': 'gQx2kFvXk5U',
    '45': 'YysKHOtqoNY',
    '46': 'pskSDKw4H6I',
    '47': 'prj67ADd5Tc',
    '48': 'PwHk3VgkR1o',
    '49': 'hxryNyd9QIA',
    '50': '90dDY_sl10s',
    '51': 'bGXEj3kgNqU',
};

async function fetchVideoData(videoId) {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for videoId ${videoId}: ${response.statusText}`);
    }
    return response.json();
}

async function scrapeAndSaveVideoData() {
    const result = {};

    // Iterate over each mapping and fetch the video details.
    for (const [file, videoId] of Object.entries(videoMapping)) {
        if (videoId !== '') {
            try {
                const data = await fetchVideoData(videoId);
                // Inject the videoId into the data object for later use.
                result[file] = { ...data, videoId };
                console.log(`Fetched data for ${file}: ${data.title}`);
            } catch (error) {
                console.error(`Error fetching data for ${file}:`, error);
            }
        }
    }

    // Save the result as a JSON file.
    const jsonContent = JSON.stringify(result, null, 2);
    await fs.writeFile('video-data.json', jsonContent, 'utf8');
    console.log('Video data saved to video-data.json');
}

scrapeAndSaveVideoData().catch((error) => {
    console.error('An error occurred:', error);
});
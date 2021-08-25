import http from "k6/http";
import {sleep} from "k6";
import {randomSeed} from 'k6';

export let options = {
    insecureSkipTLSVerify: true,
    noConnectionReuse: false,
    stages: [
        {duration: '2m', target: 100},
        {duration: '2m', target: 150},
        {duration: '10m', target: 200},
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000']
    }
}
const TARGET_USER_COUNT = 50;
const API_BASE_URL = 'https://thesisapi.ddns.net';

export function setup() {
    let results = [];
    const params = {
        headers: {'accept': 'application/json'},
        timeout: 2000,
    };
    for (let i = 0; i < TARGET_USER_COUNT; i++) {
        let registerBody = JSON.stringify({
            email: `load_test_${i}@test.local`,
            password: "1qaz@WSX",
            role: "user"
        });

        let loginBody = JSON.stringify({
            email: `load_test_${i}@test.local`,
            password: "1qaz@WSX",
        });

        let completeRegistrationBody = JSON.stringify({
            pseudonym: `loadTest${i}`,
        });

        let registerResponse = http.post(`${API_BASE_URL}/identity/sign-up`, registerBody, params);

        let loginResponse = http.post(`${API_BASE_URL}/identity/sign-in`, loginBody, params);
        let loginResponseBody = JSON.parse(loginResponse.body);

        const authParams = {
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${loginResponseBody['accessToken']}`
            },
            timeout: 2000,
        };

        let completeRegistrationResponse = http.post(`${API_BASE_URL}/users`, completeRegistrationBody, authParams);
        let meResponse = http.get(`${API_BASE_URL}/users/me`, authParams);
        let meResponseBody = JSON.parse(meResponse.body);

        results.push({token: loginResponseBody['accessToken'], id: meResponseBody['Id']});

    }

    return results;
}

randomSeed(123456789);
const routeId = "fab3b79c-c771-4e37-a07c-e1a6a207081c";

export default function (data) {
    const rndUser = Math.floor(Math.random() * 50);

    const authParams = {
        headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${data[rndUser].token}`
        }
    };

    let randomInt = Math.floor(Math.random() * 100);

    if (randomInt > 90) {
        http.get(`${API_BASE_URL}/achievements/${data[rndUser].id}`, authParams);
    } else if (randomInt > 80) {
        http.get(`${API_BASE_URL}/identity/me`, authParams);
    } else if (randomInt > 70) {
        let body = JSON.stringify({
            routeId: routeId,
            latitude: 52.18269002630413,
            longitude: 21.42806325248071,
            accuracy: 9
        });
        http.post(`${API_BASE_URL}/runs`, body, authParams);
    } else if (randomInt > 60) {
        http.get(`${API_BASE_URL}/resources?routeId=${routeId}`);
    } else if (randomInt > 50) {
        http.get(`${API_BASE_URL}/runs?routeId=${routeId}&date=2021-08-01T00:00:00`);
    } else if (randomInt > 40) {
        http.get(`${API_BASE_URL}/scores`);
    } else if (randomInt > 30) {
        http.get(`${API_BASE_URL}/routes?southWestLatitude=${52.11282265853968}&southWestLongitude=${21.364964316523224}&northEastLatitude=${52.2924616451345}&northEastLongitude=${21.790375760890203}`);
    }  else {
        let body = JSON.stringify({
            latitude: 52.1826900,
            longitude: 21.4280632,
            accuracy: 9
        });
        http.post(`${API_BASE_URL}/locations`, body, authParams);
    }
    sleep(1000);
}
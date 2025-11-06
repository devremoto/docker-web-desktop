const http = require('http');

// Test backend health endpoint
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`Body: ${chunk}`);
    });

    res.on('end', () => {
        console.log('Request completed');
        testLogs();
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();

function testLogs() {
    // Test logs endpoint
    const logOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/containers/1c64f3db3e109469e1a88b04e0aefddfe126ba3725a2e36fa1793704deba010d/logs?tail=5',
        method: 'GET'
    };

    const logReq = http.request(logOptions, (res) => {
        console.log(`\nLogs Status: ${res.statusCode}`);

        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Logs Response:', data);
        });
    });

    logReq.on('error', (e) => {
        console.error(`Problem with logs request: ${e.message}`);
    });

    logReq.end();
}
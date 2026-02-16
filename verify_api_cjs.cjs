const http = require('http');

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('Starting verification...');

    // 1. Create a test folder
    console.log('Creating test folder...');
    const folderPath = 'test-folder-' + Date.now();
    await request('POST', '/folder', { path: folderPath });
    console.log(`Folder created: ${folderPath}`);

    // 2. Create a test file inside
    console.log('Creating test file...');
    const filePath = folderPath + '/test-file.md';
    await request('POST', '/file', { path: filePath });
    console.log(`File created: ${filePath}`);

    // 3. Delete the file
    console.log('Deleting file...');
    // Wait a bit to ensure FS operations settle
    await new Promise(r => setTimeout(r, 1000));

    try {
        const delFileRes = await request('DELETE', `/file?path=${encodeURIComponent(filePath)}`);
        console.log('Delete file response:', delFileRes);
    } catch (e) {
        console.error('Delete file failed:', e);
    }

    // 4. Delete the folder
    console.log('Deleting folder...');
    try {
        const delFolderRes = await request('DELETE', `/folder?path=${encodeURIComponent(folderPath)}`);
        console.log('Delete folder response:', delFolderRes);
    } catch (e) {
        console.error('Delete folder failed:', e);
    }

    console.log('Verification complete.');
}

runTests().catch(console.error);

import { deleteFile, deleteFolder, createFile, createFolder } from './src/api/client';

// Mock fetch for node environment if needed, or better yet, use a script that calls the local server.
// Since we are in a node environment, we can't use the client.ts which uses 'fetch' relative URLs.
// Let's write a script using 'node-fetch' or similar if available, or just standard http.

// Actually, let's just use curl in a shell script for simplicity, or a robust node script using http.
// I'll create a node script using the built-in 'http' module to test the API.

import http from 'http';

function request(method: string, path: string, body?: any): Promise<any> {
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
    console.log('Folder created:', folderPath);

    // 2. Create a test file inside
    console.log('Creating test file...');
    const filePath = folderPath + '/test-file.md';
    await request('POST', '/file', { path: filePath });
    console.log('File created:', filePath);

    // 3. Delete the file
    console.log('Deleting file...');
    await new Promise(r => setTimeout(r, 1000)); // Wait a bit
    const delFileRes = await request('DELETE', `/file?path=${encodeURIComponent(filePath)}`);
    console.log('Delete file response:', delFileRes);

    // 4. Delete the folder
    console.log('Deleting folder...');
    const delFolderRes = await request('DELETE', `/folder?path=${encodeURIComponent(folderPath)}`);
    console.log('Delete folder response:', delFolderRes);

    console.log('Verification complete.');
}

runTests().catch(console.error);

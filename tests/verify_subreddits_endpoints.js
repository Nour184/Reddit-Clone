// const fetch = require('node-fetch');
const mockData = require('../services/mockData.js');

async function testEndpoints() {
    const baseUrl = 'http://localhost:3000/api/subreddits';

    // 1. GET all
    console.log('--- GET all ---');
    const res1 = await fetch(baseUrl);
    console.log('Status:', res1.status);
    if (res1.status !== 200) {
        const text = await res1.text();
        console.log('Error Body:', text);
        return;
    }
    const data1 = await res1.json();
    console.log('Count:', data1.length);

    // 2. POST
    console.log('\n--- POST ---');
    const newSub = {
        name: 'TestSubNode',
        description: 'Created via Node script',
        communityPhotoLink: 'https://picsum.photos/200/100'
    };
    const res2 = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
    });
    console.log('Status:', res2.status);
    const data2 = await res2.json();
    console.log('Response:', data2);

    if (res2.status !== 201) {
        console.error('POST failed');
        return;
    }

    // 3. GET single
    console.log('\n--- GET single ---');
    const res3 = await fetch(`${baseUrl}/${encodeURIComponent('r/NextjsDevs')}`);
    console.log('Status:', res3.status);
    const data3 = await res3.json();
    console.log('Response:', data3);

    // 4. PATCH
    console.log('\n--- PATCH ---');
    const res4 = await fetch(`${baseUrl}/${encodeURIComponent('r/NextjsDevs')}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Updated description' })
    });
    console.log('Status:', res4.status);
    const data4 = await res4.json();
    console.log('Response:', data4);

    // 5. DELETE
    console.log('\n--- DELETE ---');
    const res5 = await fetch(`${baseUrl}/${encodeURIComponent('r/NextjsDevs')}`, {
        method: 'DELETE'
    });
    console.log('Status:', res5.status);
    const data5 = await res5.json();
    console.log('Response:', data5);

    // 6. Verify posts were deleted
    console.log('\n--- Verify posts deletion ---');
    const postsRes = await fetch('http://localhost:3000/api/posts');
    console.log('Remaining posts:', await postsRes.json());
}

testEndpoints().catch(console.error);

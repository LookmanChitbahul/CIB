
async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/projects');
        const res = await response.json();
        console.log('Keys:', Object.keys(res));
        console.log('Data is array:', Array.isArray(res.data));
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

test();

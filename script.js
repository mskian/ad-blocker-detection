document.addEventListener('DOMContentLoaded', async function () {
    const resolverTable = document.getElementById('resolver-table').getElementsByTagName('tbody')[0];
    const loadingIndicator = document.getElementById('loading-indicator');

    // Array of public DNS resolvers
    const resolvers = [
        { name: 'Google', dnsServer: '8.8.8.8' },
        { name: 'Cloudflare', dnsServer: '1.1.1.1' },
        { name: 'Quad9', dnsServer: '9.9.9.9' },
        { name: 'OpenDNS', dnsServer: '208.67.222.222' },
        { name: 'AdGuard', dnsServer: '94.140.14.14' },
        { name: 'CleanBrowsing', dnsServer: '185.228.168.168' },
        { name: 'Mullvad (ADblock)', dnsServer: '194.242.2.3' },
        { name: 'Mullvad (base)', dnsServer: '194.242.2.4' },
        // Add more resolvers as needed
    ];

    // URLs to measure loading time and connection speed
    const testUrls = ['https://www.google.com', 'https://www.bing.com', 'https://github.com', 'https://duckduckgo.com', 'https://search.brave.com'];

    // Function to measure loading time and connection speed
    async function measureLoadingTimeAndSpeed(urls) {
        const results = [];
        for (const url of urls) {
            const startTime = performance.now();
            try {
                await fetch(url, { cache: 'no-store', mode: 'no-cors', headers: { 'X-DNS-Prefetch-Control': 'off' } });
            } catch (error) {
                console.error('Failed to load the webpage:', error);
                results.push(null);
                continue;
            }
            const endTime = performance.now();
            const loadingTime = endTime - startTime;
            const fileSize = 1; // 1 MB (Assuming the fetched resource is approximately 1MB)
            const connectionSpeed = fileSize / (loadingTime / 1000); // Connection speed in Mbps
            results.push({ loadingTime, connectionSpeed });
        }
        return results;
    }

    // Function to convert milliseconds to seconds or minutes
    function formatTime(milliseconds) {
        if (milliseconds < 1000) {
            return milliseconds.toFixed(2) + ' ms';
        } else if (milliseconds < 60000) {
            return (milliseconds / 1000).toFixed(2) + ' secs';
        } else {
            return (milliseconds / 60000).toFixed(2) + ' mins';
        }
    }

    // Function to format connection speed in Mbps or Kbps
    function formatSpeed(speed) {
        if (speed < 1) {
            return (speed * 1000).toFixed(2) + ' Kbps';
        } else {
            return speed.toFixed(2) + ' Mbps';
        }
    }

// Populate the table with resolver data
async function populateTable() {
    loadingIndicator.style.display = 'block';
    for (const resolver of resolvers) {
        const results = await measureLoadingTimeAndSpeed(testUrls);
        let lastIpAddress = null; // Reset last IP address for each resolver
        // Check if the resolver has the same IP address as the last one
        if (resolver.dnsServer !== lastIpAddress) {
            const ipRow = resolverTable.insertRow();
            const ipCell = ipRow.insertCell();
            ipCell.setAttribute('colspan', '5'); // Adjust colspan based on the number of columns in your table
            ipCell.innerHTML = `<br> ${resolver.name}: ${resolver.dnsServer} <br><br>`;
            lastIpAddress = resolver.dnsServer;
        }
        for (let i = 0; i < testUrls.length; i++) {
            const { loadingTime, connectionSpeed } = results[i];
            if (loadingTime !== null && connectionSpeed !== null) {
                const row = resolverTable.insertRow();
                row.innerHTML = `<td>${testUrls[i]}</td><td>${formatTime(loadingTime)}</td><td>${formatSpeed(connectionSpeed)}</td>`;
            } else {
                console.warn(`Failed to measure speed for resolver: ${resolver.name}`);
                const row = resolverTable.insertRow();
                row.innerHTML = `<td colspan="4" class="has-text-centered">Failed to measure speed for ${resolver.name} and ${testUrls[i]}</td>`;
            }
        }
    }
    loadingIndicator.style.display = 'none';
}

    populateTable();

});
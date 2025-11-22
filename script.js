document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const methodSelect = document.getElementById('methodSelect');
    const corsProxyBtn = document.getElementById('corsProxyBtn');
    const sendBtn = document.getElementById('sendBtn');
    const responseStatus = document.getElementById('responseStatus');
    const responseTime = document.getElementById('responseTime');
    const responseSize = document.getElementById('responseSize');
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Tabs Logic
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;
            const parent = tab.closest('.panel');
            
            // Deactivate all in this panel
            parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.editor, .viewer').forEach(c => c.classList.remove('active'));
            
            // Activate clicked
            tab.classList.add('active');
            parent.querySelector(`#${targetId}`).classList.add('active');
        });
    });

    // Theme Logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateIcons(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcons(newTheme);
    });

    function updateIcons(theme) {
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // Headers Logic
    const headersContainer = document.getElementById('headersList');
    const addHeaderBtn = document.getElementById('addHeaderBtn');

    function createHeaderRow(key = '', value = '') {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '0.5rem';
        row.style.marginBottom = '0.5rem';
        
        row.innerHTML = `
            <input type="text" placeholder="Key" value="${key}" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: var(--bg-primary); color: var(--text-primary);">
            <input type="text" placeholder="Value" value="${value}" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: var(--bg-primary); color: var(--text-primary);">
            <button style="background: none; border: none; color: var(--error); cursor: pointer;">×</button>
        `;

        row.querySelector('button').addEventListener('click', () => row.remove());
        return row;
    }

    addHeaderBtn.addEventListener('click', () => {
        headersContainer.appendChild(createHeaderRow());
    });

    // Initial Header
    headersContainer.appendChild(createHeaderRow('Content-Type', 'application/json'));

    // Request Logic
    sendBtn.addEventListener('click', async () => {
        let url = urlInput.value.trim();
        const method = methodSelect.value;
        const bodyContent = document.getElementById('requestBody').value;
        const useProxy = corsProxyBtn.checked;
        
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Collect Headers
        const headers = {};
        headersContainer.querySelectorAll('div').forEach(row => {
            const inputs = row.querySelectorAll('input');
            const key = inputs[0].value.trim();
            const value = inputs[1].value.trim();
            if (key) headers[key] = value;
        });

        // Proxy Logic
        if (useProxy) {
            // Use custom CORS proxy
            // For local testing: http://localhost:3001/proxy?url=
            // For production: https://cors-proxy-six-flame.vercel.app/proxy?url=
            const proxyUrl = 'https://cors-proxy-six-flame.vercel.app/proxy?url=';
            url = proxyUrl + encodeURIComponent(url);
        }

        // Prepare Options
        const options = {
            method,
            headers
        };

        if (['POST', 'PUT', 'PATCH'].includes(method) && bodyContent) {
            options.body = bodyContent;
        }

        // UI Updates
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        responseStatus.className = 'status-badge';
        responseStatus.textContent = '...';
        document.getElementById('responseBody').innerHTML = '';
        document.getElementById('responseHeaders').innerHTML = '';

        const startTime = performance.now();

        try {
            const response = await fetch(url, options);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            // Status
            responseStatus.textContent = `${response.status} ${response.statusText}`;
            responseStatus.classList.add(response.ok ? 'success' : 'error');
            responseTime.textContent = `${duration}ms`;

            // Headers
            let headersHtml = '<table class="headers-table"><tbody>';
            response.headers.forEach((val, key) => {
                headersHtml += `<tr><td><strong>${key}</strong></td><td>${val}</td></tr>`;
            });
            headersHtml += '</tbody></table>';
            document.getElementById('responseHeaders').innerHTML = headersHtml;

            // Body
            const text = await response.text();
            responseSize.textContent = formatBytes(new Blob([text]).size);
            
            try {
                const json = JSON.parse(text);
                document.getElementById('responseBody').innerHTML = syntaxHighlight(JSON.stringify(json, null, 4));
            } catch {
                document.getElementById('responseBody').textContent = text;
            }

        } catch (error) {
            responseStatus.textContent = 'Error';
            responseStatus.classList.add('error');
            
            let errorMsg = error.message;
            if (errorMsg.includes('Failed to fetch') && !useProxy) {
                errorMsg += '\n\nPossible CORS error. Try enabling the "Proxy" checkbox.';
            }
            
            document.getElementById('responseBody').textContent = errorMsg;
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    });

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // Copy Logic
    const copyBtn = document.getElementById('copyBtn');
    
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const responseContent = document.getElementById('responseBody').textContent;
            if (!responseContent) return;

            try {
                await navigator.clipboard.writeText(responseContent);
                
                // Visual feedback
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            }
        });
    }
});

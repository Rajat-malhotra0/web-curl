# Web Curl

A modern, minimalist web-based cURL tool for testing APIs directly from your browser.

## Features

- **Method Support**: GET, POST, PUT, DELETE, PATCH
- **CORS Proxy**: Built-in proxy integration to bypass browser CORS restrictions
- **Minimalist UI**: Clean black & white aesthetics with a focus on usability
- **Response Analysis**: View status, time, size, headers, and formatted JSON bodies
- **Copy to Clipboard**: Quickly copy response data
- **Responsive Design**: Works seamlessly on desktop and mobile

## Usage

1. Open `index.html` in your browser.
2. Enter the target API URL.
3. Select the HTTP method.
4. Add headers or body content if needed.
5. Toggle "Proxy" if you encounter CORS issues.
6. Click **Send**.

## Setup

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Rajat-malhotra0/web-curl.git
   cd web-curl
   ```

2. (Optional) Create a `.env` file to customize URLs (see `.env.example`):
   ```env
   PROXY_URL=https://your-cors-proxy.vercel.app/proxy?url=
   HOME_URL=https://your-landing-page.com
   ```

3. Run the build script:
   ```bash
   node build.js
   ```

4. Open the generated `index.html` in any modern web browser.

### Netlify Deployment

1. Set environment variables in Netlify dashboard:
   - `PROXY_URL`: URL to your CORS proxy (e.g., `https://cors-proxy.vercel.app/proxy?url=`)
   - `HOME_URL`: URL to your landing page (e.g., `https://devtoolkit.netlify.app`)

2. Deploy! Netlify will automatically run `build.js` during deployment.

**Note**: The source template is `index.template.html`. The `index.html` file is generated and gitignored.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

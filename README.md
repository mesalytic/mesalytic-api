# the api for the mesalytic bot ithink

yes the api for some shitty image endpoints but wtvr

# Installation

1) Install [NodeJS v17.9.1](https://nodejs.org/download/release/v17.9.1/)
- **Please make sure to install build tools at the end of the setup if you're using windows.**
- - Otherwise, you must install the proper build tools for your computer.
- **If you already have NodeJS installed on your computer, and it is v18 or later, you must find a way to install NodeJS v17.**
- - This is due to the currently ongoing issue [#2025](https://github.com/Automattic/node-canvas/issues/2025) with node-canvas, that prevents from installing in NodeJS v18.
2) Install [Git](https://nodejs.org/download/release/v17.9.1/)
3) Clone the repository using `git clone https://github.com/chocololat/mesalytic-api`
4) Install the required Node Modules using `npm i`
5) Launch the server using `node .` or `node server.js`
6) Access it using `localhost:8239` or set up your own custom domain

# Usage

Requests to the API do not require a token. However, at a later date, for security reasons, some "more power-intensive" endpoints will require a private key.

The URL is `localhost:8239`. This will show the current list of available endpoints in a JSON output.

You must pass a URL query parameter to the request.

Example:
```
localhost:8239/circle?url=URL
```
```json
{
    "success": true,
    "body": {
        "data": [], //base64 data stream, most DiscordAPI wrappers accept stream buffer arrays
        "type": "Buffer"
    }
}
```
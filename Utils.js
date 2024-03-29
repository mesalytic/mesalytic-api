const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const Canvas = require('canvas');
const axios = require('axios').default;

module.exports = class Utils {
    static blur(src, dst, width, height, radius) {
        var tableSize = radius * 2 + 1;
        var radiusPlus1 = radius + 1;
        var widthMinus1 = width - 1;

        var r, g, b, a;

        var srcIndex = 0;
        var dstIndex;
        var p, next, prev;
        var i, l, x, y, nextIndex, prevIndex;

        var sumTable = [];
        for (i = 0, l = 256 * tableSize; i < l; i += 1) {
            sumTable[i] = (i / tableSize) | 0;
        }

        for (y = 0; y < height; y += 1) {
            r = g = b = a = 0;
            dstIndex = y;

            p = srcIndex << 2;
            r += radiusPlus1 * src[p];
            g += radiusPlus1 * src[p + 1];
            b += radiusPlus1 * src[p + 2];
            a += radiusPlus1 * src[p + 3];

            for (i = 1; i <= radius; i += 1) {
                p = (srcIndex + (i < width ? i : widthMinus1)) << 2;
                r += src[p];
                g += src[p + 1];
                b += src[p + 2];
                a += src[p + 3];
            }

            for (x = 0; x < width; x += 1) {
                p = dstIndex << 2;
                dst[p] = sumTable[r];
                dst[p + 1] = sumTable[g];
                dst[p + 2] = sumTable[b];
                dst[p + 3] = sumTable[a];

                nextIndex = x + radiusPlus1;
                if (nextIndex > widthMinus1) {
                    nextIndex = widthMinus1
                }

                prevIndex = x - radius;
                if (prevIndex < 0) {
                    prevIndex = 0;
                }

                next = (srcIndex + nextIndex) << 2;
                prev = (srcIndex + prevIndex) << 2;

                r += src[next] - src[prev];
                g += src[next + 1] - src[prev + 1];
                b += src[next + 2] - src[prev + 2];
                a += src[next + 3] - src[prev + 3];

                dstIndex += height;
            }
            srcIndex += width;
        }
    }

    static desaturate(ctx, level, x, y, width, height) {
        const data = ctx.getImageData(x, y, width, height);
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const dest = ((i * width) + j) * 4;
                const grey = Number.parseInt(
                    (0.2125 * data.data[dest]) + (0.7154 * data.data[dest + 1]) + (0.0721 * data.data[dest + 2]), 10
                );
                data.data[dest] += level * (grey - data.data[dest]);
                data.data[dest + 1] += level * (grey - data.data[dest + 1]);
                data.data[dest + 2] += level * (grey - data.data[dest + 2]);
            }
        }
        ctx.putImageData(data, x, y);
        return ctx;
    }

    static contrast(ctx, x, y, width, height) {
        const data = ctx.getImageData(x, y, width, height);
        const factor = (259 / 100) + 1;
        const intercept = 128 * (1 - factor);

        for (let i = 0; i < data.data.length; i += 4) {
            data.data[i] = (data.data[i] * factor) + intercept;
            data.data[i + 1] = (data.data[i + 1] * factor) + intercept;
            data.data[i + 2] = (data.data[i + 2] * factor) + intercept;
        }

        ctx.putImageData(data, x, y);
        return ctx;
    }

    static checkIfMandelSet(x, y) {
        let rCompRes = x;
        let iCompRes = y;

        const maxIterations = 300;

        for (let i = 0; i < maxIterations; i++) {
            const trc = rCompRes * rCompRes - iCompRes * iCompRes + x;
            const tic = 2 * rCompRes * iCompRes + y;

            rCompRes = trc;
            iCompRes = tic;

            if (rCompRes * iCompRes > 5) {
                return (i / maxIterations) * 100;
            }
        }

        return 0;
    }

    static async nonBlockLoop(iterations, func, args) {
        let blockedSince = Date.now();

        async function unblock() {
            if (blockedSince + 15 > Date.now()) {
                await new Promise(resolve => setImmediate(resolve));
                blockedSince = Date.now();
            }
        }

        for (let i = 0; i < iterations; i++) {
            await unblock();
            const response = await func(i, args);

            if (response) {
                args = response;
            }

            if (args?.break === true) {
                delete args.break;
                break;
            }
        }
        return args;
    }

    static centerImagePart(data, maxWidth, maxHeight, widthOffset, heightOffset) {
        let { width, height } = data;

        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height *= ratio;
        }

        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width *= ratio;
        }

        const x = widthOffset + ((maxWidth / 2) - (width / 2));
        const y = heightOffset + ((maxHeight / 2) - (height / 2));

        return { x, y, width, height }
    }

    static distort(ctx, amplitude, x, y, width, height, strideLevel = 4) {
        const data = ctx.getImageData(x, y, width, height);
        const temp = ctx.getImageData(x, y, width, height);
        const stride = width * strideLevel;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const xs = Math.round(amplitude * Math.sin(2 * Math.PI * 3 * (j / height)));
                const ys = Math.round(amplitude * Math.cos(2 * Math.PI * 3 * (i / width)));

                const dest = (j * stride) + (i * strideLevel);
                const src = ((j + ys) * stride) + ((i + xs) * strideLevel);

                data.data[dest] = temp.data[src];
                data.data[dest + 1] = temp.data[src + 1];
                data.data[dest + 2] = temp.data[src + 2];
            }
        }

        ctx.putImageData(data, x, y);
        return ctx;
    }

    static drawImageWithTint(ctx, image, color, x, y, width, height) {
        const { fillStyle, globalAlpha } = ctx;
        ctx.fillStyle = color;
        ctx.drawImage(image, x, y, width, height);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = fillStyle;
        ctx.globalAlpha = globalAlpha;
    }

    static streamToArray(stream) {
        if (!stream.readable) return Promise.resolve([]);

        return new Promise((resolve, reject) => {
            const array = [];
            function onData(data) {
                array.push(data);
            }

            function onEnd(error) {
                if (error) reject(error);
                else resolve(array);
                cleanup();
            }

            function onClose() {
                resolve(array);
                cleanup();
            }

            function cleanup() {
                stream.removeListener('data', onData);
                stream.removeListener('end', onEnd);
                stream.removeListener('error', onEnd);
                stream.removeListener('close', onClose);
            }

            stream.on('data', onData);
            stream.on('end', onEnd);
            stream.on('error', onEnd);
            stream.on('close', onClose);
        })
    }

    static secondsToDhms(seconds) {
        seconds = Number(seconds);

        let d = Math.floor(seconds / (3600 * 24));
        let h = Math.floor(seconds % (3600 * 24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);

        let dDisplay = d > 0 ? d + (d == 1 ? "d " : "d ") : "";
        let hDisplay = h > 0 ? h + (h == 1 ? "h " : "h ") : "";
        let mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";

        return dDisplay + hDisplay + mDisplay;
    }

    static fishEye(ctx, level, x, y, width, height) {
        const frame = ctx.getImageData(x, y, width, height);
        const source = new Uint8Array(frame.data);

        for (let i = 0; i < frame.data.length; i += 4) {
            const sx = (i / 4) % frame.width;
            const sy = Math.floor(i / 4 / frame.width);

            const dx = Math.floor(frame.width / 2) - sx;
            const dy = Math.floor(frame.height / 2) - sy;

            const dist = Math.sqrt((dx * dx) + (dy * dy));

            const x2 = Math.round((frame.width / 2) - (dx * Math.sin(dist / (level * Math.PI) / 2)));
            const y2 = Math.round((frame.height / 2) - (dy * Math.sin(dist / (level * Math.PI) / 2)));

            const i2 = ((y2 * frame.width) + x2) * 4;

            frame.data[i] = source[i2]
            frame.data[i + 1] = source[i2 + 1]
            frame.data[i + 2] = source[i2 + 2]
            frame.data[i + 3] = source[i2 + 3]
        }

        ctx.putImageData(frame, x, y);
        return ctx;
    }

    static glitch(ctx, amplitude, x, y, w, h, sl = 4) {
        const data = ctx.getImageData(x, y, w, h);
        const temp = ctx.getImageData(x, y, w, h);

        const stride = w * sl;

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                const xs = Math.round(amplitude * Math.sin(2 * Math.PI * 3 * (j / h)));
                const ys = Math.round(amplitude * Math.cos(2 * Math.PI * 3 * (j / w)));

                const dest = (j * stride) + (i * sl);
                const src = ((j + ys) * stride) + ((i + xs) * sl);

                data.data[dest] = temp.data[src];
                data.data[dest + 1] = temp.data[src + 1];
                data.data[dest + 2] = temp.data[src + 2];
            }
        }

        ctx.putImageData(data, x, y);
        return ctx;
    }

    static grayscale(ctx, w, h) {
        const data = ctx.getImageData(0, 0, w, h);

        for (let i = 0; i < data.data.length; i += 4) {
            const brightness = 0.34 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];

            data.data[i] = brightness;
            data.data[i + 1] = brightness;
            data.data[i + 2] = brightness;
        }

        ctx.putImageData(data, 0, 0);

        return ctx;
    }

    static invert(ctx, w, h) {
        const data = ctx.getImageData(0, 0, w, h);

        for (let i = 0; i < data.data.length; i += 4) {
            data.data[i] = 255 - data.data[i];
            data.data[i + 1] = 255 - data.data[i + 1];
            data.data[i + 2] = 255 - data.data[i + 2];
            data.data[i + 3] = 255;
        }

        ctx.putImageData(data, 0, 0);

        return ctx;
    }

    static sepia(ctx, x, y, w, h) {
        const data = ctx.getImageData(x, y, w, h);

        for (let i = 0; i < data.data.length; i += 4) {
            const brightness = (0.34 * data.data[i]) + (0.5 * data.data[i + 1]) + (0.16 * data.data[i + 2]);
            data.data[i] = brightness + 100;
            data.data[i + 1] = brightness + 50;
            data.data[i + 2] = brightness;
        }

        ctx.putImageData(data, x, y);
        return ctx;
    }

    static shortenText(ctx, text, maxWidth) {
        let shorten = false;
        while (ctx.measureText(`${text}...`).width > maxWidth) {
            if (!shorten) shorten = true;
            text = text.substr(0, text.length - 1);
        }

        return shorten ? `${text}...` : text;
    }

    static async getOverwatchShop(lang) {
        const browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();

        await page.goto(`https://eu.shop.battle.net/${lang}/family/overwatch`);

        await page.waitForSelector("#c1f75a13-697f-4032-a395-688a913b1823 > section > storefront-browsing-card-group-layout > ul")

        let data = await page.evaluate(() => {
            let nextResetSelector = document.querySelector("#c1f75a13-697f-4032-a395-688a913b1823 > section > div > div.browsing-card-group__timer.meka-font-display.meka-font-display--section-label.meka-font-display--section-label--small.ng-star-inserted > span")

            function getOverwatchResetTime() {
                const date = new Date();
                let output;

                if (nextResetSelector.innerText.endsWith("DAYS")) {
                    date.setDate(date.getDate() + parseInt(nextResetSelector.innerText.split(" ")[3]));
                    date.setHours(21)
                    date.setMinutes(0)
                    date.setSeconds(0)

                    output = date.getTime();
                } else if (nextResetSelector.innerText.endsWith("HOURS")) {
                    date.setHours(date.getHours() + parseInt(nextResetSelector.innerText.split(" ")[3]));
                    date.setMinutes(0)
                    date.setSeconds(0)

                    output = date.getTime();
                } else if (nextResetSelector.innerText.endsWith("MINUTES")) {
                    date.setMinutes(date.getMinutes() + parseInt(nextResetSelector.innerText.split(" ")[3]))
                    date.setSeconds(0)

                    output = date.getTime();
                } else {
                    date.setSeconds(date.getSeconds() + parseInt(nextResetSelector.innerText.split(" ")[3]))

                    output = date.getTime();
                }

                let beforeDate = new Date(date.getTime());
                beforeDate.setDate(beforeDate.getDate() - 7);

                console.log(beforeDate.toString())
                console.log(date.toString())

                return {
                    text: `${beforeDate.getDate()}/${beforeDate.getMonth() + 1} - ${date.getDate()}/${date.getMonth() + 1}`,
                    dateString: date.toString(),
                    timestamp: output
                }
            }

            let li = document.querySelector("#c1f75a13-697f-4032-a395-688a913b1823 > section > storefront-browsing-card-group-layout > ul").getElementsByTagName('li');

            let arr = [];
            
            for (let i = 0; i < li.length; i++) {
                let price;

                let priceSelector = document.querySelector(`#c1f75a13-697f-4032-a395-688a913b1823 > section > storefront-browsing-card-group-layout > ul > li:nth-child(${i + 1}) > storefront-browsing-card > div > storefront-link > a > meka-browsing-card > storefront-price > div > meka-price-label`).shadowRoot.querySelector("div > div.meka-price-label__details > div > div > span")
                let img = document.querySelector(`#c1f75a13-697f-4032-a395-688a913b1823 > section > storefront-browsing-card-group-layout > ul > li:nth-child(${i + 1}) > storefront-browsing-card > div > storefront-link > a > meka-browsing-card > img`)
                let tags = document.querySelector(`#c1f75a13-697f-4032-a395-688a913b1823 > section > storefront-browsing-card-group-layout > ul > li:nth-child(${i + 1}) > storefront-browsing-card > div > storefront-link > a > meka-browsing-card`).shadowRoot.querySelector("div > dl > dd.meka-browsing-card__details__description").innerText;

                if (priceSelector == null) price = document.querySelector(`#c1f75a13-697f-4032-a395-688a913b1823 > section > storefront-browsing-card-group-layout > ul > li:nth-child(${i + 1}) > storefront-browsing-card > div > storefront-link > a > meka-browsing-card > storefront-price > div > meka-price-label`).shadowRoot.querySelector("div > div > div > div > span").innerText; // no discount
                else price = priceSelector.innerText; // discount

                arr.push({
                    name: li[i].innerText,
                    tags,
                    price,
                    img: img.getAttribute("src")
                })
            }

            return {
                reset: getOverwatchResetTime(),
                items: arr
            }
        })

        return data;
    }

    static getBase64FromUrl = async (url) => {
        axios.get(url).then(res => {
            return res.data
        })
    }
}
const { JSDOM } = require('jsdom');

async function fetchProductData(html) {
    const dom = new JSDOM(html);
    const scripts = dom.window.document.querySelectorAll("script");
    let result = null;
    let newObj = {};

    for (let i = 0; i < scripts.length; i++) {
        let content = scripts[i].textContent || "";
        content = content.replace(/\//g, "");

        if (content.includes('colorToSize')) {
            content = content.replaceAll(/\\\//g, "").replace(/\//g, "");
            const match = content.match(/self\.__next_f\.push\((\[[\s\S]*?\])\)/);

            if (match && match[1]) {
                try {
                    let arr = eval(match[1]);
                    arr = JSON.parse(arr[1].slice(3));

                    result = arr[3]?.children[3][3]?.product?.utag_data;

                    let colormap = Object.fromEntries(
                        Object.entries(arr[3]?.children[3][3].product?.colorSizeMap.colors).map(([key, value]) => [key, value.name])
                    );

                    let colorToSize = arr[3]?.children[3][3].product?.colorSizeMap.variantsAsList;

                    colorToSize = colorToSize.map((c) => (
                        newObj[c.variantId] = [c?.size?.sizeName || '', colormap[c?.color] || '']
                    ));

                    break;
                } catch (e) {
                    console.error("Parse error:", e.message);
                }
            }
        }
    }

    return { result, newObj };
}

module.exports = { fetchProductData };
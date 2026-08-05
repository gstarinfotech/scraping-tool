const generateSku = (upc, prefix, color = '', size = '') => {
    let a = size && size.split(' ') || [];
    if (a[1] && a[1].length > 1) {
        a[1] = a[1].slice(0, 1);
    }
    a = a.join('');
    size = a;

    color = color && color.replaceAll(' ', '-').replaceAll('/', '-').toUpperCase() || '';
    let firstletter = color.charAt(0);
    color = color.slice(1);
    var modifiedColor = color;

    if (color.length > 12) {
        let v = ['A', 'E', 'I', 'O', 'U'];
        for (let i of v) {
            modifiedColor = color.replaceAll(i, '');
            color = modifiedColor;
        }
    }

    if (color.length > 12) {
        let arr = color.split('-');
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].slice(0, 3);
        }
        color = arr.join('-');
    }

    let sku = prefix + '-' + upc + '-' + firstletter + color + '-' + size;
    sku = sku.replaceAll('---', '-');
    sku = sku.replaceAll('--', '-');
    sku = sku.replaceAll(',', '');
    return sku;
};

module.exports = { generateSku };
// $(document).ready(function(){

$(function () {
    $('.navbar .navbar-nav a').not('.dropdown-toggle').bind('click', function (event) {
        const $anchor = $(this).attr('href'),
            $func = $anchor.substr(1, $anchor.length);

        eval($func);
        return false;
    });
});


const cvs = document.getElementById("kanvas"),
    ctx = cvs.getContext("2d"),
    myImg = new Image();

$(myImg).attr("src", "img/heroteesme.jpg");

const readURL = input => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $(myImg).attr("src", e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
        $('.ascii-box').remove();
        $(cvs).show();
    }
};

$(imgFile).change(function () {
    readURL(this);
});

$(myImg).load(function () {
    $(kanvas).attr("width", myImg.width);
    $(kanvas).attr("height", myImg.height);
    ctx.drawImage(myImg, 0, 0);
    $("#inp-brightness").val(0);
    $("#inp-contrass").val(0);

    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    $("#imgwidth").text("Width: " + imgData.width + "px");
    $("#imgheight").text("Height: " + imgData.height + "px");
    $("#imglength").text("Length: " + imgData.data.length + "px");
    $(".imgtitle span").text("Citra Asli");
});

const loadCamera = () => {
    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia ||
        navigator.mediaDevices.getUserMedia
    );
    const video = document.querySelector('video');
    navigator.getUserMedia({
        audio: false,
        video: {
            width: 255 || cvs.offsetWidth,
            // height: cvs.offsetHeight
        }
    }, (stream) => {
        video.srcObject = stream;
        video.play();
        kanvas.width = video.videoWidth;
        kanvas.height = video.videoHeight;
    }, (err) => {
        console.log(err);
    });

    intervalVideoAsli = setInterval(function() {
        kanvas.width = video.videoWidth;
        kanvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
    }, Math.round(1000 / 30));
}

//  Reset
const imgReset = () => {
    $(kanvas).attr("width", myImg.width);
    $(kanvas).attr("height", myImg.height);
    $(".imgtitle span").text("Citra Asli");
    ctx.drawImage(myImg, 0, 0);
    $("#inp-brightness").val(0);
    $("#inp-contrass").val(0);
    $("#hist").hide();
    $('.ascii-box').remove();
    $(cvs).show();
};

/*
 *
 * Konvolusi
 * - Kernel 3x3
 * - Kernel 5x5
 *
 */

const konvolusi3x3 = (inData, outData, width, height, kernel, alpha, invert, mono) => {
    let idx, r, g, b, a,
        pyc, pyp, pyn,
        pxc, pxp, pxn,
        x, y;
    const n = width * height * 4,

        k00 = kernel[0][0], k01 = kernel[0][1], k02 = kernel[0][2],
        k10 = kernel[1][0], k11 = kernel[1][1], k12 = kernel[1][2],
        k20 = kernel[2][0], k21 = kernel[2][1], k22 = kernel[2][2];
    let p00, p01, p02,
        p10, p11, p12,
        p20, p21, p22;

    for (y = 0; y < height; ++y) {
        pyc = y * width * 4;
        pyp = pyc - width * 4;
        pyn = pyc + width * 4;

        if (y < 1) pyp = pyc;
        if (y >= width - 1) pyn = pyc;

        for (x = 0; x < width; ++x) {
            idx = (y * width + x) * 4;

            pxc = x * 4;
            pxp = pxc - 4;
            pxn = pxc + 4;

            if (x < 1) pxp = pxc;
            if (x >= width - 1) pxn = pxc;

            p00 = pyp + pxp;
            p01 = pyp + pxc;
            p02 = pyp + pxn;
            p10 = pyc + pxp;
            p11 = pyc + pxc;
            p12 = pyc + pxn;
            p20 = pyn + pxp;
            p21 = pyn + pxc;
            p22 = pyn + pxn;

            r = inData[p00] * k00 + inData[p01] * k01 + inData[p02] * k02
                + inData[p10] * k10 + inData[p11] * k11 + inData[p12] * k12
                + inData[p20] * k20 + inData[p21] * k21 + inData[p22] * k22;

            g = inData[p00 + 1] * k00 + inData[p01 + 1] * k01 + inData[p02 + 1] * k02
                + inData[p10 + 1] * k10 + inData[p11 + 1] * k11 + inData[p12 + 1] * k12
                + inData[p20 + 1] * k20 + inData[p21 + 1] * k21 + inData[p22 + 1] * k22;

            b = inData[p00 + 2] * k00 + inData[p01 + 2] * k01 + inData[p02 + 2] * k02
                + inData[p10 + 2] * k10 + inData[p11 + 2] * k11 + inData[p12 + 2] * k12
                + inData[p20 + 2] * k20 + inData[p21 + 2] * k21 + inData[p22 + 2] * k22;

            if (alpha) {
                a = inData[p00 + 3] * k00 + inData[p01 + 3] * k01 + inData[p02 + 3] * k02
                    + inData[p10 + 3] * k10 + inData[p11 + 3] * k11 + inData[p12 + 3] * k12
                    + inData[p20 + 3] * k20 + inData[p21 + 3] * k21 + inData[p22 + 3] * k22;
            } else {
                a = inData[idx + 3];
            }

            if (mono) {
                r = g = b = (r + g + b) / 3;
            }

            if (invert) {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }

            outData[idx] = r;
            outData[idx + 1] = g;
            outData[idx + 2] = b;
            outData[idx + 3] = a;
        }
    }
};

const konvolusi5x5 = (inData, outData, width, height, kernel, alpha, invert, mono) => {
    let idx, r, g, b, a,
        pyc, pyp, pyn, pypp, pynn,
        pxc, pxp, pxn, pxpp, pxnn,
        x, y;
    const n = width * height * 4,

        k00 = kernel[0][0], k01 = kernel[0][1], k02 = kernel[0][2], k03 = kernel[0][3], k04 = kernel[0][4],
        k10 = kernel[1][0], k11 = kernel[1][1], k12 = kernel[1][2], k13 = kernel[1][3], k14 = kernel[1][4],
        k20 = kernel[2][0], k21 = kernel[2][1], k22 = kernel[2][2], k23 = kernel[2][3], k24 = kernel[2][4],
        k30 = kernel[3][0], k31 = kernel[3][1], k32 = kernel[3][2], k33 = kernel[3][3], k34 = kernel[3][4],
        k40 = kernel[4][0], k41 = kernel[4][1], k42 = kernel[4][2], k43 = kernel[4][3], k44 = kernel[4][4];
    let p00, p01, p02, p03, p04,
        p10, p11, p12, p13, p14,
        p20, p21, p22, p23, p24,
        p30, p31, p32, p33, p34,
        p40, p41, p42, p43, p44;

    for (y = 0; y < height; ++y) {
        pyc = y * width * 4;
        pyp = pyc - width * 4;
        pypp = pyc - width * 4 * 2;
        pyn = pyc + width * 4;
        pynn = pyc + width * 4 * 2;

        if (y < 1) pyp = pyc;
        if (y >= width - 1) pyn = pyc;
        if (y < 2) pypp = pyp;
        if (y >= width - 2) pynn = pyn;

        for (x = 0; x < width; ++x) {
            idx = (y * width + x) * 4;

            pxc = x * 4;
            pxp = pxc - 4;
            pxn = pxc + 4;
            pxpp = pxc - 8;
            pxnn = pxc + 8;

            if (x < 1) pxp = pxc;
            if (x >= width - 1) pxn = pxc;
            if (x < 2) pxpp = pxp;
            if (x >= width - 2) pxnn = pxn;

            p00 = pypp + pxpp;
            p01 = pypp + pxp;
            p02 = pypp + pxc;
            p03 = pypp + pxn;
            p04 = pypp + pxnn;
            p10 = pyp + pxpp;
            p11 = pyp + pxp;
            p12 = pyp + pxc;
            p13 = pyp + pxn;
            p14 = pyp + pxnn;
            p20 = pyc + pxpp;
            p21 = pyc + pxp;
            p22 = pyc + pxc;
            p23 = pyc + pxn;
            p24 = pyc + pxnn;
            p30 = pyn + pxpp;
            p31 = pyn + pxp;
            p32 = pyn + pxc;
            p33 = pyn + pxn;
            p34 = pyn + pxnn;
            p40 = pynn + pxpp;
            p41 = pynn + pxp;
            p42 = pynn + pxc;
            p43 = pynn + pxn;
            p44 = pynn + pxnn;

            r = inData[p00] * k00 + inData[p01] * k01 + inData[p02] * k02 + inData[p03] * k04 + inData[p02] * k04
                + inData[p10] * k10 + inData[p11] * k11 + inData[p12] * k12 + inData[p13] * k14 + inData[p12] * k14
                + inData[p20] * k20 + inData[p21] * k21 + inData[p22] * k22 + inData[p23] * k24 + inData[p22] * k24
                + inData[p30] * k30 + inData[p31] * k31 + inData[p32] * k32 + inData[p33] * k34 + inData[p32] * k34
                + inData[p40] * k40 + inData[p41] * k41 + inData[p42] * k42 + inData[p43] * k44 + inData[p42] * k44;

            g = inData[p00 + 1] * k00 + inData[p01 + 1] * k01 + inData[p02 + 1] * k02 + inData[p03 + 1] * k04 + inData[p02 + 1] * k04
                + inData[p10 + 1] * k10 + inData[p11 + 1] * k11 + inData[p12 + 1] * k12 + inData[p13 + 1] * k14 + inData[p12 + 1] * k14
                + inData[p20 + 1] * k20 + inData[p21 + 1] * k21 + inData[p22 + 1] * k22 + inData[p23 + 1] * k24 + inData[p22 + 1] * k24
                + inData[p30 + 1] * k30 + inData[p31 + 1] * k31 + inData[p32 + 1] * k32 + inData[p33 + 1] * k34 + inData[p32 + 1] * k34
                + inData[p40 + 1] * k40 + inData[p41 + 1] * k41 + inData[p42 + 1] * k42 + inData[p43 + 1] * k44 + inData[p42 + 1] * k44;

            b = inData[p00 + 2] * k00 + inData[p01 + 2] * k01 + inData[p02 + 2] * k02 + inData[p03 + 2] * k04 + inData[p02 + 2] * k04
                + inData[p10 + 2] * k10 + inData[p11 + 2] * k11 + inData[p12 + 2] * k12 + inData[p13 + 2] * k14 + inData[p12 + 2] * k14
                + inData[p20 + 2] * k20 + inData[p21 + 2] * k21 + inData[p22 + 2] * k22 + inData[p23 + 2] * k24 + inData[p22 + 2] * k24
                + inData[p30 + 2] * k30 + inData[p31 + 2] * k31 + inData[p32 + 2] * k32 + inData[p33 + 2] * k34 + inData[p32 + 2] * k34
                + inData[p40 + 2] * k40 + inData[p41 + 2] * k41 + inData[p42 + 2] * k42 + inData[p43 + 2] * k44 + inData[p42 + 2] * k44;

            if (alpha) {
                a = inData[p00 + 3] * k00 + inData[p01 + 3] * k01 + inData[p02 + 3] * k02 + inData[p03 + 3] * k04 + inData[p02 + 3] * k04
                    + inData[p10 + 3] * k10 + inData[p11 + 3] * k11 + inData[p12 + 3] * k12 + inData[p13 + 3] * k14 + inData[p12 + 3] * k14
                    + inData[p20 + 3] * k20 + inData[p21 + 3] * k21 + inData[p22 + 3] * k22 + inData[p23 + 3] * k24 + inData[p22 + 3] * k24
                    + inData[p30 + 3] * k30 + inData[p31 + 3] * k31 + inData[p32 + 3] * k32 + inData[p33 + 3] * k34 + inData[p32 + 3] * k34
                    + inData[p40 + 3] * k40 + inData[p41 + 3] * k41 + inData[p42 + 3] * k42 + inData[p43 + 3] * k44 + inData[p42 + 3] * k44;
            } else {
                a = inData[idx + 3];
            }

            if (mono) {
                r = g = b = (r + g + b) / 3;
            }

            if (invert) {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }

            outData[idx] = r;
            outData[idx + 1] = g;
            outData[idx + 2] = b;
            outData[idx + 3] = a;
        }
    }
};

/*
 *
 * Konversi Warna
 * - Citra Negatif
 * - Citra Grayscale
 * - Citra Biner
 * - Citra Biner Not
 * - Citra Biner Red
 * - Citra Biner Green
 * - Citra Biner Blue
 * - Citra Sepia
 *
 */

// Citra Negatif
const imgInverse = () => {

    // load original image
    ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i] | 0;
        imgData.data[i + 1] = 255 - imgData.data[i + 1] | 0;
        imgData.data[i + 2] = 255 - imgData.data[i + 2] | 0;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Negatif");

};

// Citra Grayscale
const imgGrayscale = () => {

    // load original image
    ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        // var gr = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
        let gr = imgData.data[i] * 0.299 + imgData.data[i + 1] * 0.587 + imgData.data[i + 2] * 0.114;
        if (gr < 0) gr = 0;
        if (gr > 255) gr = 255;
        imgData.data[i] = gr;
        imgData.data[i + 1] = gr;
        imgData.data[i + 2] = gr;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Keabuan");

};

// Citra Biner
const imgBinary = () => {

    // load original image
    ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        let gr = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        if (gr <= 128) gr = 0;
        if (gr > 128) gr = 255;
        imgData.data[i] = gr;
        imgData.data[i + 1] = gr;
        imgData.data[i + 2] = gr;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Biner");

};

// Citra Biner Operasi Not
const imgBinaryNot = () => {

    // load original image
    // ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        const gr = imgData.data[i];
        imgData.data[i] = (gr === 0) ? 255 : 0;
        imgData.data[i + 1] = (gr === 0) ? 255 : 0;
        imgData.data[i + 2] = (gr === 0) ? 255 : 0;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Biner NOT");

};

// Citra Biner Red
const imgBinaryRed = () => {

    // load original image
    // ctx.drawImage(myImg, 0, 0);
    imgBinary();

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        const gr = imgData.data[i];
        imgData.data[i] = (gr === 0) ? 255 : 0;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Biner Red");

};

// Citra Biner Green
const imgBinaryGreen = () => {

    // load original image
    // ctx.drawImage(myImg, 0, 0);
    imgBinary();

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        const gr = imgData.data[i + 1];
        imgData.data[i] = 0;
        imgData.data[i + 1] = (gr === 0) ? 255 : 0;
        imgData.data[i + 2] = 0;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Biner Green");

};

// Citra Biner Blue
const imgBinaryBlue = () => {

    // load original image
    // ctx.drawImage(myImg, 0, 0);
    imgBinary();

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        const gr = imgData.data[i + 2];
        imgData.data[i] = 0;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = (gr === 0) ? 255 : 0;
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Biner Blue");

};

// Citra Sepia
const imgSepia = () => {

    // load original image
    ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        let red = imgData.data[i];
        let green = imgData.data[i + 1];
        let blue = imgData.data[i + 2];

        red = (red * 0.393) + (green * 0.769) + (blue * 0.189);
        green = (red * 0.349) + (green * 0.686) + (blue * 0.168);
        blue = (red * 0.272) + (green * 0.534) + (blue * 0.131);

        imgData.data[i] = (red < 255) ? red : 255;
        imgData.data[i + 1] = (green < 255) ? green : 255;
        imgData.data[i + 2] = (blue < 255) ? blue : 255;

    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Sepia");

};

// Citra Solarize
const imgSolarize = () => {

    // load original image
    ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    // manipulation
    for (let i = 0; i < imgData.data.length; i += 4) {
        const red = imgData.data[i];
        const green = imgData.data[i + 1];
        const blue = imgData.data[i + 2];

        imgData.data[i] = red > 127 ? 255 - red : red;
        imgData.data[i + 1] = green > 127 ? 255 - green : green;
        imgData.data[i + 2] = blue > 127 ? 255 - blue : blue;

    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Solarize");

};

// Citra Solarize
const imgAscii = () => {

    // ascii replacement
    const asciiChars = "`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    // load original image
    ctx.drawImage(myImg, 0, 0);

    // get image data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);

    let asciiImg = [];

    // manipulation
    let j = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
        const red = imgData.data[i];
        const green = imgData.data[i + 1];
        const blue = imgData.data[i + 2];

        const luminocity = Math.ceil(red * 0.21 + green * 0.72 + blue * 0.07);
        const charIndex = Math.ceil(luminocity / (255 / (asciiChars.length - 1)));
        const char = asciiChars.substr(charIndex, 1);

        if (i % (cvs.width * 4) === 0) {
            asciiImg[++j] = [];
        }

        asciiImg[j].push(char);
    }

    let asciiHtml = '';
    asciiImg.forEach((v) => {
        asciiHtml += v.join('') + "<br/>";
    });

    // show manipulation
    $(cvs).after(`<div class="ascii-box"><div class="img-ascii">${asciiHtml}</div></div>`)
    $(cvs).hide()

    // set title
    $(".imgtitle span").text("Citra to Ascii");
};

const videoAscii = () => {
    clearInterval(intervalVideoAsli);

    $('.ascii-box').remove();
    $(cvs).after(`<div class="ascii-box"><div class="img-ascii"></div></div>`);
    $(cvs).hide();

    setInterval(() => {
        kanvas.width = video.videoWidth;
        kanvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        // const asciiChars = "`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
        // const asciiChars = "@#8&Oo:._";
        const asciiChars = "_.,:;i1tfLCG08@".split('').reverse().join('');
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        let asciiImg = [];

        // manipulation
        let j = 0;
        for (let i = 0; i < imgData.data.length; i += 4) {
            const red = imgData.data[i];
            const green = imgData.data[i + 1];
            const blue = imgData.data[i + 2];
            const alpha = imgData.data[i + 3];

            const luminocity = Math.ceil(red * 0.21 + green * 0.72 + blue * 0.07);
            const charIndex = Math.ceil(luminocity / (255 / (asciiChars.length - 1)));
            const char = asciiChars.substr(charIndex, 1);

            if (i % (cvs.width * 4) === 0) {
                asciiImg[++j] = [];
            }

            // asciiImg[j].push(`<span style="color:rgba(${red}, ${green}, ${blue}, ${alpha})">${char}</span>`);
            asciiImg[j].push(char);
        }

        let asciiHtml = '';

        asciiImg.forEach((v) => {
            asciiHtml += v.join('') + "<br/>";
        });

        $('.img-ascii').html(`${asciiHtml}`);
    }, Math.round(1000 / 30));
}

/*
 *
 * Flipping
 * - Flip Vertikal
 * - Flip Horizontal
 * - Flip All
 *
 */

// Flip Vertikal
const flip_vertikal = () => {

    // reset image
    // ctx.drawImage(myImg, 0, 0);

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let x, y, i, j,
        iWidth = imgData.width,
        iHeight = imgData.height;

    // manipulation
    for (y = 0; y < (iHeight / 2); y++) {
        i = iHeight - 1 - y;
        for (x = 0; x < iWidth; x++) {
            const pixel = ((iWidth * y) + x) * 4,
                mirror = ((iWidth * i) + x) * 4;

            for (let p = 0; p < 4; p++) {
                const temporary = imgData.data[pixel + p];
                imgData.data[pixel + p] = imgData.data[mirror + p];
                imgData.data[mirror + p] = temporary;
            }
        }
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Flip Vertikal");

}

// Flip Horizontal
const flip_horizontal = () => {

    // reset image
    // ctx.drawImage(myImg, 0, 0);

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let x, y, i, j,
        iWidth = imgData.width,
        iHeight = imgData.height;

    // manipulation
    for (y = 0; y < iHeight; y++) {
        for (x = 0; x < (iWidth / 2); x++) {
            j = iWidth - 1 - x;
            const pixel = ((iWidth * y) + x) * 4,
                mirror = ((iWidth * y) + j) * 4;

            for (let p = 0; p < 4; p++) {
                const temporary = imgData.data[pixel + p];
                imgData.data[pixel + p] = imgData.data[mirror + p];
                imgData.data[mirror + p] = temporary;
            }
        }
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Flip Horizontal");

}

// Flip All
const flip_all = () => {

    // reset image
    // ctx.drawImage(myImg, 0, 0);

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let x, y, i, j,
        iWidth = imgData.width,
        iHeight = imgData.height;

    // manipulation
    for (y = 0; y < iHeight; y++) {
        i = iHeight - 1 - y;
        for (x = 0; x < (iWidth / 2); x++) {
            j = iWidth - 1 - x;
            const pixel = ((iWidth * y) + x) * 4,
                mirror = ((iWidth * i) + j) * 4;

            for (let p = 0; p < 4; p++) {
                const temporary = imgData.data[pixel + p];
                imgData.data[pixel + p] = imgData.data[mirror + p];
                imgData.data[mirror + p] = temporary;
            }
        }
    }

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Citra Flip All");

}

/*
 *
 * Deteksi Tepi
 * - Operasi Robert
 * - Operasi Sobel
 * - Operasi Prewitt
 *
 */


// Operasi Robert
const tepi_robert = () => {

    imgGrayscale();

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let p, i, j, temp;
    const tempR = temp = imgData.data;
    const iWidth = imgData.width, iHeight = imgData.height;

    // manipulation
    for (i = 0; i < (iHeight - 1); i++) {
        for (j = 0; j < (iWidth - 1); j++) {

            for (p = 0; p < 3; p++) { // p adalah penentu pixel r, g b

                tempR[((iWidth * i) + j) * 4 + p] =
                    Math.abs(temp[((iWidth * i) + j) * 4 + p] - temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p]) +
                    Math.abs(temp[((iWidth * i) + (j + 1)) * 4 + p] - temp[((iWidth * (i + 1)) + j) * 4 + p]);

            }

        }
    }


    imgData.data = tempR;

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Deteksi Tepi Rebert");
};

// Operasi Sobel
const tepi_sobel = () => {

    // imgGrayscale();

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let p, i, j, temp;
    const tempR = temp = imgData.data;
    const iWidth = imgData.width, iHeight = imgData.height;

    // manipulation
    for (i = 0; i < (iHeight - 1); i++) {
        for (j = 0; j < (iWidth - 1); j++) {

            for (p = 0; p < 3; p++) { // p adalah penentu pixel r, g b

                const sx =
                    (temp[((iWidth * (i - 1)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 0)) + (j - 1)) * 4 + p] * (-2)) +
                    (temp[((iWidth * (i + 1)) + (j - 1)) * 4 + p] * (-1)) +

                    (temp[((iWidth * (i - 1)) + (j + 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i + 0)) + (j + 1)) * 4 + p] * (2)) +
                    (temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p] * (1));

                const sy =
                    (temp[((iWidth * (i - 1)) + (j - 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i - 1)) + (j + 0)) * 4 + p] * (2)) +
                    (temp[((iWidth * (i - 1)) + (j + 1)) * 4 + p] * (1)) +

                    (temp[((iWidth * (i + 1)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 1)) + (j + 0)) * 4 + p] * (-2)) +
                    (temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p] * (-1));

                const hit = 255 - (Math.abs(sx) + Math.abs(sy));
                tempR[((iWidth * i) + j) * 4 + p] = hit;

            }

        }
    }

    imgData.data = tempR;

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Deteksi Tepi Sobel");

};

// Operasi Prewitt
const tepi_prewitt = () => {

    imgGrayscale();

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let p, i, j, temp;
    const tempR = temp = imgData.data;
    const iWidth = imgData.width, iHeight = imgData.height;

    // manipulation
    for (i = 0; i < (iHeight - 1); i++) {
        for (j = 0; j < (iWidth - 1); j++) {

            for (p = 0; p < 3; p++) { // p adalah penentu pixel r, g b

                const sx =
                    (temp[((iWidth * (i - 1)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 0)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 1)) + (j - 1)) * 4 + p] * (-1)) +

                    (temp[((iWidth * (i - 1)) + (j + 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i + 0)) + (j + 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p] * (1));

                const sy =
                    (temp[((iWidth * (i - 1)) + (j - 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i - 1)) + (j + 0)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i - 1)) + (j + 1)) * 4 + p] * (1)) +

                    (temp[((iWidth * (i + 1)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 1)) + (j + 0)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p] * (-1));

                const hit = 255 - (Math.abs(sx) + Math.abs(sy));
                tempR[((iWidth * i) + j) * 4 + p] = hit;

            }

        }
    }


    imgData.data = tempR;

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Deteksi Tepi Prewitt");
};


/*
 *
 * Image Filtering
 *
 */
const filter_gaussian = radius => {

    if ("number" != typeof radius)
        console.log("radius must be a number");
    if (radius < 1)
        console.log("radius must be greater than 0");

    const r = radius,
        rs = Math.ceil(r * 2.57); // significant radius

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const temp = imgData.data, iWidth = imgData.width, iHeight = imgData.height;

    // manipulation
    for (let y = 0; y < iHeight; y++) {
        // console.log("Gaussian: " + Math.round(y / iHeight * 100) + "%");
        for (let x = 0; x < iWidth; x++) {
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let wsum = 0;
            for (let iy = y - rs; iy < y + rs + 1; iy++) {
                for (let ix = x - rs; ix < x + rs + 1; ix++) {
                    const x1 = Math.min(iWidth - 1, Math.max(0, ix));
                    const y1 = Math.min(iHeight - 1, Math.max(0, iy));
                    const dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
                    const wght = Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);
                    var idx = (y1 * iWidth + x1) << 2;
                    red += temp[idx] * wght;
                    green += temp[idx + 1] * wght;
                    blue += temp[idx + 2] * wght;
                    alpha += temp[idx + 3] * wght;
                    wsum += wght;
                }

                var idx = (y * iWidth + x) << 2;
                temp[idx] = Math.round(red / wsum);
                temp[idx + 1] = Math.round(green / wsum);
                temp[idx + 2] = Math.round(blue / wsum);
                temp[idx + 3] = Math.round(alpha / wsum);
            }
        }
    }

    imgData.data = temp;

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Gaussian Blur");

};

const filter_sharpen = () => {

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const temp = imgData.data, iWidth = imgData.width, iHeight = imgData.height;

    const a = 0.3;
    konvolusi3x3(
        imgData.data, temp, iWidth, iHeight,
        [
            [a, a, a],
            [a, 1 - a * 8, a],
            [a, a, a]
        ]
    );

    imgData.data = temp;

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Sharpen");
};

function filter_soften() {

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const temp = imgData.data, iWidth = imgData.width, iHeight = imgData.height;

    const c = 1 / 9;
    konvolusi3x3(
        imgData.data, temp, iWidth, iHeight,
        [
            [c, c, c],
            [c, c, c],
            [c, c, c]
        ]
    );

    imgData.data = temp;

    // show manipulation
    ctx.putImageData(imgData, 0, 0);

    // set title
    $(".imgtitle span").text("Soften");
}

/*
 *
 * Histogram Citra
 *
 */

const histogram = function (){

    $("#hist").hide();
    $("#bar-chart").css("width", "99.5%");
    $("#bar-chart").css("height", "500px");

    // load original image
    // ctx.drawImage(myImg, 0, 0);

    // read img data
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const hist = {"red": [], "green": [], "blue": []};
    const pr = [], prrk = {"red": [], "green": [], "blue": []};
    for (let n = 0; n <= 255; n++) {
        hist.red.push(0);
        hist.green.push(0);
        hist.blue.push(0);
        prrk.red.push(0);
        prrk.green.push(0);
        prrk.blue.push(0);
        pr.push(n / 255);
    }

    // hitung nk
    for (let i = 0; i < imgData.data.length; i += 4) {
        for (let n = 0; n <= 255; n++) {
            if (imgData.data[i] === n) hist.red[n]++;
            if (imgData.data[i + 1] === n) hist.green[n]++;
            if (imgData.data[i + 2] === n) hist.blue[n]++;
        }

    }

    // Pr(rk)
    for (let i = 0; i < 3; i++) {
        for (let n = 0; n <= 255; n++) {
            if (i === 0) prrk.red[n] = hist.red[n] / (imgData.data.length / 4);
            if (i === 1) prrk.green[n] = hist.green[n] / (imgData.data.length / 4);
            if (i === 2) prrk.blue[n] = hist.blue[n] / (imgData.data.length / 4);
        }
    }

    /* Bar Chart starts */

    const d1 = [];
    for (let i = 0; i <= 255; i += 1){
        d1.push([i, hist.red[i]]);
    }

    const d2 = [];
    for (let i = 0; i <= 255; i += 1){
        d2.push([i, hist.green[i]]);
    }

    const d3 = [];
    for (let i = 0; i <= 255; i += 1){
        d3.push([i, hist.blue[i]]);
    }

    let stack = 0, bars = true, lines = false, steps = false;

    function plotWithOptions() {
        $.plot($("#bar-chart"), [d1, d2, d3], {
            series: {
                stack: stack,
                lines: {show: lines, fill: true, steps: steps},
                bars: {show: bars, barWidth: 0.8}
            },
            grid: {
                borderWidth: 0, hoverable: true, color: "#777"
            },
            colors: ["#FF0000", "#00FF00", "#0000FF"],
            bars: {
                show: true,
                lineWidth: 0,
                fill: true,
                fillColor: {colors: [{opacity: 0.9}, {opacity: 0.8}]}
            }
        });
    }

    plotWithOptions();

    $(".stackControls input").click(function (e) {
        e.preventDefault();
        stack = $(this).val() === "With stacking" ? true : null;
        plotWithOptions();
    });
    $(".graphControls input").click(function (e) {
        e.preventDefault();
        bars = $(this).val().indexOf("Bars") !== -1;
        lines = $(this).val().indexOf("Lines") !== -1;
        steps = $(this).val().indexOf("steps") !== -1;
        plotWithOptions();
    });

    /* Bar chart ends */
    $("#hist").slideDown('400');

};

// });

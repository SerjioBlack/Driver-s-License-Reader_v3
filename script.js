var webkam = {
    // (A) INITIALIZE
    worker : null, // tesseract worker
    hVid : null, hGo :null, hRes : null, // html elements
    init : () => {
      // (A1) GET HTML ELEMENTS
      webkam.hVid = document.getElementById("vid"),
      webkam.hGo = document.getElementById("go"),
      webkam.hRes = document.getElementById("result");
  
      // (A2) GET USER PERMISSION TO ACCESS CAMERA
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(async (stream) => {
        // (A2-1) CREATE ENGLISH TESSERACT WORKER
        webkam.worker = await Tesseract.createWorker();
        await webkam.worker.loadLanguage("eng");
        await webkam.worker.initialize("eng");
  
        // (A2-2) WEBCAM LIVE STREAM
        webkam.hVid.srcObject = stream;
        webkam.hGo.onclick = webkam.snap;
      })
      .catch(err => console.error(err));
    },
  
    // (B) SNAP VIDEO FRAME TO TEXT
    snap : async () => {
      // (B1) CREATE NEW CANVAS
      let canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d"),
          vWidth = webkam.hVid.videoWidth,
          vHeight = webkam.hVid.videoHeight;
    
      // (B2) CAPTURE VIDEO FRAME TO CANVAS
      canvas.width = vWidth;
      canvas.height = vHeight;
      ctx.drawImage(webkam.hVid, 0, 0, vWidth, vHeight); 
  
      // (B3) CANVAS TO IMAGE, IMAGE TO TEXT
      const imageData = ctx.getImageData(0, 0, vWidth, vHeight);
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log(m), // Enable logging
        tessedit_char_blacklist: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', // Exclude characters that are not useful
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', // Restrict characters to only alphanumeric
        preserve_interword_spaces: '1', // Preserve spaces between words
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
        tessedit_ocr_engine_mode: '3', // Use LSTM OCR engine
        tessedit_do_invert: '0' // Do not invert the image
      });
  
      // Remove newlines and other control characters from the result
      const cleanText = result.data.text.replace(/[\n\r\t]+/g, ' ');
  
      // Set the cleaned text to the result textarea
      webkam.hRes.value = cleanText;
    },
  };
  
  window.addEventListener("load", webkam.init);
  
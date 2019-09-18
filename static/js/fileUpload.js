$(function(){

    /**
     * New Ajax Upload File
     * Use FormData instead of hidden iframe, works on Chrome & FF.
     */
    function AjaxUploadNew(btn, conf) {
            if (btn instanceof jQuery) { btn = btn[0]; } // unwrap
            if (!btn) { return; } // if in admin page

            btn.addEventListener("click", (e) => {
                e.preventDefault();

                let fileInput = document.createElement("input");
                fileInput.setAttribute("type", "file");
                fileInput.onchange = function(e2) {
                    // chosen a file
                    let file = fileInput.files[0];
                    let ext = getExt(file.name);
                    conf.onChange && conf.onChange(file, ext);

                    // construct form datagram
                    let formData = new FormData();
                    formData.append(conf.name, file);

                    // ajax post
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', conf.action, true);
                    xhr.onreadystatechange = function () {
                        if(xhr.readyState === 4 && xhr.status === 200) {
                            let url = xhr.responseText.match(/<body>(.+)<\/body>/i)[1];
                            console.log(url);
                            conf.onComplete && conf.onComplete(file, url);
                        }
                    };

                    // cancel submit if callback returns false
                    if (conf.onSubmit) {
                        let ret = conf.onSubmit(file, ext);
                        if (typeof ret === "undefined" || !!ret) {
                            xhr.send(formData);
                        } else {
                            xhr.abort();
                        }
                    } else {
                        xhr.send(formData);
                    }
                }

                // open file dialog
                fileInput.click();
            });

            // get file extension
            function getExt(file){
                return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
            }
        }

    var info = {
      action: '../fileUpload/',
      name: 'uploadfile', 
      onSubmit: function(file, ext){ // On submit we do nothing, it'd be nice to do something but mheh..
      //console.log('Starting...');
      },
      onComplete: function(file, response){
        // Require the editor..
        var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

        // result i.e. "/up/c79133b2c8a97533cc397f8d325ce17a.jpg", trimmed whitespace
        var filePath = response.slice(response.indexOf("/up")).trim();
        // "http://example.com/subfolder/p/padID" -> "http://example.com/subfolder"
        var etherpadRoot = document.location.href.slice(0, document.location.href.indexOf("/p/"));
        // "http://example.com/subfolder/up/c79133b2c8a97533cc397f8d325ce17a.jpg"
        var fileUri = etherpadRoot + filePath;

        // Puts the actual URL in the pad..
        padeditor.ace.replaceRange(undefined, undefined, " " + fileUri + " ");
        // Put the caret back into the pad
        padeditor.ace.focus();
      }
    };

    if (!! window.FormData) {
        // ajax upload from formData
        AjaxUploadNew($('#uploadFileSubmit'), info);
    } else {
        // ajax upload to hidden iframe
        new AjaxUpload($('#uploadFileSubmit'), info);
    }
});

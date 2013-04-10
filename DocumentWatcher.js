/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, setTimeout, clearTimeout */

define(function (require, exports, module) {
    "use strict";
    
    var DELAY_FOR_THROTTLING_ERROR_CHECKING = 500;
    
    var ContinuousCompilationController = require("ContinuousCompilationController"),
        documentToWatch,
        timer = null;
    
    
    function _cancelCompilation() {
        clearTimeout(timer);
    }


    function _runDelayedCompilationForDocument(documentToWatch) {
        //
        // Run this in a timer so that we modify a document without getting
        // all kinds of noise in the document in the middle of typing, which
        // can be rather distracting.
        //

        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        timer = setTimeout(function () {
            timer = null;

            documentToWatch._ensureMasterEditor();
            documentToWatch._masterEditor._codeMirror.operation(function () {
                ContinuousCompilationController.compileCodeAndDisplayErrors(documentToWatch.getText());
            });

        }, DELAY_FOR_THROTTLING_ERROR_CHECKING);
    }
    
    function setDocumentToWatch(newDocumentToWatch) {
        _cancelCompilation();

        if (documentToWatch) {
            $(documentToWatch).off("change.ContinuousCompilationController");
            documentToWatch.releaseRef();
        }
        
        if (!newDocumentToWatch) {
            documentToWatch = null;
        } else {
            if (newDocumentToWatch.getLanguage()._name !== "JavaScript") {
                documentToWatch = null;
            } else {
                documentToWatch = newDocumentToWatch;
            }
        }
        
        if (!documentToWatch) {
            ContinuousCompilationController.setCodeMirrorToAddHighlightsTo(null);
            ContinuousCompilationController.compileCodeAndDisplayErrors(null);
        } else {
            documentToWatch.addRef();
            $(documentToWatch).on("change.ContinuousCompilationController", function () {
                _runDelayedCompilationForDocument(documentToWatch);
            });

            documentToWatch._ensureMasterEditor();
            ContinuousCompilationController.setCodeMirrorToAddHighlightsTo(documentToWatch._masterEditor._codeMirror);
            _runDelayedCompilationForDocument(documentToWatch);
        }
    }
    
    
    exports.setDocumentToWatch = setDocumentToWatch;
});